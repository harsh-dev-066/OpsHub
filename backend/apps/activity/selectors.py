from django.db.models import QuerySet

from .models import ActivityItem


def recent_activity(limit: int = 12) -> QuerySet[ActivityItem]:
    return ActivityItem.objects.order_by("-timestamp", "-pk")[:limit]
