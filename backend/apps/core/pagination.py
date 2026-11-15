"""Pagination that matches the frontend contract.

Response shape::

    {"data": [...], "page": 1, "pageSize": 10, "total": 42, "totalPages": 5}

Unlike DRF's default, an out-of-range page yields an empty ``data`` list
instead of a 404, and an invalid ``page`` falls back to 1.
"""

import math

from rest_framework.pagination import BasePagination
from rest_framework.response import Response


class StandardPagination(BasePagination):
    page_query_param = "page"
    page_size_query_param = "pageSize"
    default_page_size = 10
    max_page_size = 100

    def _positive_int(self, raw: str | None, default: int) -> int:
        try:
            value = int(raw) if raw is not None else default
        except (TypeError, ValueError):
            return default
        return value if value > 0 else default

    def paginate_queryset(self, queryset, request, view=None):
        params = request.query_params
        self.page = self._positive_int(params.get(self.page_query_param), 1)
        self.page_size = min(
            self._positive_int(params.get(self.page_size_query_param), self.default_page_size),
            self.max_page_size,
        )
        self.total = queryset.count()
        start = (self.page - 1) * self.page_size
        return list(queryset[start : start + self.page_size])

    def get_paginated_response(self, data):
        # Keys are snake_case here; the camelCase renderer converts them.
        return Response(
            {
                "data": data,
                "page": self.page,
                "page_size": self.page_size,
                "total": self.total,
                "total_pages": max(1, math.ceil(self.total / self.page_size)),
            }
        )

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "required": ["data", "page", "pageSize", "total", "totalPages"],
            "properties": {
                "data": schema,
                "page": {"type": "integer", "example": 1},
                "pageSize": {"type": "integer", "example": 10},
                "total": {"type": "integer", "example": 42},
                "totalPages": {"type": "integer", "example": 5},
            },
        }

    def get_schema_operation_parameters(self, view):
        return [
            {
                "name": self.page_query_param,
                "required": False,
                "in": "query",
                "schema": {"type": "integer", "minimum": 1, "default": 1},
            },
            {
                "name": self.page_size_query_param,
                "required": False,
                "in": "query",
                "schema": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": self.max_page_size,
                    "default": self.default_page_size,
                },
            },
        ]
