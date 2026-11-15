"""Test settings: fast hashing, no throttling surprises."""

from .base import *  # noqa: F403
from .base import REST_FRAMEWORK

DEBUG = False
ALLOWED_HOSTS = ["testserver", "localhost"]

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {"login": "1000/min"},
}

LOGGING = {"version": 1, "disable_existing_loggers": False}
