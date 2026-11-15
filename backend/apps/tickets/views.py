from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.accounts.roles import Perm
from apps.properties.models import Property

from . import selectors, services
from .filters import TicketFilter
from .serializers import TicketDetailSerializer, TicketSerializer, TicketWriteSerializer

# Fields guarded by `tickets:edit`. `status` is guarded by `tickets:transition`.
EDIT_FIELDS = {"title", "description", "category", "priority", "property", "unit", "assignee"}


class TicketListConfig:
    """Shared list behaviour for /tickets and /properties/:id/tickets."""

    serializer_class = TicketSerializer
    filterset_class = TicketFilter
    search_fields = ["title", "description", "id"]
    sort_fields = {
        "title": "title",
        "category": "category",
        "priority": "priority_rank",
        "status": "status",
        "assignee": "assignee__name",
        "propertyId": "property_id",
        "createdAt": "created_at",
        "updatedAt": "updated_at",
    }
    default_sort = ("updatedAt", "desc")


class TicketViewSet(
    TicketListConfig,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    http_method_names = ["get", "post", "patch", "head", "options"]
    required_permissions = {
        "list": Perm.TICKETS_READ,
        "retrieve": Perm.TICKETS_READ,
        "create": Perm.TICKETS_CREATE,
        # Either grant may PATCH; field-level checks happen in partial_update.
        "partial_update": (Perm.TICKETS_EDIT, Perm.TICKETS_TRANSITION),
    }

    def get_queryset(self):
        return selectors.ticket_list()

    def get_serializer_class(self):
        return TicketDetailSerializer if self.action == "retrieve" else TicketSerializer

    @extend_schema(request=TicketWriteSerializer, responses={201: TicketSerializer})
    def create(self, request):
        payload = TicketWriteSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        if "status" in data and not request.user.has_app_permission(Perm.TICKETS_TRANSITION):
            data.pop("status")
        ticket = services.create_ticket(actor=request.user, **data)
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=TicketWriteSerializer, responses=TicketSerializer)
    def partial_update(self, request, pk=None):
        ticket = self.get_object()
        payload = TicketWriteSerializer(ticket, data=request.data, partial=True)
        payload.is_valid(raise_exception=True)
        changes = payload.validated_data
        self._authorize_fields(request.user, changes)
        ticket = services.update_ticket(ticket, actor=request.user, **changes)
        return Response(TicketSerializer(ticket).data)

    @staticmethod
    def _authorize_fields(user, changes: dict) -> None:
        if "status" in changes and not user.has_app_permission(Perm.TICKETS_TRANSITION):
            raise PermissionDenied("You do not have permission to change ticket status.")
        if EDIT_FIELDS & changes.keys() and not user.has_app_permission(Perm.TICKETS_EDIT):
            raise PermissionDenied("You do not have permission to edit tickets.")


class PropertyTicketListView(TicketListConfig, generics.ListAPIView):
    """Tickets of one property: ``GET /api/properties/:id/tickets``."""

    required_permissions = {"get": Perm.TICKETS_READ}

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # OpenAPI schema generation
            return selectors.ticket_list().none()
        prop = get_object_or_404(Property, pk=self.kwargs["property_id"])
        return selectors.ticket_list().filter(property=prop)
