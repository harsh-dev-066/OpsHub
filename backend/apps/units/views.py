from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, status, viewsets
from rest_framework.response import Response

from apps.accounts.roles import Perm
from apps.properties.models import Property

from . import selectors, services
from .filters import UnitFilter
from .serializers import UnitDetailSerializer, UnitSerializer, UnitWriteSerializer


class UnitListConfig:
    """Shared list behaviour for /units and /properties/:id/units."""

    serializer_class = UnitSerializer
    filterset_class = UnitFilter
    search_fields = ["unit_number", "resident_name", "type"]
    sort_fields = {
        "unitNumber": "unit_number",
        "type": "type",
        "floor": "floor",
        "status": "status",
        "resident": "resident_name",
        "monthlyRate": "monthly_rate",
        "contractStart": "contract_start",
        "contractEnd": "contract_end",
        "propertyId": "property_id",
    }
    default_sort = ("unitNumber", "asc")


class UnitViewSet(
    UnitListConfig,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    http_method_names = ["get", "post", "patch", "head", "options"]
    required_permissions = {
        "list": Perm.UNITS_READ,
        "retrieve": Perm.UNITS_READ,
        "create": Perm.UNITS_WRITE,
        "partial_update": Perm.UNITS_WRITE,
    }

    def get_queryset(self):
        return selectors.unit_list()

    def get_serializer_class(self):
        return UnitDetailSerializer if self.action == "retrieve" else UnitSerializer

    @extend_schema(request=UnitWriteSerializer, responses={201: UnitDetailSerializer})
    def create(self, request):
        payload = UnitWriteSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        unit = services.create_unit(actor=request.user, **payload.validated_data)
        return Response(
            UnitDetailSerializer(selectors.get_unit(unit.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(request=UnitWriteSerializer, responses=UnitDetailSerializer)
    def partial_update(self, request, pk=None):
        unit = self.get_object()
        payload = UnitWriteSerializer(unit, data=request.data, partial=True)
        payload.is_valid(raise_exception=True)
        services.update_unit(unit, actor=request.user, **payload.validated_data)
        return Response(UnitDetailSerializer(selectors.get_unit(unit.pk)).data)


class PropertyUnitListView(UnitListConfig, generics.ListAPIView):
    """Units of one property: ``GET /api/properties/:id/units``."""

    required_permissions = {"get": Perm.UNITS_READ}

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # OpenAPI schema generation
            return selectors.unit_list().none()
        prop = get_object_or_404(Property, pk=self.kwargs["property_id"])
        return selectors.unit_list().filter(property=prop)
