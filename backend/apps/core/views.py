from django.db import connection
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness + database connectivity probe for load balancers."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses={200: dict, 503: dict})
    def get(self, request):
        try:
            connection.ensure_connection()
        except Exception:
            return Response({"status": "error", "database": "unavailable"}, status=503)
        return Response({"status": "ok", "database": "ok"})


def not_found(request, exception=None):
    """JSON 404 for URLs that match no route (Django's default is HTML)."""
    return JsonResponse({"message": "Not found.", "code": "not_found"}, status=404)


def server_error(request):
    """JSON 500 for errors raised outside DRF views."""
    return JsonResponse(
        {"message": "Something went wrong. Please try again.", "code": "server_error"},
        status=500,
    )
