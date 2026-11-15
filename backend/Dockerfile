# syntax=docker/dockerfile:1.7
#
# OpsHub API image. Two targets:
#   dev  — runtime + dev deps (pytest, ruff), Django runserver with autoreload;
#          the source is bind-mounted by docker-compose.yml.
#   prod — runtime deps only, collected static files, gunicorn.

FROM ghcr.io/astral-sh/uv:0.12.5 AS uv

FROM python:3.13-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH"
COPY --from=uv /uv /usr/local/bin/uv
# Unprivileged runtime user (uid 1000 matches the default user on most Linux hosts).
RUN useradd --create-home --uid 1000 app
WORKDIR /app
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 8000

# ---------------------------------------------------------------------------
FROM base AS dev
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project
COPY --chown=app:app . .
USER app
ENV DJANGO_SETTINGS_MODULE=config.settings.dev
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ---------------------------------------------------------------------------
FROM base AS prod
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project
COPY --chown=app:app . .
ENV DJANGO_SETTINGS_MODULE=config.settings.prod
# collectstatic needs settings to import, not a real database or secret.
RUN SECRET_KEY=collectstatic-only-placeholder-not-used-at-runtime-0123456789 \
    DATABASE_URL=sqlite:////tmp/build.db \
    python manage.py collectstatic --noinput
USER app
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--access-logfile", "-", \
     "--forwarded-allow-ips", "*"]
