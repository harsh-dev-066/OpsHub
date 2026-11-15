"""Server-side RBAC: every role x endpoint combination."""

import pytest

from apps.accounts.roles import Role
from apps.factories import PropertyFactory, TicketFactory, UnitFactory, UserFactory

pytestmark = pytest.mark.django_db

ADMIN, MANAGER, AGENT, VIEWER = (
    Role.ADMIN,
    Role.OPERATIONS_MANAGER,
    Role.SUPPORT_AGENT,
    Role.VIEWER,
)
EVERYONE = {ADMIN, MANAGER, AGENT, VIEWER}


@pytest.fixture
def world():
    prop = PropertyFactory()
    unit = UnitFactory(property=prop)
    ticket = TicketFactory(property=prop)
    user = UserFactory(roles=[VIEWER])
    return {"prop": prop, "unit": unit, "ticket": ticket, "user": user}


READS = [
    "/api/dashboard/summary",
    "/api/dashboard/occupancy",
    "/api/dashboard/tickets-by-priority",
    "/api/dashboard/tickets-by-status",
    "/api/dashboard/activity",
    "/api/properties",
    "/api/properties/{prop}",
    "/api/properties/{prop}/units",
    "/api/properties/{prop}/tickets",
    "/api/meta/cities",
    "/api/units",
    "/api/units/{unit}",
    "/api/residents",
    "/api/contracts",
    "/api/tickets",
    "/api/tickets/{ticket}",
    "/api/users",
    "/api/users/{user}",
]


def _fmt(path, world):
    return path.format(
        prop=world["prop"].pk,
        unit=world["unit"].pk,
        ticket=world["ticket"].pk,
        user=world["user"].pk,
    )


@pytest.mark.parametrize("role", sorted(EVERYONE))
@pytest.mark.parametrize("path", READS)
def test_every_role_can_read(make_client, world, role, path):
    res = make_client(role).get(_fmt(path, world))
    assert res.status_code == 200, res.content


WRITES = [
    # (method, path, payload builder, roles allowed)
    (
        "post",
        "/api/properties",
        lambda w: {"name": "N", "city": "C", "country": "X", "address": "A"},
        {ADMIN, MANAGER},
    ),
    ("patch", "/api/properties/{prop}", lambda w: {"manager": "Someone"}, {ADMIN, MANAGER}),
    (
        "post",
        "/api/units",
        lambda w: {
            "propertyId": w["prop"].pk,
            "unitNumber": "999",
            "type": "studio",
            "floor": 9,
            "monthlyRate": 1000,
        },
        {ADMIN, MANAGER},
    ),
    ("patch", "/api/units/{unit}", lambda w: {"status": "maintenance"}, {ADMIN, MANAGER}),
    (
        "post",
        "/api/tickets",
        lambda w: {
            "title": "Broken door",
            "description": "Door is broken.",
            "category": "maintenance",
            "priority": "high",
            "propertyId": w["prop"].pk,
        },
        {ADMIN, MANAGER, AGENT},
    ),
    ("patch", "/api/tickets/{ticket}", lambda w: {"title": "Renamed"}, {ADMIN, MANAGER, AGENT}),
    (
        "patch",
        "/api/tickets/{ticket}",
        lambda w: {"status": "in_progress"},
        {ADMIN, MANAGER, AGENT},
    ),
    (
        "post",
        "/api/users",
        lambda w: {
            "name": "N",
            "email": "n@example.com",
            "username": "nnn",
            "password": "Strong-pass-2024",
            "roles": ["Viewer"],
        },
        {ADMIN},
    ),
    ("patch", "/api/users/{user}", lambda w: {"name": "Renamed"}, {ADMIN}),
]


@pytest.mark.parametrize("role", sorted(EVERYONE))
@pytest.mark.parametrize(
    "method,path,payload,allowed", WRITES, ids=[f"{m} {p}" for m, p, *_ in WRITES]
)
def test_write_permissions(make_client, world, role, method, path, payload, allowed):
    client = make_client(role)
    res = getattr(client, method)(_fmt(path, world), payload(world))
    if role in allowed:
        assert res.status_code in (200, 201), res.content
    else:
        assert res.status_code == 403, res.content
        assert res.json()["message"]


def test_inactive_user_has_no_permissions(make_client):
    client = make_client(ADMIN, is_active=False)
    assert client.get("/api/properties").status_code == 401
