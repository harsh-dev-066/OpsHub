from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.roles import Perm

from . import selectors, services
from .filters import PropertyFilter
from .serializers import PropertySerializer, PropertyWriteSerializer


class PropertyViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PropertySerializer
    filterset_class = PropertyFilter
    search_fields = ["name", "city", "address"]
    sort_fields = {
        "name": "name",
        "city": "city",
        "country": "country",
        "status": "status",
        "manager": "manager",
        "createdAt": "created_at",
        "totalUnits": "total_units",
        "occupiedUnits": "occupied_units",
        "availableUnits": "available_units",
        "maintenanceUnits": "maintenance_units",
    }
    default_sort = ("name", "asc")
    http_method_names = ["get", "post", "patch", "head", "options"]
    required_permissions = {
        "list": Perm.PROPERTIES_READ,
        "retrieve": Perm.PROPERTIES_READ,
        "create": Perm.PROPERTIES_WRITE,
        "partial_update": Perm.PROPERTIES_WRITE,
    }

    def get_queryset(self):
        return selectors.property_list()

    @extend_schema(request=PropertyWriteSerializer, responses={201: PropertySerializer})
    def create(self, request):
        payload = PropertyWriteSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        prop = services.create_property(actor=request.user, **payload.validated_data)
        return Response(
            PropertySerializer(selectors.get_property(prop.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(request=PropertyWriteSerializer, responses=PropertySerializer)
    def partial_update(self, request, pk=None):
        prop = self.get_object()
        payload = PropertyWriteSerializer(prop, data=request.data, partial=True)
        payload.is_valid(raise_exception=True)
        services.update_property(prop, actor=request.user, **payload.validated_data)
        return Response(PropertySerializer(selectors.get_property(prop.pk)).data)


class CityListView(APIView):
    """Distinct cities for the property filter dropdown (plain array)."""

    required_permissions = {"get": Perm.PROPERTIES_READ}

    @extend_schema(responses=list[str])
    def get(self, request):
        return Response(selectors.city_list())
