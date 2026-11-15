"""factory_boy factories shared by every app's tests."""

from datetime import timedelta

import factory
from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.roles import Role
from apps.leasing.models import Contract, Resident
from apps.properties.models import Property
from apps.tickets.models import Ticket
from apps.units.models import Unit

TEST_PASSWORD = "S3cure-test-pass!"


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f"user{n}")
    name = factory.Faker("name")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    roles = factory.LazyFunction(lambda: [Role.VIEWER])
    is_active = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or TEST_PASSWORD)
        if create:
            obj.save(update_fields=["password"])


class PropertyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Property

    name = factory.Sequence(lambda n: f"Property {n}")
    city = "Singapore"
    country = "Singapore"
    address = factory.Sequence(lambda n: f"{n} Test Street")
    status = Property.Status.ACTIVE
    manager = "Test Manager"


class UnitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Unit

    property = factory.SubFactory(PropertyFactory)
    unit_number = factory.Sequence(lambda n: f"{100 + n}")
    type = Unit.Type.STUDIO
    floor = 1
    status = Unit.Status.AVAILABLE
    monthly_rate = 1500


class ResidentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Resident

    name = factory.Faker("name")
    email = factory.Sequence(lambda n: f"resident{n}@example.com")
    phone = "+65 80000000"
    nationality = "SG"
    move_in_date = factory.LazyFunction(timezone.localdate)
    unit = factory.SubFactory(UnitFactory)


class ContractFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Contract

    resident = factory.SubFactory(ResidentFactory)
    unit = factory.SelfAttribute("resident.unit")
    start_date = factory.LazyFunction(lambda: timezone.localdate() - timedelta(days=30))
    end_date = factory.LazyAttribute(lambda o: o.start_date + timedelta(days=365))
    status = Contract.Status.ACTIVE


class TicketFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Ticket

    property = factory.SubFactory(PropertyFactory)
    unit = None
    title = factory.Sequence(lambda n: f"Ticket {n}")
    description = "Something needs attention."
    category = Ticket.Category.MAINTENANCE
    priority = Ticket.Priority.MEDIUM
    status = Ticket.Status.OPEN
