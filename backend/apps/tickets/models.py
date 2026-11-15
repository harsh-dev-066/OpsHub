from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel, prefixed_id_field


class Ticket(TimeStampedModel):
    """Operational support request raised against a property (and optionally a unit)."""

    class Category(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        CLEANING = "cleaning", "Cleaning"
        NOISE = "noise", "Noise"
        BILLING = "billing", "Billing"
        ACCESS = "access", "Access"
        OTHER = "other", "Other"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        WAITING = "waiting", "Waiting"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    # Statuses counted as "open" work on the dashboard.
    OPEN_STATUSES = (Status.OPEN, Status.IN_PROGRESS, Status.WAITING)

    id = prefixed_id_field("tkt")
    property = models.ForeignKey(
        "properties.Property", on_delete=models.PROTECT, related_name="tickets"
    )
    unit = models.ForeignKey(
        "units.Unit", null=True, blank=True, on_delete=models.SET_NULL, related_name="tickets"
    )
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=2000, blank=True)
    category = models.CharField(max_length=16, choices=Category.choices, db_index=True)
    priority = models.CharField(max_length=16, choices=Priority.choices, db_index=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.OPEN, db_index=True
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_tickets",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_tickets",
    )

    class Meta:
        ordering = ["-updated_at"]
        indexes = [models.Index(fields=["property", "status"])]

    def __str__(self) -> str:
        return f"{self.pk}: {self.title}"
