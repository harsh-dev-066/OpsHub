from django.urls import path

from apps.core.routers import ApiRouter

from .views import PropertyTicketListView, TicketViewSet

router = ApiRouter()
router.register("tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path(
        "properties/<str:property_id>/tickets",
        PropertyTicketListView.as_view(),
        name="property-tickets",
    ),
    *router.urls,
]
