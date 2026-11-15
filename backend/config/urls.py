from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

api_patterns = [
    path("", include("apps.core.urls")),
    path("", include("apps.accounts.urls")),
    path("", include("apps.dashboard.urls")),
    path("", include("apps.properties.urls")),
    path("", include("apps.units.urls")),
    path("", include("apps.leasing.urls")),
    path("", include("apps.tickets.urls")),
    path("schema", SpectacularAPIView.as_view(), name="schema"),
    path("docs", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_patterns)),
]

handler404 = "apps.core.views.not_found"
handler500 = "apps.core.views.server_error"
