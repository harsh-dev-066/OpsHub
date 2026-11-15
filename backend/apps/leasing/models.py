from django.db import models
from django.db.models import F, Q

from apps.core.models import prefixed_id_field


class Resident(models.Model):
    id = prefixed_id_field("res")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    nationality = models.CharField(max_length=2, blank=True, help_text="ISO 3166-1 alpha-2")
    move_in_date = models.DateField()
    unit = models.ForeignKey(
        "units.Unit",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="residents",
    )

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["name"])]

    def __str__(self) -> str:
        return self.name


class Contract(models.Model):
    """Agreement linking a resident to a unit for a period."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        EXPIRED = "expired", "Expired"
        TERMINATED = "terminated", "Terminated"

    # Contracts that currently hold the unit (occupied or reserved).
    CURRENT_STATUSES = (Status.ACTIVE, Status.PENDING)

    id = prefixed_id_field("ctr")
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name="contracts")
    unit = models.ForeignKey("units.Unit", on_delete=models.PROTECT, related_name="contracts")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=16, choices=Status.choices, db_index=True)

    class Meta:
        ordering = ["-start_date"]
        constraints = [
            models.CheckConstraint(
                condition=Q(end_date__gte=F("start_date")),
                name="leasing_contract_end_after_start",
            ),
        ]
        indexes = [models.Index(fields=["unit", "status"])]

    def __str__(self) -> str:
        return f"{self.pk} ({self.status})"
