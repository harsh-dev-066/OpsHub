"""Local development settings."""

from .base import *  # noqa: F403
from .base import REST_FRAMEWORK

DEBUG = True
# "api" is the Compose service name the Vite dev proxy uses as the Host header.
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "api"]

# Vite dev server (direct calls; the Vite proxy makes these same-origin anyway).
CORS_ALLOWED_ORIGINS = ["http://localhost:5174", "http://127.0.0.1:5174"]

# Browsable API is handy while developing.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_RENDERER_CLASSES": [
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
        "djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer",
    ],
}
