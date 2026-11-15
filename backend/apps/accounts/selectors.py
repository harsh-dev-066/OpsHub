from django.db.models import QuerySet

from .models import User


def user_list() -> QuerySet[User]:
    return User.objects.order_by("date_joined", "pk")


def assignable_users() -> QuerySet[User]:
    """Users who may be set as a ticket assignee."""
    return User.objects.filter(is_active=True)
