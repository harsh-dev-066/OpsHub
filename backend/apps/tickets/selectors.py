from django.db.models import Case, IntegerField, QuerySet, Value, When
from django.shortcuts import get_object_or_404

from .models import Ticket

_PRIORITY_RANK = Case(
    *(When(priority=p, then=Value(rank)) for rank, p in enumerate(Ticket.Priority.values)),
    output_field=IntegerField(),
)


def ticket_list() -> QuerySet[Ticket]:
    # priority_rank lets `sortBy=priority` order low → critical instead of alphabetically.
    return Ticket.objects.select_related("assignee").annotate(priority_rank=_PRIORITY_RANK)


def get_ticket(ticket_id: str) -> Ticket:
    return get_object_or_404(ticket_list(), pk=ticket_id)
