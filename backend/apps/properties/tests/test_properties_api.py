import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from apps.activity.models import ActivityItem
from apps.factories import PropertyFactory, TicketFactory, UnitFactory
from apps.units.models import Unit

pytestmark = pytest.mark.django_db


def test_list_includes_occupancy_rollups(viewer_client):
    prop = PropertyFactory()
    UnitFactory.create_batch(2, property=prop, status=Unit.Status.OCCUPIED)
    UnitFactory(property=prop, status=Unit.Status.AVAILABLE)
    UnitFactory(property=prop, status=Unit.Status.MAINTENANCE)
    UnitFactory(property=prop, status=Unit.Status.RESERVED)

    row = viewer_client.get("/api/properties").json()["data"][0]

    assert row["totalUnits"] == 5
    assert row["occupiedUnits"] == 2
    assert row["availableUnits"] == 1
    assert row["maintenanceUnits"] == 1
    assert set(row) == {
        "id", "name", "city", "country", "address", "status", "totalUnits",
        "occupiedUnits", "availableUnits", "maintenanceUnits", "manager", "createdAt",
    }  # fmt: skip


def test_filter_search_and_sort(viewer_client):
    PropertyFactory(name="Harbor View", city="Singapore", status="active")
    PropertyFactory(name="Cedar Lane", city="Tokyo", status="active")
    PropertyFactory(name="Riverbend", city="Tokyo", status="maintenance")

    def names(query):
        return [p["name"] for p in viewer_client.get(f"/api/properties?{query}").json()["data"]]

    assert names("city=Tokyo") == ["Cedar Lane", "Riverbend"]
    assert names("status=maintenance") == ["Riverbend"]
    assert names("search=harbor") == ["Harbor View"]
    assert names("search=tokyo&sortBy=name&sortDirection=desc") == ["Riverbend", "Cedar Lane"]


def test_sort_by_rollup(viewer_client):
    small, big = PropertyFactory(name="Small"), PropertyFactory(name="Big")
    UnitFactory(property=small, status=Unit.Status.OCCUPIED)
    UnitFactory.create_batch(3, property=big, status=Unit.Status.OCCUPIED)

    data = viewer_client.get("/api/properties?sortBy=occupiedUnits&sortDirection=desc").json()
    assert [p["name"] for p in data["data"]] == ["Big", "Small"]


def test_list_query_count_is_constant(viewer_client):
    for _ in range(5):
        UnitFactory.create_batch(3, property=PropertyFactory())
    with CaptureQueriesContext(connection) as ctx:
        viewer_client.get("/api/properties?pageSize=50")
    # user lookup + count + page
    assert len(ctx.captured_queries) <= 4


def test_cities_are_distinct_and_sorted(viewer_client):
    for city in ["Tokyo", "Bangkok", "Tokyo"]:
        PropertyFactory(city=city)
    assert viewer_client.get("/api/meta/cities").json() == ["Bangkok", "Tokyo"]


def test_property_units_and_tickets(viewer_client):
    prop, other = PropertyFactory(), PropertyFactory()
    UnitFactory.create_batch(2, property=prop)
    UnitFactory(property=other)
    TicketFactory(property=prop, status="open")
    TicketFactory(property=prop, status="closed")
    TicketFactory(property=other)

    units = viewer_client.get(f"/api/properties/{prop.pk}/units").json()
    tickets = viewer_client.get(f"/api/properties/{prop.pk}/tickets?status=open").json()

    assert units["total"] == 2
    assert tickets["total"] == 1
    assert tickets["data"][0]["propertyId"] == prop.pk


def test_nested_lists_404_for_unknown_property(viewer_client):
    assert viewer_client.get("/api/properties/prop-nope/units").status_code == 404
    assert viewer_client.get("/api/properties/prop-nope/tickets").status_code == 404


def test_manager_updates_property_and_activity_is_logged(manager_client):
    prop = PropertyFactory(status="active")

    res = manager_client.patch(f"/api/properties/{prop.pk}", {"status": "maintenance"})

    assert res.status_code == 200
    assert res.json()["status"] == "maintenance"
    assert "totalUnits" in res.json()
    assert ActivityItem.objects.filter(entity_id=prop.pk, type="property").exists()


def test_invalid_status_rejected(manager_client):
    prop = PropertyFactory()
    assert manager_client.patch(f"/api/properties/{prop.pk}", {"status": "x"}).status_code == 400
