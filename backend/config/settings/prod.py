"""Production settings. Every value that matters comes from the environment."""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import MIDDLEWARE, env

# Serve collected static files (Django admin, API docs) straight from gunicorn.
MIDDLEWARE = [
    MIDDLEWARE[0],
    "whitenoise.middleware.WhiteNoiseMiddleware",
    *MIDDLEWARE[1:],
]

DEBUG = False

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=60 * 60 * 24 * 30)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
# Only disable for a local plain-HTTP stack (docker-compose.prod.yml on localhost).
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=True)
X_FRAME_OPTIONS = "DENY"

# /api/health must stay reachable over plain HTTP for load-balancer probes.
SECURE_REDIRECT_EXEMPT = [r"^api/health$"]

# API schema/docs require a signed-in user in production.
SPECTACULAR_SETTINGS = {
    **SPECTACULAR_SETTINGS,  # noqa: F405
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAuthenticated"],
}

# Fail fast on a weak signing key: it signs sessions and every JWT.
if len(SECRET_KEY) < 50 or SECRET_KEY.startswith("django-insecure"):  # noqa: F405
    raise ImproperlyConfigured("SECRET_KEY must be a random value of at least 50 characters.")
