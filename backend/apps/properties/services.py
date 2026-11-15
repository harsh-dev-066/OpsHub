from django.db import transaction

from apps.activity.models import ActivityItem
from apps.activity.services import record_activity

from .models import Property


@transaction.atomic
def create_property(*, actor, **fields) -> Property:
    prop = Property.objects.create(**fields)
    record_activity(
        type=ActivityItem.Type.PROPERTY,
        message=f'Property "{prop.name}" added',
        entity_id=prop.pk,
        actor=actor,
    )
    return prop


@transaction.atomic
def update_property(prop: Property, *, actor, **changes) -> Property:
    for field, value in changes.items():
        setattr(prop, field, value)
    prop.save(update_fields=list(changes) or None)
    record_activity(
        type=ActivityItem.Type.PROPERTY,
        message=f'Property "{prop.name}" updated',
        entity_id=prop.pk,
        actor=actor,
    )
    return prop
