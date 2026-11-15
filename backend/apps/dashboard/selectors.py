"""Read-only aggregates for the dashboard. Each function is one SQL query."""

from datetime import date, timedelta

from django.db.models import Count, Q
from django.utils import timezone

from apps.activity.selectors import recent_activity
from apps.leasing.models import Contract
from apps.properties.models import Property
from apps.tickets.models import Ticket
from apps.units.models import Unit

# Contracts that mean a unit was physically occupied during their term.
_OCCUPYING_STATUSES = (Contract.Status.ACTIVE, Contract.Status.EXPIRED)


def summary() -> dict:
    units = Unit.objects.aggregate(
        total=Count("pk"),
        occupied=Count("pk", filter=Q(status=Unit.Status.OCCUPIED)),
        available=Count("pk", filter=Q(status=Unit.Status.AVAILABLE)),
        maintenance=Count("pk", filter=Q(status=Unit.Status.MAINTENANCE)),
    )
    total = units["total"]
    return {
        "occupancy_rate": round(units["occupied"] / total * 100, 1) if total else 0,
        "available_units": units["available"],
        "maintenance_units": units["maintenance"],
        "open_tickets": Ticket.objects.filter(status__in=Ticket.OPEN_STATUSES).count(),
        "total_properties": Property.objects.count(),
        "total_units": total,
    }


def _month_windows(today: date, months: int) -> list[tuple[date, date]]:
    """[(first_day, last_day)] for the `months` calendar months ending with today's."""
    windows = []
    year, month = today.year, today.month
    for _ in range(months):
        start = date(year, month, 1)
        next_year, next_month = (year + 1, 1) if month == 12 else (year, month + 1)
        end = date(next_year, next_month, 1) - timedelta(days=1)
        windows.append((start, end))
        year, month = (year - 1, 12) if month == 1 else (year, month - 1)
    return list(reversed(windows))


def occupancy_trend(months: int = 12, today: date | None = None) -> list[dict]:
    """Share of units under an occupying contract in each of the last `months` months.

    A unit counts as occupied in a month if any active/expired contract
    overlaps that month. Uses today's unit count as the denominator (units
    are not historized).
    """
    today = today or timezone.localdate()
    windows = _month_windows(today, months)
    total_units = Unit.objects.count()

    aggregates = {
        f"m{i}": Count(
            "unit",
            filter=Q(start_date__lte=end, end_date__gte=start),
            distinct=True,
        )
        for i, (start, end) in enumerate(windows)
    }
    counts = Contract.objects.filter(status__in=_OCCUPYING_STATUSES).aggregate(**aggregates)

    return [
        {
            "month": start.strftime("%b"),
            "occupancy_rate": round(counts[f"m{i}"] / total_units * 100, 1) if total_units else 0,
        }
        for i, (start, _end) in enumerate(windows)
    ]


def _breakdown(field: str, choices: list[str]) -> list[dict]:
    rows = dict(Ticket.objects.values_list(field).annotate(n=Count("pk")).order_by())
    return [{"name": name, "value": rows.get(name, 0)} for name in choices]


def tickets_by_priority() -> list[dict]:
    return _breakdown("priority", Ticket.Priority.values)


def tickets_by_status() -> list[dict]:
    return _breakdown("status", Ticket.Status.values)


def activity(limit: int = 12):
    return recent_activity(limit)
