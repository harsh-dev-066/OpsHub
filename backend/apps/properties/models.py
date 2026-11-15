from django.db import models
from django.utils import timezone

from apps.core.models import prefixed_id_field


class Property(models.Model):
    """Portfolio asset. Occupancy rollups are computed (see selectors), never stored."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        MAINTENANCE = "maintenance", "Maintenance"

    id = prefixed_id_field("prop")
    name = models.CharField(max_length=150)
    city = models.CharField(max_length=100, db_index=True)
    country = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )
    manager = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        verbose_name_plural = "properties"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
