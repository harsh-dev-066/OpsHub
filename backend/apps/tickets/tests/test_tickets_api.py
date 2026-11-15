from datetime import timedelta

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.utils import timezone

from apps.accounts.roles import ROLE_PERMISSIONS, Perm, Role
from apps.activity.models import ActivityItem
from apps.factories import PropertyFactory, TicketFactory, UnitFactory, UserFactory
from apps.tickets.models import Ticket

pytestmark = pytest.mark.django_db

TICKET_KEYS = {
    "id", "propertyId", "unitId", "title", "description", "category", "priority",
    "status", "assignee", "assigneeId", "createdAt", "updatedAt",
}  # fmt: skip


def payload(prop, **overrides):
    return {
        "title": "AC not cooling",
        "description": "The AC in the living room is blowing warm air.",
        "category": "maintenance",
        "priority": "high",
        "propertyId": prop.pk,
        **overrides,
    }


def test_create_ticket(agent_client):
    prop = PropertyFactory()
    unit = UnitFactory(property=prop)
    assignee = UserFactory(name="Priya Shah", roles=[Role.OPERATIONS_MANAGER])

    res = agent_client.post("/api/tickets", payload(prop, unitId=unit.pk, assigneeId=assignee.pk))

    assert res.status_code == 201, res.content
    body = res.json()
    assert set(body) == TICKET_KEYS
    assert body["status"] == "open"
    assert body["assignee"] == "Priya Shah"
    assert body["assigneeId"] == assignee.pk
    ticket = Ticket.objects.get(pk=body["id"])
    assert ticket.created_by == agent_client.user
    activity = ActivityItem.objects.get(entity_id=ticket.pk)
    assert activity.message == 'Ticket "AC not cooling" created'
    assert activity.actor == agent_client.user


def test_unit_must_belong_to_property(agent_client):
    prop = PropertyFactory()
    foreign_unit = UnitFactory()
    res = agent_client.post("/api/tickets", payload(prop, unitId=foreign_unit.pk))
    assert res.status_code == 400
    assert "Unit does not belong" in res.json()["message"]


def test_inactive_assignee_rejected(agent_client):
    prop = PropertyFactory()
    inactive = UserFactory(is_active=False)
    res = agent_client.post("/api/tickets", payload(prop, assigneeId=inactive.pk))
    assert res.status_code == 400
    assert "active user" in res.json()["message"]


@pytest.mark.parametrize(
    "overrides",
    [{"title": "ab"}, {"title": "x" * 121}, {"priority": "urgent"}, {"propertyId": "prop-x"}],
)
def test_create_validation(agent_client, overrides):
    assert (
        agent_client.post("/api/tickets", payload(PropertyFactory(), **overrides)).status_code
        == 400
    )


def test_status_transition_logs_activity_and_bumps_updated_at(agent_client):
    ticket = TicketFactory(updated_at=timezone.now() - timedelta(days=3))
    before = ticket.updated_at

    res = agent_client.patch(f"/api/tickets/{ticket.pk}", {"status": "in_progress"})

    assert res.status_code == 200
    assert res.json()["status"] == "in_progress"
    ticket.refresh_from_db()
    assert ticket.updated_at > before
    assert ActivityItem.objects.get(entity_id=ticket.pk).message.endswith("marked in progress")


def test_edit_changes_property_and_validates_existing_unit(agent_client):
    old_prop = PropertyFactory()
    ticket = TicketFactory(property=old_prop, unit=UnitFactory(property=old_prop))
    new_prop = PropertyFactory()

    stale = agent_client.patch(f"/api/tickets/{ticket.pk}", {"propertyId": new_prop.pk})
    assert stale.status_code == 400

    ok = agent_client.patch(
        f"/api/tickets/{ticket.pk}", {"propertyId": new_prop.pk, "unitId": None}
    )
    assert ok.status_code == 200
    assert ok.json()["propertyId"] == new_prop.pk
    assert ok.json()["unitId"] is None


def test_unassign(agent_client):
    ticket = TicketFactory(assignee=UserFactory())
    res = agent_client.patch(f"/api/tickets/{ticket.pk}", {"assigneeId": None})
    assert res.json()["assignee"] is None


def test_transition_only_role_cannot_edit_fields(make_client, monkeypatch):
    monkeypatch.setitem(
        ROLE_PERMISSIONS,
        Role.SUPPORT_AGENT,
        ROLE_PERMISSIONS[Role.SUPPORT_AGENT] - {Perm.TICKETS_EDIT},
    )
    client = make_client(Role.SUPPORT_AGENT)
    ticket = TicketFactory()

    assert client.patch(f"/api/tickets/{ticket.pk}", {"status": "waiting"}).status_code == 200
    denied = client.patch(f"/api/tickets/{ticket.pk}", {"title": "New title"})
    assert denied.status_code == 403
    assert denied.json()["message"] == "You do not have permission to edit tickets."


def test_edit_only_role_cannot_transition(make_client, monkeypatch):
    monkeypatch.setitem(
        ROLE_PERMISSIONS,
        Role.SUPPORT_AGENT,
        ROLE_PERMISSIONS[Role.SUPPORT_AGENT] - {Perm.TICKETS_TRANSITION},
    )
    client = make_client(Role.SUPPORT_AGENT)
    ticket = TicketFactory()

    assert client.patch(f"/api/tickets/{ticket.pk}", {"title": "Renamed"}).status_code == 200
    assert client.patch(f"/api/tickets/{ticket.pk}", {"status": "closed"}).status_code == 403


def test_list_default_sort_filters_and_search(viewer_client):
    now = timezone.now()
    old = TicketFactory(title="Leaking faucet", updated_at=now - timedelta(days=5))
    new = TicketFactory(title="Door lock jammed", updated_at=now, priority="critical")
    TicketFactory(
        title="Noise complaint",
        status="closed",
        category="noise",
        updated_at=now - timedelta(days=1),
    )

    data = viewer_client.get("/api/tickets").json()["data"]
    assert data[0]["id"] == new.pk  # updatedAt desc by default

    def ids(query):
        return [t["id"] for t in viewer_client.get(f"/api/tickets?{query}").json()["data"]]

    assert ids("priority=critical") == [new.pk]
    assert len(ids("status=closed&category=noise")) == 1
    assert ids("search=faucet") == [old.pk]
    assert ids(f"search={old.pk}") == [old.pk]


def test_sort_by_priority_is_by_severity(viewer_client):
    for p in ["medium", "critical", "low", "high"]:
        TicketFactory(priority=p)
    data = viewer_client.get("/api/tickets?sortBy=priority&sortDirection=desc").json()["data"]
    assert [t["priority"] for t in data] == ["critical", "high", "medium", "low"]


def test_list_query_count_is_constant(viewer_client):
    for _ in range(10):
        TicketFactory(assignee=UserFactory())
    with CaptureQueriesContext(connection) as ctx:
        viewer_client.get("/api/tickets?pageSize=50")
    assert len(ctx.captured_queries) <= 4


def test_detail_embeds_property_and_unit(viewer_client):
    prop = PropertyFactory()
    unit = UnitFactory(property=prop)
    ticket = TicketFactory(property=prop, unit=unit)

    body = viewer_client.get(f"/api/tickets/{ticket.pk}").json()

    assert set(body) >= TICKET_KEYS
    assert body["property"]["id"] == prop.pk
    assert body["property"]["totalUnits"] == 1
    assert body["unit"]["id"] == unit.pk


def test_detail_without_unit(viewer_client):
    ticket = TicketFactory()
    assert viewer_client.get(f"/api/tickets/{ticket.pk}").json()["unit"] is None
