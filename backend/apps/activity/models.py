from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import prefixed_id_field


class ActivityItem(models.Model):
    """Append-only operational feed shown on the dashboard."""

    class Type(models.TextChoices):
        TICKET = "ticket", "Ticket"
        UNIT = "unit", "Unit"
        PROPERTY = "property", "Property"

    id = prefixed_id_field("act")
    type = models.CharField(max_length=16, choices=Type.choices)
    message = models.CharField(max_length=255)
    entity_id = models.CharField(max_length=32, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="activity",
    )
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-timestamp", "-pk"]

    def __str__(self) -> str:
        return self.message
