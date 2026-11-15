import pytest

from apps.factories import ContractFactory, PropertyFactory, ResidentFactory, UnitFactory
from apps.leasing.models import Contract
from apps.units.models import Unit

pytestmark = pytest.mark.django_db

UNIT_KEYS = {
    "id", "propertyId", "unitNumber", "type", "floor", "status", "resident",
    "monthlyRate", "contractStart", "contractEnd",
}  # fmt: skip


def test_list_shape_and_current_lease(viewer_client):
    unit = UnitFactory(status=Unit.Status.OCCUPIED, monthly_rate=1850)
    contract = ContractFactory(resident=ResidentFactory(unit=unit, name="Alex Kim"))
    UnitFactory(status=Unit.Status.AVAILABLE)

    data = viewer_client.get("/api/units?sortBy=status").json()["data"]
    occupied = next(u for u in data if u["id"] == unit.pk)
    vacant = next(u for u in data if u["id"] != unit.pk)

    assert set(occupied) == UNIT_KEYS
    assert occupied["resident"] == "Alex Kim"
    assert occupied["contractStart"] == contract.start_date.isoformat()
    assert occupied["monthlyRate"] == 1850  # number, not string
    assert vacant["resident"] is None
    assert vacant["contractStart"] is None


def test_expired_contract_is_not_current(viewer_client):
    unit = UnitFactory()
    ContractFactory(resident=ResidentFactory(unit=unit), status=Contract.Status.EXPIRED)
    assert viewer_client.get(f"/api/units/{unit.pk}").json()["resident"] is None


def test_filters_and_search(viewer_client):
    prop = PropertyFactory()
    UnitFactory(property=prop, unit_number="101", status="occupied")
    UnitFactory(property=prop, unit_number="102", status="available")
    UnitFactory(unit_number="201", status="available")
    resident_unit = UnitFactory(unit_number="301", status="occupied")
    ContractFactory(resident=ResidentFactory(unit=resident_unit, name="Quinn Santos"))

    def numbers(query):
        return sorted(
            u["unitNumber"] for u in viewer_client.get(f"/api/units?{query}").json()["data"]
        )

    assert numbers(f"propertyId={prop.pk}") == ["101", "102"]
    assert numbers("status=available") == ["102", "201"]
    assert numbers("search=santos") == ["301"]


def test_detail_includes_resident_contract_property(viewer_client):
    unit = UnitFactory(status=Unit.Status.OCCUPIED)
    contract = ContractFactory(resident=ResidentFactory(unit=unit))

    body = viewer_client.get(f"/api/units/{unit.pk}").json()

    assert set(body) >= UNIT_KEYS
    assert body["residentDetail"]["id"] == contract.resident_id
    assert body["residentDetail"]["unitId"] == unit.pk
    assert body["contract"]["id"] == contract.pk
    assert body["contract"]["status"] == "active"
    assert body["property"]["id"] == unit.property_id
    assert body["property"]["totalUnits"] == 1


def test_detail_for_vacant_unit(viewer_client):
    unit = UnitFactory()
    body = viewer_client.get(f"/api/units/{unit.pk}").json()
    assert body["residentDetail"] is None
    assert body["contract"] is None


def test_manager_creates_unit_and_duplicate_number_rejected(manager_client):
    prop = PropertyFactory()
    payload = {
        "propertyId": prop.pk,
        "unitNumber": "501",
        "type": "2br",
        "floor": 5,
        "monthlyRate": 2100,
    }
    created = manager_client.post("/api/units", payload)
    assert created.status_code == 201
    assert created.json()["property"]["totalUnits"] == 1

    duplicate = manager_client.post("/api/units", payload)
    assert duplicate.status_code == 400
    assert "unitNumber" in duplicate.json()["errors"]


def test_negative_rate_rejected(manager_client):
    unit = UnitFactory()
    assert manager_client.patch(f"/api/units/{unit.pk}", {"monthlyRate": -5}).status_code == 400


def test_residents_and_contracts_lists(viewer_client):
    ContractFactory(resident=ResidentFactory(name="Zed"), status="pending")
    ContractFactory(resident=ResidentFactory(name="Amy"), status="active")

    residents = viewer_client.get("/api/residents").json()["data"]
    pending = viewer_client.get("/api/contracts?status=pending").json()

    assert [r["name"] for r in residents] == ["Amy", "Zed"]
    assert {"id", "name", "email", "phone", "nationality", "moveInDate", "unitId"} == set(
        residents[0]
    )
    assert pending["total"] == 1
    assert set(pending["data"][0]) == {
        "id", "residentId", "unitId", "startDate", "endDate", "status",
    }  # fmt: skip
