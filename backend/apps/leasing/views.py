from rest_framework import mixins, viewsets

from apps.accounts.roles import Perm

from . import selectors
from .filters import ContractFilter
from .serializers import ContractSerializer, ResidentSerializer


class ResidentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ResidentSerializer
    search_fields = ["name", "email"]
    sort_fields = {
        "name": "name",
        "email": "email",
        "nationality": "nationality",
        "moveInDate": "move_in_date",
    }
    default_sort = ("name", "asc")
    # Residents are shown on unit pages, so they share the units read grant.
    required_permissions = {"list": Perm.UNITS_READ}

    def get_queryset(self):
        return selectors.resident_list()


class ContractViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ContractSerializer
    filterset_class = ContractFilter
    sort_fields = {
        "startDate": "start_date",
        "endDate": "end_date",
        "status": "status",
    }
    default_sort = ("startDate", "desc")
    required_permissions = {"list": Perm.UNITS_READ}

    def get_queryset(self):
        return selectors.contract_list()
