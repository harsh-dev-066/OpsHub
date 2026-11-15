import pytest

from apps.accounts.models import User
from apps.accounts.roles import Role
from apps.factories import UserFactory

pytestmark = pytest.mark.django_db

USERS = "/api/users"


def new_user_payload(**overrides):
    payload = {
        "name": "New Operator",
        "email": "new.operator@opshub.app",
        "username": "newop",
        "password": "Strong-pass-2024",
        "roles": ["Support Agent"],
    }
    return {**payload, **overrides}


def test_list_returns_plain_array_for_any_reader(viewer_client):
    res = viewer_client.get(USERS)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert {"id", "name", "email", "username", "roles", "status", "createdAt"} <= set(res.json()[0])
    assert "password" not in res.json()[0]


def test_admin_creates_user_who_can_then_log_in(admin_client, api_client):
    res = admin_client.post(USERS, new_user_payload(username="NewOp"))

    assert res.status_code == 201
    assert res.json()["username"] == "newop"
    assert res.json()["status"] == "active"
    login = api_client.post(
        "/api/auth/login", {"username": "newop", "password": "Strong-pass-2024"}
    )
    assert login.status_code == 200


@pytest.mark.parametrize("fixture", ["manager_client", "agent_client", "viewer_client"])
def test_non_admins_cannot_create_users(request, fixture):
    client = request.getfixturevalue(fixture)
    assert client.post(USERS, new_user_payload()).status_code == 403


def test_duplicate_username_conflicts(admin_client):
    UserFactory(username="newop")
    res = admin_client.post(USERS, new_user_payload())
    assert res.status_code == 409
    assert res.json()["message"] == "Username is already taken."


def test_duplicate_email_conflicts_case_insensitively(admin_client):
    UserFactory(email="new.operator@opshub.app")
    res = admin_client.post(USERS, new_user_payload(email="NEW.Operator@opshub.app"))
    assert res.status_code == 409
    assert res.json()["message"] == "Email is already in use."


def test_admin_role_cannot_be_assigned(admin_client):
    res = admin_client.post(USERS, new_user_payload(roles=["Admin"]))
    assert res.status_code == 400
    assert "Admin role cannot be assigned" in res.json()["message"]


def test_at_least_one_role_required(admin_client):
    res = admin_client.post(USERS, new_user_payload(roles=[]))
    assert res.status_code == 400
    assert "Assign at least one role." in res.json()["message"]


def test_weak_password_rejected(admin_client):
    res = admin_client.post(USERS, new_user_payload(password="password"))
    assert res.status_code == 400
    assert "password" in res.json()["errors"]


def test_update_user_roles_and_status(admin_client):
    user = UserFactory(roles=[Role.VIEWER])

    res = admin_client.patch(
        f"{USERS}/{user.pk}", {"roles": ["Support Agent", "Viewer"], "status": "inactive"}
    )

    assert res.status_code == 200
    assert res.json()["roles"] == ["Support Agent", "Viewer"]
    assert res.json()["status"] == "inactive"
    user.refresh_from_db()
    assert user.is_active is False


def test_admin_password_reset(admin_client, api_client):
    user = UserFactory(username="resetme")
    res = admin_client.patch(f"{USERS}/{user.pk}", {"password": "Another-strong-77"})
    assert res.status_code == 200
    login = api_client.post(
        "/api/auth/login", {"username": "resetme", "password": "Another-strong-77"}
    )
    assert login.status_code == 200


def test_system_admin_account_is_locked(admin_client):
    other_admin = UserFactory(roles=[Role.ADMIN])
    res = admin_client.patch(f"{USERS}/{other_admin.pk}", {"name": "Hacked"})
    assert res.status_code == 403
    assert res.json()["message"] == "The system admin account cannot be modified."


def test_username_is_immutable(admin_client):
    user = UserFactory()
    res = admin_client.patch(f"{USERS}/{user.pk}", {"username": "renamed"})
    assert res.status_code == 400


def test_update_email_conflict(admin_client):
    UserFactory(email="taken@example.com")
    user = UserFactory()
    res = admin_client.patch(f"{USERS}/{user.pk}", {"email": "TAKEN@example.com"})
    assert res.status_code == 409


def test_unknown_user_is_404(admin_client):
    res = admin_client.get(f"{USERS}/user-missing")
    assert res.status_code == 404
    assert res.json()["message"]


def test_delete_is_not_allowed(admin_client):
    user = UserFactory()
    assert admin_client.delete(f"{USERS}/{user.pk}").status_code == 405
    assert User.objects.filter(pk=user.pk).exists()
