import pytest
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.roles import Perm, Role
from apps.factories import TEST_PASSWORD, UserFactory

pytestmark = pytest.mark.django_db

LOGIN, REFRESH, LOGOUT, ME = (
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/auth/me",
)


def login(client, username, password=TEST_PASSWORD):
    return client.post(LOGIN, {"username": username, "password": password})


def test_login_returns_token_pair_and_profile(api_client):
    UserFactory(username="priya", roles=[Role.OPERATIONS_MANAGER])

    res = login(api_client, "priya")

    assert res.status_code == 200
    body = res.json()
    assert body["access"] and body["refresh"]
    user = body["user"]
    assert user["username"] == "priya"
    assert user["roles"] == ["Operations Manager"]
    assert user["role"] == "Operations Manager"
    assert Perm.PROPERTIES_WRITE in user["permissions"]
    assert Perm.USERS_WRITE not in user["permissions"]
    assert set(user) >= {"id", "name", "email", "status", "createdAt"}


def test_login_username_is_case_insensitive(api_client):
    UserFactory(username="chris")
    assert login(api_client, "  CHRIS ").status_code == 200


@pytest.mark.parametrize("username,password", [("chris", "wrong-password"), ("nobody", "x")])
def test_login_rejects_bad_credentials_with_generic_message(api_client, username, password):
    UserFactory(username="chris")

    res = login(api_client, username, password)

    assert res.status_code == 401
    assert res.json()["message"] == "Invalid username or password."


def test_login_rejects_inactive_user(api_client):
    UserFactory(username="gone", is_active=False)
    assert login(api_client, "gone").status_code == 401


def test_me_requires_authentication(api_client):
    res = api_client.get(ME)
    assert res.status_code == 401
    assert res.json()["message"]


def test_me_returns_current_user(api_client):
    UserFactory(username="sam", roles=[Role.VIEWER])
    access = login(api_client, "sam").json()["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    res = api_client.get(ME)

    assert res.status_code == 200
    assert res.json()["username"] == "sam"
    assert Perm.TICKETS_CREATE not in res.json()["permissions"]


def test_invalid_access_token_is_rejected(api_client):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer not-a-jwt")
    assert api_client.get(ME).status_code == 401


def test_refresh_rotates_and_blacklists_old_token(api_client):
    UserFactory(username="priya")
    old_refresh = login(api_client, "priya").json()["refresh"]

    first = api_client.post(REFRESH, {"refresh": old_refresh})
    assert first.status_code == 200
    assert first.json()["access"]
    assert first.json()["refresh"] != old_refresh

    reused = api_client.post(REFRESH, {"refresh": old_refresh})
    assert reused.status_code == 401


def test_logout_blacklists_refresh_token(api_client):
    UserFactory(username="priya")
    refresh = login(api_client, "priya").json()["refresh"]

    assert api_client.post(LOGOUT, {"refresh": refresh}).status_code == 204
    assert api_client.post(REFRESH, {"refresh": refresh}).status_code == 401


def test_logout_is_idempotent_for_invalid_tokens(api_client):
    assert api_client.post(LOGOUT, {"refresh": "garbage"}).status_code == 204


def test_deactivated_user_tokens_stop_working(api_client):
    user = UserFactory()
    refresh = RefreshToken.for_user(user)
    user.is_active = False
    user.save()

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    assert api_client.get(ME).status_code == 401
    api_client.credentials()
    assert api_client.post(REFRESH, {"refresh": str(refresh)}).status_code == 401


def test_password_change_revokes_existing_tokens(api_client):
    user = UserFactory()
    access = RefreshToken.for_user(user).access_token
    user.set_password("A-brand-new-pass-123")
    user.save()

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    assert api_client.get(ME).status_code == 401


def test_login_is_throttled(api_client, monkeypatch):
    from django.core.cache import cache
    from rest_framework.throttling import ScopedRateThrottle

    monkeypatch.setattr(ScopedRateThrottle, "THROTTLE_RATES", {"login": "2/min"})
    cache.clear()
    UserFactory(username="chris")

    codes = [login(api_client, "chris", "wrong").status_code for _ in range(3)]

    assert codes == [401, 401, 429]


def test_spoofed_forwarded_for_does_not_bypass_throttle(api_client, monkeypatch, settings):
    from django.core.cache import cache
    from rest_framework.throttling import ScopedRateThrottle

    monkeypatch.setattr(ScopedRateThrottle, "THROTTLE_RATES", {"login": "2/min"})
    cache.clear()

    codes = [
        api_client.post(
            LOGIN,
            {"username": "x", "password": "y"},
            HTTP_X_FORWARDED_FOR=f"10.0.0.{n}",
        ).status_code
        for n in range(3)
    ]

    assert codes[-1] == 429
