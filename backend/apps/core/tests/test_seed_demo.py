import pytest
from django.core.management import CommandError, call_command

from apps.accounts.models import User
from apps.properties.models import Property
from apps.tickets.models import Ticket
from apps.units.models import Unit

pytestmark = pytest.mark.django_db


def test_seed_demo_creates_portfolio_and_is_guarded():
    call_command("seed_demo", password="Demo-pass-123")

    assert Property.objects.count() == 12
    assert Unit.objects.count() == 46
    assert Ticket.objects.count() == 42
    admin = User.objects.get(username="test")
    assert admin.is_system_admin and admin.check_password("Demo-pass-123")

    with pytest.raises(CommandError):
        call_command("seed_demo", password="Demo-pass-123")

    call_command("seed_demo", password="Demo-pass-123", reset=True)
    assert Property.objects.count() == 12


def test_seed_requires_password(settings):
    settings.DEMO_USER_PASSWORD = ""
    with pytest.raises(CommandError):
        call_command("seed_demo")


def test_seed_if_empty_is_a_no_op_when_data_exists():
    call_command("seed_demo", password="Demo-pass-123")
    call_command("seed_demo", password="Demo-pass-123", if_empty=True)  # no error
    assert Property.objects.count() == 12


def test_wait_for_db_returns_when_database_is_up():
    call_command("wait_for_db", timeout=1)
