from django.db.models import Count, Q, QuerySet
from django.shortcuts import get_object_or_404

from .models import Property

# Unit status values (kept as literals to avoid importing the units app here).
_OCCUPIED, _AVAILABLE, _MAINTENANCE = "occupied", "available", "maintenance"


def with_occupancy(queryset: QuerySet[Property] | None = None) -> QuerySet[Property]:
    """Annotate unit rollups in a single grouped query.

    Computing these on read (instead of storing counters) means they can never
    drift from the units table, and they remain sortable/filterable.
    """
    queryset = queryset if queryset is not None else Property.objects.all()
    return queryset.annotate(
        total_units=Count("units", distinct=True),
        occupied_units=Count("units", filter=Q(units__status=_OCCUPIED), distinct=True),
        available_units=Count("units", filter=Q(units__status=_AVAILABLE), distinct=True),
        maintenance_units=Count("units", filter=Q(units__status=_MAINTENANCE), distinct=True),
    )


def property_list() -> QuerySet[Property]:
    return with_occupancy()


def get_property(property_id: str) -> Property:
    return get_object_or_404(with_occupancy(), pk=property_id)


def city_list() -> list[str]:
    return list(Property.objects.order_by("city").values_list("city", flat=True).distinct())
