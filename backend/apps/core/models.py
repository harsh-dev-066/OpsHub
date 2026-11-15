"""Shared model building blocks. This app defines no tables of its own."""

import secrets

from django.db import models
from django.utils import timezone
from django.utils.deconstruct import deconstructible


@deconstructible
class PrefixedId:
    """
    Callable default that produces opaque, prefixed string IDs such as
    ``tkt-3f9a1c0b7e2d``.

    The frontend treats IDs as opaque strings; prefixes make logs and URLs
    self-describing. ``deconstructible`` lets migrations serialize it.
    """

    def __init__(self, prefix: str) -> None:
        self.prefix = prefix

    def __call__(self) -> str:
        return f"{self.prefix}-{secrets.token_hex(6)}"

    def __eq__(self, other: object) -> bool:
        return isinstance(other, PrefixedId) and other.prefix == self.prefix

    def __hash__(self) -> int:
        return hash(self.prefix)


def prefixed_id_field(prefix: str) -> models.CharField:
    """Primary-key field with a generated, prefixed string ID."""
    return models.CharField(
        primary_key=True,
        max_length=32,
        default=PrefixedId(prefix),
        editable=False,
    )


class TimeStampedModel(models.Model):
    """Adds ``created_at`` / ``updated_at``.

    ``default=timezone.now`` (rather than ``auto_now_add``) keeps the values
    settable, which the demo seed relies on. Services bump ``updated_at``.
    """

    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        abstract = True
