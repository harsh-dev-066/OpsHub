import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.roles import Role
from apps.factories import UserFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


def authenticate(client: APIClient, user) -> APIClient:
    """Attach a real JWT so tests exercise the production auth path."""
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def make_client():
    def _make(*roles: str, **user_kwargs) -> APIClient:
        user = UserFactory(roles=list(roles) or [Role.VIEWER], **user_kwargs)
        client = authenticate(APIClient(), user)
        client.user = user
        return client

    return _make


@pytest.fixture
def admin_client(make_client):
    return make_client(Role.ADMIN)


@pytest.fixture
def manager_client(make_client):
    return make_client(Role.OPERATIONS_MANAGER)


@pytest.fixture
def agent_client(make_client):
    return make_client(Role.SUPPORT_AGENT)


@pytest.fixture
def viewer_client(make_client):
    return make_client(Role.VIEWER)
