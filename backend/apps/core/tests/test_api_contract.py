"""Cross-cutting API contract: pagination, errors, routing, health."""

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from apps.factories import PropertyFactory

pytestmark = pytest.mark.django_db


def test_paginated_response_shape(viewer_client):
    PropertyFactory.create_batch(12)

    body = viewer_client.get("/api/properties?page=2&pageSize=5").json()

    assert set(body) == {"data", "page", "pageSize", "total", "totalPages"}
    assert (body["page"], body["pageSize"], body["total"], body["totalPages"]) == (2, 5, 12, 3)
    assert len(body["data"]) == 5


def test_out_of_range_page_returns_empty_data(viewer_client):
    PropertyFactory.create_batch(3)
    body = viewer_client.get("/api/properties?page=99").json()
    assert body["data"] == []
    assert body["total"] == 3


@pytest.mark.parametrize("query", ["page=abc", "page=-1", "pageSize=0", "pageSize=x"])
def test_invalid_paging_params_fall_back_to_defaults(viewer_client, query):
    body = viewer_client.get(f"/api/properties?{query}").json()
    assert body["page"] >= 1
    assert body["pageSize"] == 10


def test_page_size_is_capped(viewer_client):
    assert viewer_client.get("/api/properties?pageSize=5000").json()["pageSize"] == 100


def test_empty_list_has_one_total_page(viewer_client):
    body = viewer_client.get("/api/properties").json()
    assert body == {"data": [], "page": 1, "pageSize": 10, "total": 0, "totalPages": 1}


def test_not_found_error_shape(viewer_client):
    res = viewer_client.get("/api/properties/prop-missing")
    assert res.status_code == 404
    assert set(res.json()) >= {"message", "code"}


def test_validation_error_shape(agent_client):
    res = agent_client.post("/api/tickets", {})
    body = res.json()
    assert res.status_code == 400
    assert body["code"] == "validation_error"
    assert body["message"]
    assert "title" in body["errors"]
    assert "propertyId" in body["errors"]  # camelCase on the wire


def test_unauthenticated_requests_get_401(api_client):
    res = api_client.get("/api/properties")
    assert res.status_code == 401
    assert res.json()["message"]


def test_liveness_is_public_and_never_queries_the_database(api_client):
    with CaptureQueriesContext(connection) as ctx:
        res = api_client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
    assert ctx.captured_queries == []


def test_readiness_checks_the_database(api_client):
    res = api_client.get("/api/health/ready")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "ok"}


def test_readiness_reports_database_outage(api_client, monkeypatch):
    from django.db import OperationalError
    from django.db.backends.base.base import BaseDatabaseWrapper

    def down(self):
        raise OperationalError("connection refused")

    monkeypatch.setattr(BaseDatabaseWrapper, "ensure_connection", down)
    res = api_client.get("/api/health/ready")
    assert res.status_code == 503
    assert res.json()["database"] == "unavailable"


def test_unknown_sort_field_falls_back_to_default(viewer_client):
    PropertyFactory(name="B")
    PropertyFactory(name="A")
    body = viewer_client.get("/api/properties?sortBy=password&sortDirection=desc").json()
    assert [p["name"] for p in body["data"]] == ["A", "B"]


@pytest.mark.parametrize("path", ["/api/properties/", "/api/nope"])
def test_unrouted_paths_return_json_404(viewer_client, path):
    res = viewer_client.get(path)
    assert res.status_code == 404
    assert res.json()["code"] == "not_found"


def test_openapi_schema_generates_without_warnings():
    from django.core.management import call_command

    call_command("spectacular", "--validate", "--fail-on-warn", "--file", "/dev/null")
