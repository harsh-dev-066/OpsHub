from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.roles import Perm
from apps.activity.serializers import ActivityItemSerializer

from . import selectors
from .serializers import BreakdownItemSerializer, OccupancyPointSerializer, SummarySerializer


class DashboardView(APIView):
    required_permissions = {"get": Perm.DASHBOARD_READ}


class SummaryView(DashboardView):
    @extend_schema(responses=SummarySerializer)
    def get(self, request):
        return Response(SummarySerializer(selectors.summary()).data)


class OccupancyView(DashboardView):
    @extend_schema(responses=OccupancyPointSerializer(many=True))
    def get(self, request):
        return Response(OccupancyPointSerializer(selectors.occupancy_trend(), many=True).data)


class TicketsByPriorityView(DashboardView):
    @extend_schema(responses=BreakdownItemSerializer(many=True))
    def get(self, request):
        return Response(BreakdownItemSerializer(selectors.tickets_by_priority(), many=True).data)


class TicketsByStatusView(DashboardView):
    @extend_schema(responses=BreakdownItemSerializer(many=True))
    def get(self, request):
        return Response(BreakdownItemSerializer(selectors.tickets_by_status(), many=True).data)


class ActivityView(DashboardView):
    @extend_schema(responses=ActivityItemSerializer(many=True))
    def get(self, request):
        return Response(ActivityItemSerializer(selectors.activity(), many=True).data)
