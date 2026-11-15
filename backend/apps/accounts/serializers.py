from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .roles import ASSIGNABLE_ROLES, Role
from .services import normalize_username


class UserSerializer(serializers.ModelSerializer):
    """Public user shape — matches ``User`` in frontend/src/types/domain.ts."""

    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "username", "roles", "status", "created_at"]
        read_only_fields = fields


class MeSerializer(UserSerializer):
    """The signed-in user plus server-computed permissions."""

    role = serializers.CharField(source="primary_role", read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = [*UserSerializer.Meta.fields, "role", "permissions"]
        read_only_fields = fields

    def get_permissions(self, user: User) -> list[str]:
        return sorted(user.app_permissions)


class AssignableRolesField(serializers.ListField):
    """Non-empty list of roles that may be granted through the API."""

    child = serializers.ChoiceField(choices=Role.choices)

    def __init__(self, **kwargs):
        kwargs.setdefault("allow_empty", False)
        kwargs.setdefault("error_messages", {"empty": "Assign at least one role."})
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        roles = super().to_internal_value(data)
        if any(role not in ASSIGNABLE_ROLES for role in roles):
            raise serializers.ValidationError("The Admin role cannot be assigned.")
        return roles


class UserCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    username = serializers.RegexField(
        r"^[A-Za-z0-9_.-]+$",
        min_length=2,
        max_length=150,
        error_messages={"invalid": "Use letters, numbers, dots, dashes, or underscores."},
    )
    password = serializers.CharField(
        write_only=True, min_length=8, max_length=128, trim_whitespace=False
    )
    roles = AssignableRolesField()
    status = serializers.ChoiceField(choices=User.Status.choices, default=User.Status.ACTIVE)


class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(max_length=254, required=False)
    roles = AssignableRolesField(required=False)
    status = serializers.ChoiceField(choices=User.Status.choices, required=False)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=128,
        required=False,
        allow_blank=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        if "username" in self.initial_data:
            raise serializers.ValidationError({"username": ["Username cannot be changed."]})
        return attrs


class LoginSerializer(TokenObtainPairSerializer):
    """Username/password → ``{access, refresh, user}``."""

    default_error_messages = {"no_active_account": "Invalid username or password."}

    def validate(self, attrs):
        attrs[self.username_field] = normalize_username(attrs.get(self.username_field, ""))
        tokens = super().validate(attrs)
        return {**tokens, "user": MeSerializer(self.user).data}


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
