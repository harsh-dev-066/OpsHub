from django.urls import path

from apps.core.routers import ApiRouter

from .views import PropertyUnitListView, UnitViewSet

router = ApiRouter()
router.register("units", UnitViewSet, basename="unit")

urlpatterns = [
    path(
        "properties/<str:property_id>/units",
        PropertyUnitListView.as_view(),
        name="property-units",
    ),
    *router.urls,
]
