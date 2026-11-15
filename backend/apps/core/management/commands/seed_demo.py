"""Seed the database with deterministic demo data.

A port of ``frontend/src/mocks/data/db.ts`` so the real API serves the same
portfolio as the MSW mock (12 properties, ~46 units, ~42 tickets, 4 users).
Dates are generated relative to today so dashboards always look current.

Usage::

    uv run manage.py seed_demo            # refuses if data already exists
    uv run manage.py seed_demo --reset    # wipe domain data + demo users first
    uv run manage.py seed_demo --if-empty # no-op when data exists (container start-up)
"""

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.roles import Role
from apps.activity.models import ActivityItem
from apps.leasing.models import Contract, Resident
from apps.properties.models import Property
from apps.tickets.models import Ticket
from apps.units.models import Unit


@dataclass(frozen=True)
class PropertySeed:
    id: str
    name: str
    city: str
    country: str
    address: str
    status: str
    manager: str
    created_at: str


PROPERTIES = [
    PropertySeed("prop-001", "Harbor View Residences", "Singapore", "Singapore",
                 "12 Marina Boulevard", "active", "Aisha Rahman", "2023-01-15"),
    PropertySeed("prop-002", "Cedar Lane Collective", "Tokyo", "Japan",
                 "8 Shibuya Crossing", "active", "Kenji Sato", "2023-03-02"),
    PropertySeed("prop-003", "Maple Court Studios", "Seoul", "South Korea",
                 "45 Gangnam-daero", "active", "Minji Park", "2023-04-18"),
    PropertySeed("prop-004", "Riverbend House", "Bangkok", "Thailand",
                 "99 Sukhumvit Road", "maintenance", "Somsak Chai", "2023-05-10"),
    PropertySeed("prop-005", "Northgate Apartments", "Hong Kong", "Hong Kong",
                 "3 Central Pier", "active", "Grace Li", "2023-06-01"),
    PropertySeed("prop-006", "Sunset Lofts", "Kuala Lumpur", "Malaysia",
                 "21 Bukit Bintang", "active", "Daniel Tan", "2023-07-12"),
    PropertySeed("prop-007", "Oakwood Commons", "Manila", "Philippines",
                 "7 Makati Avenue", "inactive", "Isabel Cruz", "2023-08-20"),
    PropertySeed("prop-008", "Beacon Hill Residences", "Singapore", "Singapore",
                 "55 Orchard Road", "active", "Aisha Rahman", "2023-09-05"),
    PropertySeed("prop-009", "Lakeside Quarters", "Jakarta", "Indonesia",
                 "14 Sudirman Street", "active", "Budi Santoso", "2023-10-11"),
    PropertySeed("prop-010", "Pinecrest Living", "Tokyo", "Japan",
                 "2 Roppongi Hills", "active", "Kenji Sato", "2023-11-02"),
    PropertySeed("prop-011", "Skyline Place", "Seoul", "South Korea",
                 "18 Yeouido Park", "maintenance", "Minji Park", "2023-12-14"),
    PropertySeed("prop-012", "Eastside Collective", "Bangkok", "Thailand",
                 "30 Silom Road", "active", "Somsak Chai", "2024-01-20"),
]  # fmt: skip

USERS = [
    ("user-001", "test", "Alex Morgan", "alex.morgan@opshub.app", Role.ADMIN, "2024-01-08"),
    ("user-002", "priya", "Priya Shah", "priya.shah@opshub.app", Role.OPERATIONS_MANAGER,
     "2024-02-12"),
    ("user-003", "chris", "Chris Lee", "chris.lee@opshub.app", Role.SUPPORT_AGENT, "2024-03-04"),
    ("user-004", "sam", "Sam Rivera", "sam.rivera@opshub.app", Role.VIEWER, "2024-04-18"),
]  # fmt: skip

UNIT_TYPES = ["studio", "1br", "2br", "3br", "shared"]
FIRST_NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey",
               "Riley", "Quinn", "Avery", "Jamie", "Cameron", "Drew"]  # fmt: skip
LAST_NAMES = ["Nguyen", "Patel", "Kim", "Wong", "Garcia", "Chen",
              "Ali", "Singh", "Brown", "Lopez", "Ito", "Santos"]  # fmt: skip
NATIONALITIES = ["SG", "JP", "KR", "TH", "MY", "PH"]
TICKET_TITLES = ["AC not cooling", "Leaking faucet", "Keycard not working", "Noise complaint",
                 "Broken light fixture", "Wi-Fi intermittent", "Request cleaning visit",
                 "Billing discrepancy", "Door lock jammed", "Water pressure low"]  # fmt: skip
