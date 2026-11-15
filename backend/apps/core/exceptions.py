"""Uniform error responses.

Every error body has the shape ``{"message": str, "code": str, "errors"?: {...}}``.
The frontend's ``ApiError`` surfaces ``message`` directly in toasts, so it
must always be a readable sentence.
"""

import logging

from django.conf import settings
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.serializers import as_serializer_error
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ConflictError(exceptions.APIException):
    """409 — the request conflicts with existing state (e.g. duplicate email)."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "The request conflicts with the current state of the resource."
    default_code = "conflict"


def _humanize(field: str) -> str:
    return field.replace("_", " ").strip().capitalize()


def _first_message(detail) -> str | None:
    """Pull the first human-readable message out of a DRF error detail."""
    if isinstance(detail, list):
        for item in detail:
            message = _first_message(item)
            if message:
                return message
        return None
    if isinstance(detail, dict):
        for key, value in detail.items():
            message = _first_message(value)
            if not message:
                continue
            if key in ("non_field_errors", "detail"):
                return message
            return f"{_humanize(key)}: {message}"
        return None
    return str(detail) if detail else None


def api_exception_handler(exc, context):
    # Normalize Django-native exceptions so DRF can render them.
    if isinstance(exc, DjangoValidationError):
        exc = exceptions.ValidationError(as_serializer_error(exc))
    elif isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, DjangoPermissionDenied):
        exc = exceptions.PermissionDenied()

    response = exception_handler(exc, context)

    if response is None:
        # Unhandled error: log it with the traceback and never leak internals.
        if settings.DEBUG:
            return None
        logger.exception("Unhandled API error", exc_info=exc)
        return Response(
            {"message": "Something went wrong. Please try again.", "code": "server_error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = exc.detail if isinstance(exc, exceptions.APIException) else response.data
    body: dict = {
        "message": _first_message(detail) or "Request failed.",
        "code": getattr(exc, "default_code", "error"),
    }
    if isinstance(exc, exceptions.ValidationError):
        body["code"] = "validation_error"
        body["errors"] = detail if isinstance(detail, dict) else {"non_field_errors": detail}
    elif isinstance(detail, dict) and detail.get("code"):
        # e.g. SimpleJWT's {"detail": ..., "code": "token_not_valid"}
        body["code"] = str(detail["code"])

    response.data = body
    return response
