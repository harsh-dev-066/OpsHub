from django.db import transaction
from django.utils import timezone

from apps.activity.models import ActivityItem
from apps.activity.services import record_activity

from .models import Ticket


@transaction.atomic
def create_ticket(*, actor, **fields) -> Ticket:
    fields.setdefault("status", Ticket.Status.OPEN)
    ticket = Ticket.objects.create(created_by=actor, **fields)
    record_activity(
        type=ActivityItem.Type.TICKET,
        message=f'Ticket "{ticket.title}" created',
        entity_id=ticket.pk,
        actor=actor,
    )
    return ticket


@transaction.atomic
def update_ticket(ticket: Ticket, *, actor, **changes) -> Ticket:
    previous_status = ticket.status
    for field, value in changes.items():
        setattr(ticket, field, value)
    ticket.updated_at = timezone.now()
    ticket.save()

    if ticket.status != previous_status:
        message = f'Ticket "{ticket.title}" marked {ticket.get_status_display().lower()}'
    else:
        message = f'Ticket "{ticket.title}" updated'
    record_activity(
        type=ActivityItem.Type.TICKET, message=message, entity_id=ticket.pk, actor=actor
    )
    return ticket
