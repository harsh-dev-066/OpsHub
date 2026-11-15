from django.urls import path

from apps.core.routers import ApiRouter

from .views import LoginView, LogoutView, MeView, RefreshView, UserViewSet

router = ApiRouter()
router.register("users", UserViewSet, basename="user")

auth_urlpatterns = [
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("auth/me", MeView.as_view(), name="auth-me"),
]

urlpatterns = auth_urlpatterns + router.urls
