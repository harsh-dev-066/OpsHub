import contextlib

from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import selectors, services
from .roles import Perm
from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    MeSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


class LoginView(TokenObtainPairView):
    """Exchange username/password for an access + refresh token pair."""

    serializer_class = LoginSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class RefreshView(TokenRefreshView):
    """Rotate a refresh token. The old refresh token is blacklisted."""


class LogoutView(APIView):
    """Blacklist the given refresh token.

    Unauthenticated on purpose: the access token may already be expired when
    the user signs out. Idempotent — an invalid/expired token still yields 204.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(request=LogoutSerializer, responses={204: None})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with contextlib.suppress(TokenError):
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """The signed-in user, their roles, and effective permissions."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=MeSerializer)
    def get(self, request):
        return Response(MeSerializer(request.user).data)


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------


class UserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """List, read, create, and update console users.

    ``GET /api/users`` returns a plain array (the UI filters client-side).
    """

    serializer_class = UserSerializer
    pagination_class = None
    filter_backends = []
    http_method_names = ["get", "post", "patch", "head", "options"]
    required_permissions = {
        "list": Perm.USERS_READ,
        "retrieve": Perm.USERS_READ,
        "create": Perm.USERS_WRITE,
        "partial_update": Perm.USERS_WRITE,
    }

    def get_queryset(self):
        return selectors.user_list()

    @extend_schema(request=UserCreateSerializer, responses={201: UserSerializer})
    def create(self, request):
        payload = UserCreateSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user = services.create_user(**payload.validated_data)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=UserUpdateSerializer, responses=UserSerializer)
    def partial_update(self, request, pk=None):
        user = self.get_object()
        payload = UserUpdateSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user = services.update_user(user, actor=request.user, **payload.validated_data)
        return Response(UserSerializer(user).data)
