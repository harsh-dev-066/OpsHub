"""Role-based authorization for API views.

Views declare which application permission each action needs::

    required_permissions = {
        "list": Perm.TICKETS_READ,
        "create": Perm.TICKETS_CREATE,
        "partial_update": (Perm.TICKETS_EDIT, Perm.TICKETS_TRANSITION),  # any of
    }

Keys are ViewSet action names, or lowercase HTTP methods for plain APIViews.
The check **fails closed**: an action without an entry is denied, so a new
endpoint can never be accidentally public to every authenticated user.
"""

import logging

from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)


def _required_for(view, request) -> str | tuple[str, ...] | None:
    method = request.method.lower()
    if method == "options" or not hasattr(view, method):
        # OPTIONS is metadata only; an unsupported method falls through so
        # DRF answers 405 instead of a misleading 403. Neither grants access.
        return ()
    mapping = getattr(view, "required_permissions", None) or {}
    key = getattr(view, "action", None) or method
    return mapping.get(key)


class HasAppPermission(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        required = _required_for(view, request)
        if required is None:
            logger.warning(
                "Denied: %s has no required_permissions entry for %s",
                type(view).__name__,
                getattr(view, "action", None) or request.method,
            )
            return False
        if isinstance(required, str):
            required = (required,)
        if not required:
            return True
        return any(user.has_app_permission(perm) for perm in required)
