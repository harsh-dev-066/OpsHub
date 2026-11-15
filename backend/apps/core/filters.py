"""Sorting backend that speaks the frontend's ``sortBy`` / ``sortDirection``.

Views opt in by declaring a whitelist that maps public (camelCase) field
names to ORM expressions::

    sort_fields = {"name": "name", "updatedAt": "updated_at"}
    default_sort = ("updatedAt", "desc")

Unknown ``sortBy`` values fall back to the default instead of erroring, and
the primary key is always appended as a tie-breaker so pagination is stable.
"""

from django.db.models import F
from rest_framework.filters import BaseFilterBackend

ASC, DESC = "asc", "desc"


class CamelSortFilter(BaseFilterBackend):
    sort_param = "sortBy"
    direction_param = "sortDirection"

    def filter_queryset(self, request, queryset, view):
        fields: dict[str, str] = getattr(view, "sort_fields", None) or {}
        if not fields:
            return queryset

        default_field, default_direction = getattr(view, "default_sort", (None, ASC))
        requested = request.query_params.get(self.sort_param)
        direction = request.query_params.get(self.direction_param)

        if requested in fields:
            sort_key = requested
            if direction not in (ASC, DESC):
                direction = ASC
        else:
            # Unknown/missing sortBy: the default ordering applies as a whole.
            sort_key, direction = default_field, default_direction

        ordering = []
        if sort_key in fields:
            expr = F(fields[sort_key])
            ordering.append(
                expr.desc(nulls_last=True) if direction == DESC else expr.asc(nulls_last=True)
            )
        ordering.append("pk")
        return queryset.order_by(*ordering)

    def get_schema_operation_parameters(self, view):
        fields = list((getattr(view, "sort_fields", None) or {}).keys())
        if not fields:
            return []
        return [
            {
                "name": self.sort_param,
                "required": False,
                "in": "query",
                "schema": {"type": "string", "enum": fields},
            },
            {
                "name": self.direction_param,
                "required": False,
                "in": "query",
                "schema": {"type": "string", "enum": [ASC, DESC]},
            },
        ]
