from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.accounts.selectors import assignable_users
from apps.properties.models import Property
from apps.properties.selectors import get_property
from apps.properties.serializers import PropertySerializer
from apps.units.models import Unit
from apps.units.selectors import get_unit
from apps.units.serializers import UnitSerializer

from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Matches ``Ticket`` in frontend/src/types/domain.ts.

    ``assignee`` stays the display name (what the UI renders); ``assigneeId``
    is the stable reference used for writes.
    """

    property_id = serializers.CharField(read_only=True)
    unit_id = serializers.CharField(read_only=True, allow_null=True)
    assignee = serializers.CharField(source="assignee.name", read_only=True, allow_null=True)
    assignee_id = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "property_id",
            "unit_id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "assignee",
            "assignee_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class TicketDetailSerializer(TicketSerializer):
    property = serializers.SerializerMethodField()
    unit = serializers.SerializerMethodField()

    class Meta(TicketSerializer.Meta):
        fields = [*TicketSerializer.Meta.fields, "property", "unit"]
        read_only_fields = fields

    @extend_schema_field(PropertySerializer(allow_null=True))
    def get_property(self, ticket: Ticket):
        return PropertySerializer(get_property(ticket.property_id)).data

    @extend_schema_field(UnitSerializer(allow_null=True))
    def get_unit(self, ticket: Ticket):
        return UnitSerializer(get_unit(ticket.unit_id)).data if ticket.unit_id else None


class TicketWriteSerializer(serializers.Serializer):
    """Input for create (all required fields) and partial update."""

    title = serializers.CharField(min_length=3, max_length=120)
    description = serializers.CharField(max_length=2000, allow_blank=True, required=False)
    category = serializers.ChoiceField(choices=Ticket.Category.choices)
    priority = serializers.ChoiceField(choices=Ticket.Priority.choices)
    status = serializers.ChoiceField(choices=Ticket.Status.choices, required=False)
    property_id = serializers.PrimaryKeyRelatedField(
        source="property", queryset=Property.objects.all()
    )
    unit_id = serializers.PrimaryKeyRelatedField(
        source="unit", queryset=Unit.objects.all(), allow_null=True, required=False
    )
    assignee_id = serializers.PrimaryKeyRelatedField(
        source="assignee",
        queryset=assignable_users(),
        allow_null=True,
        required=False,
        error_messages={"does_not_exist": "Assignee must be an active user."},
    )

    def validate(self, attrs):
        ticket: Ticket | None = self.instance
        prop = attrs.get("property", ticket.property if ticket else None)
        unit = attrs.get("unit", ticket.unit if ticket else None)
        if unit is not None and prop is not None and unit.property_id != prop.pk:
            raise serializers.ValidationError(
                {"unit_id": ["Unit does not belong to the selected property."]}
            )
        return attrs
