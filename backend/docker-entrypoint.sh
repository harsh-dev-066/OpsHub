#!/bin/sh
# Container entrypoint for the OpsHub API.
#   RUN_MIGRATIONS=1  apply migrations before starting
#   SEED_DEMO=1       load demo data when the database is empty
set -e

python manage.py wait_for_db

if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  python manage.py migrate --noinput
fi

if [ "${SEED_DEMO:-0}" = "1" ]; then
  # Demo data is a convenience: never let a seeding problem (e.g. an unset
  # DEMO_USER_PASSWORD) keep the API from starting.
  python manage.py seed_demo --if-empty || echo "WARNING: demo seed skipped (see error above)."
fi

exec "$@"
