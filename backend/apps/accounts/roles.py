"""Roles and the role → permission matrix.

This is the server-side source of truth for authorization. It mirrors
``frontend/src/lib/permissions.ts`` (which only shapes the UI); keep the two
in sync when adding a permission.
"""

from collections.abc import Iterable

from django.db import models


class Role(models.TextChoices):
    ADMIN = "Admin", "Admin"
    OPERATIONS_MANAGER = "Operations Manager", "Operations Manager"
    SUPPORT_AGENT = "Support Agent", "Support Agent"
    VIEWER = "Viewer", "Viewer"


class Perm:
    """Application permission identifiers (``<resource>:<action>``)."""

    DASHBOARD_READ = "dashboard:read"
    PROPERTIES_READ = "properties:read"
    PROPERTIES_WRITE = "properties:write"
    UNITS_READ = "units:read"
    UNITS_WRITE = "units:write"
    TICKETS_READ = "tickets:read"
    TICKETS_CREATE = "tickets:create"
    TICKETS_EDIT = "tickets:edit"
    TICKETS_TRANSITION = "tickets:transition"
    SETTINGS_READ = "settings:read"
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"


_VIEWER = frozenset(
    {
        Perm.DASHBOARD_READ,
        Perm.PROPERTIES_READ,
        Perm.UNITS_READ,
        Perm.TICKETS_READ,
        Perm.SETTINGS_READ,
        Perm.USERS_READ,
    }
)
_SUPPORT_AGENT = _VIEWER | {Perm.TICKETS_CREATE, Perm.TICKETS_EDIT, Perm.TICKETS_TRANSITION}
_OPERATIONS_MANAGER = _SUPPORT_AGENT | {Perm.PROPERTIES_WRITE, Perm.UNITS_WRITE}
_ADMIN = _OPERATIONS_MANAGER | {Perm.USERS_WRITE}

ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
    Role.ADMIN: _ADMIN,
    Role.OPERATIONS_MANAGER: _OPERATIONS_MANAGER,
    Role.SUPPORT_AGENT: _SUPPORT_AGENT,
    Role.VIEWER: _VIEWER,
}

# Admin is reserved for the system operator and can't be granted via the API.
ASSIGNABLE_ROLES: tuple[str, ...] = (
    Role.OPERATIONS_MANAGER,
    Role.SUPPORT_AGENT,
    Role.VIEWER,
)

_ROLE_RANK = {Role.ADMIN: 4, Role.OPERATIONS_MANAGER: 3, Role.SUPPORT_AGENT: 2, Role.VIEWER: 1}


def permissions_for_roles(roles: Iterable[str]) -> frozenset[str]:
    granted: set[str] = set()
    for role in roles:
        granted |= ROLE_PERMISSIONS.get(role, frozenset())
    return frozenset(granted)


def primary_role(roles: Iterable[str]) -> str:
    """Highest-privilege role, for compact display."""
    ranked = sorted(roles, key=lambda r: _ROLE_RANK.get(r, 0), reverse=True)
    return ranked[0] if ranked else Role.VIEWER