CATEGORIES = Ticket.Category.values
PRIORITIES = Ticket.Priority.values
STATUSES = Ticket.Status.values
# Usernames cycled as ticket assignees (None = unassigned).
ASSIGNEES = ["priya", "chris", "priya", "chris", None]


def _aware(day: date, at: time = time(8, 0)) -> datetime:
    return timezone.make_aware(datetime.combine(day, at))


def _seq(prefix: str, n: int) -> str:
    return f"{prefix}-{n:03d}"


class Command(BaseCommand):
    help = "Seed deterministic demo data (properties, units, residents, tickets, users)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true", help="Delete existing domain data and demo users first."
        )
        parser.add_argument(
            "--if-empty",
            action="store_true",
            help="Do nothing (successfully) if data already exists.",
        )
        parser.add_argument(
            "--password",
            default=None,
            help="Password for demo users (defaults to DEMO_USER_PASSWORD).",
        )

    def handle(self, *args, reset: bool, if_empty: bool, password: str | None, **options):
        if if_empty and not reset and Property.objects.exists():
            self.stdout.write("Demo data already present; skipping seed.")
            return

        password = password or settings.DEMO_USER_PASSWORD
        if not password:
            raise CommandError("Set DEMO_USER_PASSWORD (or pass --password) for the demo users.")

        if not reset and Property.objects.exists():
            raise CommandError("Data already exists. Re-run with --reset to replace it.")

        with transaction.atomic():
            if reset:
                self._wipe()
            users = self._seed_users(password)
            today = timezone.localdate()
            properties = self._seed_properties()
            units = self._seed_units_and_leases(properties, today)
            tickets = self._seed_tickets(properties, units, users, today)
            self._seed_activity(tickets, units)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(properties)} properties, {len(units)} units, "
                f"{Resident.objects.count()} residents, {Contract.objects.count()} contracts, "
                f"{len(tickets)} tickets, {len(users)} users."
            )
        )

    # -- steps ---------------------------------------------------------------

    def _wipe(self) -> None:
        ActivityItem.objects.all().delete()
        Ticket.objects.all().delete()
        Contract.objects.all().delete()
        Resident.objects.all().delete()
        Unit.objects.all().delete()
        Property.objects.all().delete()
        User.objects.filter(username__in=[u[1] for u in USERS]).delete()

    def _seed_users(self, password: str) -> dict[str, User]:
        users = {}
        for user_id, username, name, email, role, joined in USERS:
            user = User(
                id=user_id,
                username=username,
                name=name,
                email=email,
                roles=[role],
                date_joined=_aware(date.fromisoformat(joined), time(10, 0)),
                # The admin operator can also use the Django admin site.
                is_staff=role == Role.ADMIN,
                is_superuser=role == Role.ADMIN,
            )
            user.set_password(password)
            user.save()
            users[username] = user
        return users

    def _seed_properties(self) -> list[Property]:
        return Property.objects.bulk_create(
            Property(
                id=seed.id,
                name=seed.name,
                city=seed.city,
                country=seed.country,
                address=seed.address,
                status=seed.status,
                manager=seed.manager,
                created_at=_aware(date.fromisoformat(seed.created_at)),
            )
            for seed in PROPERTIES
        )

    def _seed_units_and_leases(self, properties: list[Property], today: date) -> list[Unit]:
        units, residents, contracts = [], [], []
        unit_n = resident_n = contract_n = 1

        for prop in properties:
            for i in range(2 if prop.id == "prop-007" else 4):
                floor = i // 2 + 1
                roll = (unit_n + i) % 10
                status = (
                    Unit.Status.OCCUPIED if roll < 6
                    else Unit.Status.AVAILABLE if roll < 8
                    else Unit.Status.MAINTENANCE if roll < 9
                    else Unit.Status.RESERVED
                )  # fmt: skip
                unit = Unit(
                    id=_seq("unit", unit_n),
                    property=prop,
                    unit_number=f"{floor}{(i % 2) + 1:02d}",
                    type=UNIT_TYPES[i % len(UNIT_TYPES)],
                    floor=floor,
                    status=status,
                    monthly_rate=1200 + unit_n * 35 + i * 50,
                )
                units.append(unit)

                if status in (Unit.Status.OCCUPIED, Unit.Status.RESERVED):
                    first = FIRST_NAMES[unit_n % len(FIRST_NAMES)]
                    last = LAST_NAMES[i % len(LAST_NAMES)]
                    if status == Unit.Status.OCCUPIED:
                        start = today - timedelta(days=(unit_n * 23) % 330 + 10)
                        contract_status = Contract.Status.ACTIVE
                    else:
                        start = today + timedelta(days=unit_n % 30 + 5)
                        contract_status = Contract.Status.PENDING
                    resident = Resident(
                        id=_seq("res", resident_n),
                        name=f"{first} {last}",
                        email=f"{first.lower()}.{last.lower()}@example.com",
                        phone=f"+65 8{str(1_000_000 + unit_n)[:7]}",
                        nationality=NATIONALITIES[unit_n % len(NATIONALITIES)],
                        move_in_date=start,
                        unit=unit,
                    )
                    residents.append(resident)
                    contracts.append(
                        Contract(
                            id=_seq("ctr", contract_n),
                            resident=resident,
                            unit=unit,
                            start_date=start,
                            end_date=start + timedelta(days=365),
                            status=contract_status,
                        )
                    )
                    resident_n += 1
                    contract_n += 1
                elif status == Unit.Status.AVAILABLE:
                    # A previous tenancy that ended recently: gives the occupancy
                    # trend realistic history.
                    first = FIRST_NAMES[(unit_n + 5) % len(FIRST_NAMES)]
                    last = LAST_NAMES[(i + 3) % len(LAST_NAMES)]
                    end = today - timedelta(days=(unit_n * 17) % 120 + 15)
                    resident = Resident(
                        id=_seq("res", resident_n),
                        name=f"{first} {last}",
                        email=f"{first.lower()}.{last.lower()}.{resident_n}@example.com",
                        phone=f"+65 9{str(1_000_000 + unit_n)[:7]}",
                        nationality=NATIONALITIES[(unit_n + 2) % len(NATIONALITIES)],
                        move_in_date=end - timedelta(days=365),
                        unit=None,
                    )
                    residents.append(resident)
                    contracts.append(
                        Contract(
                            id=_seq("ctr", contract_n),
                            resident=resident,
                            unit=unit,
                            start_date=end - timedelta(days=365),
                            end_date=end,
                            status=Contract.Status.EXPIRED,
                        )
                    )
                    resident_n += 1
                    contract_n += 1

                unit_n += 1

        Unit.objects.bulk_create(units)
        Resident.objects.bulk_create(residents)
        Contract.objects.bulk_create(contracts)
        return units

    def _seed_tickets(
        self,
        properties: list[Property],
        units: list[Unit],
        users: dict[str, User],
        today: date,
    ) -> list[Ticket]:
        units_by_property: dict[str, list[Unit]] = {}
        for unit in units:
            units_by_property.setdefault(unit.property_id, []).append(unit)

        now = timezone.now()
        tickets = []
        for i in range(42):
            prop = properties[i % len(properties)]
            prop_units = units_by_property.get(prop.id, [])
            unit = prop_units[i % len(prop_units)] if prop_units else None
            created = _aware(today - timedelta(days=(i * 9) % 300 + 1), time(9, 30))
            updated = min(created + timedelta(days=i % 5), now)
            assignee = ASSIGNEES[i % len(ASSIGNEES)]
            where = f" unit {unit.unit_number}" if unit else ""
            tickets.append(
                Ticket(
                    id=_seq("tkt", i + 1),
                    property=prop,
                    unit=unit,
                    title=TICKET_TITLES[i % len(TICKET_TITLES)],
                    description=(
                        f"Reported issue at {prop.name}{where}. "
                        "Please investigate and update the resident."
                    ),
                    category=CATEGORIES[i % len(CATEGORIES)],
                    priority=PRIORITIES[i % len(PRIORITIES)],
                    status=STATUSES[i % len(STATUSES)],
                    assignee=users[assignee] if assignee else None,
                    created_at=created,
                    updated_at=updated,
                )
            )
        return Ticket.objects.bulk_create(tickets)

    def _seed_activity(self, tickets: list[Ticket], units: list[Unit]) -> None:
        items = [
            ActivityItem(
                id=f"act-t-{n:03d}",
                type=ActivityItem.Type.TICKET,
                message=f'Ticket "{t.title}" marked {t.get_status_display().lower()}',
                entity_id=t.id,
                timestamp=t.updated_at,
            )
            for n, t in enumerate(sorted(tickets, key=lambda t: t.updated_at, reverse=True)[:8])
        ]
        occupied = [u for u in units if u.status == Unit.Status.OCCUPIED][:4]
        contracts = {
            c.unit_id: c
            for c in Contract.objects.filter(
                unit__in=occupied, status=Contract.Status.ACTIVE
            ).select_related("resident")
        }
        for n, unit in enumerate(occupied):
            contract = contracts.get(unit.id)
            if contract is None:
                continue
            items.append(
                ActivityItem(
                    id=f"act-u-{n:03d}",
                    type=ActivityItem.Type.UNIT,
                    message=f"Unit {unit.unit_number} occupied by {contract.resident.name}",
                    entity_id=unit.id,
                    timestamp=_aware(contract.start_date),
                )
            )
        ActivityItem.objects.bulk_create(items)
