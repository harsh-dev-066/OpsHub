from django.urls import path

from apps.core.routers import ApiRouter

from .views import CityListView, PropertyViewSet

router = ApiRouter()
router.register("properties", PropertyViewSet, basename="property")

urlpatterns = [
    path("meta/cities", CityListView.as_view(), name="meta-cities"),
    *router.urls,
]
