"""Create the database cache table used by CACHES (see config/settings/base.py).

`createcachetable` is idempotent and skips non-database cache backends, so this
is safe in every environment.
"""

from django.core.management import call_command
from django.db import migrations


def create_cache_table(apps, schema_editor):
    call_command("createcachetable", database=schema_editor.connection.alias, verbosity=0)


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunPython(create_cache_table, migrations.RunPython.noop),
    ]
