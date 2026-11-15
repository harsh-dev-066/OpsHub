from datetime import date, timedelta

import pytest
from django.utils import timezone

from apps.activity.models import ActivityItem
from apps.dashboard import selectors
from apps.factories import (
    ContractFactory,
    PropertyFactory,
    ResidentFactory,
    TicketFactory,
    UnitFactory,
)
from apps.leasing.models import Contract

pytestmark = pytest.mark.django_db


def test_summary(viewer_client):
    prop = PropertyFactory()
    PropertyFactory()
    for status in ["occupied", "occupied", "occupied", "available", "maintenance"]:
        UnitFactory(property=prop, status=status)
    for status in ["open", "in_progress", "waiting", "resolved", "closed"]:
        TicketFactory(property=prop, status=status)

    body = viewer_client.get("/api/dashboard/summary").json()

    assert body == {
        "occupancyRate": 60.0,
        "availableUnits": 1,
        "maintenanceUnits": 1,
        "openTickets": 3,
        "totalProperties": 2,
        "totalUnits": 5,
    }


def test_summary_with_no_units(viewer_client):
    assert viewer_client.get("/api/dashboard/summary").json()["occupancyRate"] == 0


def test_breakdowns_are_zero_filled_and_ordered(viewer_client):
    TicketFactory(priority="high", status="open")
    TicketFactory(priority="high", status="closed")

    priority = viewer_client.get("/api/dashboard/tickets-by-priority").json()
    status = viewer_client.get("/api/dashboard/tickets-by-status").json()

    assert priority == [
        {"name": "low", "value": 0},
        {"name": "medium", "value": 0},
        {"name": "high", "value": 2},
        {"name": "critical", "value": 0},
    ]
    assert [s["name"] for s in status] == ["open", "in_progress", "waiting", "resolved", "closed"]
    assert sum(s["value"] for s in status) == 2


def test_occupancy_trend_counts_overlapping_contracts():
    today = date(2026, 6, 15)
    units = UnitFactory.create_batch(4)
    # Unit 0: occupied all year. Unit 1: moved in this month. Unit 2: left in March.
    ContractFactory(
        resident=ResidentFactory(unit=units[0]),
        start_date=date(2025, 1, 1),
        end_date=date(2026, 12, 31),
    )
    ContractFactory(
        resident=ResidentFactory(unit=units[1]),
        start_date=date(2026, 6, 1),
        end_date=date(2027, 5, 31),
    )
    ContractFactory(
        resident=ResidentFactory(unit=units[2]),
        start_date=date(2025, 3, 1),
        end_date=date(2026, 3, 10),
        status=Contract.Status.EXPIRED,
    )
    # Pending contracts never count as occupied.
    ContractFactory(
        resident=ResidentFactory(unit=units[3]),
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
        status=Contract.Status.PENDING,
    )

    trend = selectors.occupancy_trend(today=today)

    assert len(trend) == 12
    assert trend[0]["month"] == "Jul" and trend[-1]["month"] == "Jun"
    by_month = {p["month"]: p["occupancy_rate"] for p in trend}
    assert by_month["Feb"] == 50.0  # units 0 and 2
    assert by_month["Mar"] == 50.0  # unit 2 left mid-month
    assert by_month["Apr"] == 25.0  # unit 0 only
    assert by_month["Jun"] == 50.0  # units 0 and 1


def test_occupancy_endpoint_shape(viewer_client):
    body = viewer_client.get("/api/dashboard/occupancy").json()
    assert len(body) == 12
    assert set(body[0]) == {"month", "occupancyRate"}


def test_activity_is_latest_twelve(viewer_client):
    base = timezone.now()
    for n in range(15):
        ActivityItem.objects.create(
            type="ticket",
            message=f"event {n}",
            entity_id=f"tkt-{n}",
            timestamp=base + timedelta(seconds=n),
        )
    body = viewer_client.get("/api/dashboard/activity").json()
    assert len(body) == 12
    assert set(body[0]) == {"id", "type", "message", "timestamp", "entityId"}
    assert body[0]["message"] == "event 14"


def test_month_windows_cross_year_boundary():
    windows = selectors._month_windows(date(2026, 2, 10), 3)
    assert windows == [
        (date(2025, 12, 1), date(2025, 12, 31)),
        (date(2026, 1, 1), date(2026, 1, 31)),
        (date(2026, 2, 1), date(2026, 2, 28)),
    ]
    assert windows[0][0] - timedelta(days=1) == date(2025, 11, 30)
