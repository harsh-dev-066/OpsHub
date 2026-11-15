from django.db import connection
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness probe: the process is up and serving requests.

    Deliberately does **not** touch the database. Platforms poll this every few
    seconds (Render's health check); a DB query here would keep a
    scale-to-zero database (Neon) awake and burn its free compute hours.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    """Readiness probe: the process is up **and** the database answers.

    For container orchestration (docker compose) and manual checks, not for
    high-frequency platform health checks.
    """

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
