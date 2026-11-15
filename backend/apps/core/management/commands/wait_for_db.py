"""Block until the database accepts connections (used by the container entrypoint)."""

import time

from django.core.management.base import BaseCommand, CommandError
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Wait until the default database is reachable."

    def add_arguments(self, parser):
        parser.add_argument("--timeout", type=int, default=60, help="Seconds before giving up.")

    def handle(self, *args, timeout: int, **options):
        deadline = time.monotonic() + timeout
        while True:
            try:
                connections["default"].ensure_connection()
            except OperationalError as exc:
                if time.monotonic() >= deadline:
                    raise CommandError(f"Database unavailable after {timeout}s: {exc}") from exc
                self.stdout.write("Waiting for database...")
                time.sleep(1)
            else:
                self.stdout.write(self.style.SUCCESS("Database available."))
                return
