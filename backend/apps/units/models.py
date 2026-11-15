from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import prefixed_id_field


class Unit(models.Model):
    """Assignable space inside a property."""

    class Status(models.TextChoices):
        OCCUPIED = "occupied", "Occupied"
        AVAILABLE = "available", "Available"
        MAINTENANCE = "maintenance", "Maintenance"
        RESERVED = "reserved", "Reserved"

    class Type(models.TextChoices):
        STUDIO = "studio", "Studio"
        ONE_BR = "1br", "1 bedroom"
        TWO_BR = "2br", "2 bedrooms"
        THREE_BR = "3br", "3 bedrooms"
        SHARED = "shared", "Shared"

    id = prefixed_id_field("unit")
    property = models.ForeignKey(
        "properties.Property", on_delete=models.PROTECT, related_name="units"
    )
    unit_number = models.CharField(max_length=16)
    type = models.CharField(max_length=16, choices=Type.choices)
    floor = models.SmallIntegerField()
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.AVAILABLE, db_index=True
    )
    monthly_rate = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )

    class Meta:
        ordering = ["property_id", "unit_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["property", "unit_number"], name="units_unit_number_unique_per_property"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.property_id} / {self.unit_number}"
