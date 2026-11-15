"""Write-side business rules for user management.

Views stay thin: they validate input shape with serializers and delegate
here. Everything that touches the database for a write lives in this module.
"""

from collections.abc import Iterable

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.core.exceptions import ConflictError

from .models import User

SYSTEM_ADMIN_LOCKED = "The system admin account cannot be modified."


def normalize_username(username: str) -> str:
    return username.strip().lower()


def _dedupe(roles: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(roles))


def _ensure_unique(*, username: str | None = None, email: str | None = None, exclude_id=None):
    others = User.objects.exclude(pk=exclude_id) if exclude_id else User.objects.all()
    if username and others.filter(username__iexact=username).exists():
        raise ConflictError("Username is already taken.")
    if email and others.filter(email__iexact=email).exists():
        raise ConflictError("Email is already in use.")


def _apply_password(user: User, password: str) -> None:
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise ValidationError({"password": exc.messages}) from exc
    user.set_password(password)


def _save(user: User) -> None:
    # The pre-check above gives friendly messages; the DB constraint closes the race.
    try:
        with transaction.atomic():
            user.save()
    except IntegrityError as exc:
        raise ConflictError("Username or email is already in use.") from exc


@transaction.atomic
def create_user(
    *,
    name: str,
    email: str,
    username: str,
    password: str,
    roles: Iterable[str],
    status: str = User.Status.ACTIVE,
) -> User:
    username = normalize_username(username)
    email = email.strip()
    _ensure_unique(username=username, email=email)

    user = User(
        name=name.strip(),
        email=email,
        username=username,
        roles=_dedupe(roles),
        is_active=status == User.Status.ACTIVE,
    )
    _apply_password(user, password)
    _save(user)
    return user


@transaction.atomic
def update_user(
    user: User,
    *,
    actor: User,
    name: str | None = None,
    email: str | None = None,
    roles: Iterable[str] | None = None,
    status: str | None = None,
    password: str | None = None,
) -> User:
    if user.is_system_admin:
        raise PermissionDenied(SYSTEM_ADMIN_LOCKED)
    if user.pk == actor.pk and status == User.Status.INACTIVE:
        raise ValidationError({"status": ["You cannot deactivate your own account."]})

    if email is not None:
        email = email.strip()
        _ensure_unique(email=email, exclude_id=user.pk)
        user.email = email
    if name is not None:
        user.name = name.strip()
    if roles is not None:
        user.roles = _dedupe(roles)
    if status is not None:
        user.is_active = status == User.Status.ACTIVE
    if password:
        # Changing the password revokes existing tokens (SIMPLE_JWT CHECK_REVOKE_TOKEN).
        _apply_password(user, password)

    _save(user)
    return user
