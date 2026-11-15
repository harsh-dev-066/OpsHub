from .models import ActivityItem


def record_activity(*, type: str, message: str, entity_id: str, actor=None) -> ActivityItem:
    """Append an entry to the activity feed. Call inside the write's transaction."""
    return ActivityItem.objects.create(
        type=type,
        message=message[:255],
        entity_id=entity_id,
        actor=actor if getattr(actor, "is_authenticated", False) else None,
    )
