from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.functions import Lower

from apps.core.models import prefixed_id_field

from .roles import Role, permissions_for_roles, primary_role


class UserManager(DjangoUserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("roles", [Role.ADMIN])
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    """Console operator.

    Uses a single ``name`` instead of first/last names, and an array of roles
    (a user may hold several; permissions are the union).
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    id = prefixed_id_field("user")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    roles = ArrayField(
        models.CharField(max_length=32, choices=Role.choices),
        default=list,
        blank=True,
    )

    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]

    REQUIRED_FIELDS = ["email", "name"]

    objects = UserManager()

    class Meta:
        ordering = ["date_joined"]
        constraints = [
            models.UniqueConstraint(Lower("email"), name="accounts_user_email_ci_unique"),
            models.UniqueConstraint(Lower("username"), name="accounts_user_username_ci_unique"),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.username})"

    @property
    def status(self) -> str:
        return self.Status.ACTIVE if self.is_active else self.Status.INACTIVE

    @property
    def app_permissions(self) -> frozenset[str]:
        if not self.is_active:
            return frozenset()
        return permissions_for_roles(self.roles)

    @property
    def primary_role(self) -> str:
        return primary_role(self.roles)

    @property
    def is_system_admin(self) -> bool:
        return Role.ADMIN in self.roles

    def has_app_permission(self, permission: str) -> bool:
        return permission in self.app_permissions
