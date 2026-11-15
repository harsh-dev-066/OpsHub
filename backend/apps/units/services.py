from django.db import transaction

from apps.activity.models import ActivityItem
from apps.activity.services import record_activity

from .models import Unit


@transaction.atomic
def create_unit(*, actor, **fields) -> Unit:
    unit = Unit.objects.create(**fields)
    record_activity(
        type=ActivityItem.Type.UNIT,
        message=f"Unit {unit.unit_number} added to {unit.property.name}",
        entity_id=unit.pk,
        actor=actor,
    )
    return unit


@transaction.atomic
def update_unit(unit: Unit, *, actor, **changes) -> Unit:
    previous_status = unit.status
    for field, value in changes.items():
        setattr(unit, field, value)
    unit.save()

    if unit.status != previous_status:
        message = f"Unit {unit.unit_number} marked {unit.get_status_display().lower()}"
    else:
        message = f"Unit {unit.unit_number} updated"
    record_activity(type=ActivityItem.Type.UNIT, message=message, entity_id=unit.pk, actor=actor)
    return unit
