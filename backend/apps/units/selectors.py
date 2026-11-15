from django.db.models import OuterRef, QuerySet, Subquery
from django.shortcuts import get_object_or_404

from apps.leasing.selectors import current_contracts

from .models import Unit


def with_current_lease(queryset: QuerySet[Unit] | None = None) -> QuerySet[Unit]:
    """Annotate the current resident name and contract dates.

    Uses correlated subqueries so a page of units costs one SQL query
    regardless of size (no N+1).
    """
    queryset = queryset if queryset is not None else Unit.objects.all()
    lease = current_contracts().filter(unit=OuterRef("pk")).order_by("-start_date")
    return queryset.annotate(
        resident_name=Subquery(lease.values("resident__name")[:1]),
        contract_start=Subquery(lease.values("start_date")[:1]),
        contract_end=Subquery(lease.values("end_date")[:1]),
    )


def unit_list() -> QuerySet[Unit]:
    return with_current_lease()


def get_unit(unit_id: str) -> Unit:
    return get_object_or_404(with_current_lease(), pk=unit_id)
