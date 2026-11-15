from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.leasing.selectors import current_contract_for_unit
from apps.leasing.serializers import ContractSerializer, ResidentSerializer
from apps.properties.models import Property
from apps.properties.selectors import get_property
from apps.properties.serializers import PropertySerializer

from .models import Unit


class UnitSerializer(serializers.ModelSerializer):
    """Matches ``Unit`` in frontend/src/types/domain.ts.

    Lease fields come from ``selectors.with_current_lease``.
    """

    property_id = serializers.CharField(read_only=True)
    resident = serializers.CharField(source="resident_name", read_only=True, allow_null=True)
    contract_start = serializers.DateField(read_only=True, allow_null=True)
    contract_end = serializers.DateField(read_only=True, allow_null=True)

    class Meta:
        model = Unit
        fields = [
            "id",
            "property_id",
            "unit_number",
            "type",
            "floor",
            "status",
            "resident",
            "monthly_rate",
            "contract_start",
            "contract_end",
        ]
        read_only_fields = fields


class UnitDetailSerializer(UnitSerializer):
    """Unit plus resident, contract, and parent property."""

    resident_detail = serializers.SerializerMethodField()
    contract = serializers.SerializerMethodField()
    property = serializers.SerializerMethodField()

    class Meta(UnitSerializer.Meta):
        fields = [*UnitSerializer.Meta.fields, "resident_detail", "contract", "property"]
        read_only_fields = fields

    def _contract(self, unit: Unit):
        if not hasattr(self, "_contract_cache"):
            self._contract_cache = current_contract_for_unit(unit.pk)
        return self._contract_cache

    @extend_schema_field(ResidentSerializer(allow_null=True))
    def get_resident_detail(self, unit: Unit):
        contract = self._contract(unit)
        if contract and contract.status in contract.CURRENT_STATUSES:
            return ResidentSerializer(contract.resident).data
        resident = unit.residents.order_by("-move_in_date").first()
        return ResidentSerializer(resident).data if resident else None

    @extend_schema_field(ContractSerializer(allow_null=True))
    def get_contract(self, unit: Unit):
        contract = self._contract(unit)
        return ContractSerializer(contract).data if contract else None

    @extend_schema_field(PropertySerializer)
    def get_property(self, unit: Unit):
        return PropertySerializer(get_property(unit.property_id)).data


class UnitWriteSerializer(serializers.ModelSerializer):
    property_id = serializers.PrimaryKeyRelatedField(
        source="property",
        queryset=Property.objects.all(),
    )

    class Meta:
        model = Unit
        fields = ["property_id", "unit_number", "type", "floor", "status", "monthly_rate"]
        # Uniqueness is checked in validate() to return a field-level error.
        validators = []

    def validate(self, attrs):
        prop = attrs.get("property", getattr(self.instance, "property", None))
        number = attrs.get("unit_number", getattr(self.instance, "unit_number", None))
        clash = Unit.objects.filter(property=prop, unit_number=number)
        if self.instance is not None:
            clash = clash.exclude(pk=self.instance.pk)
        if prop is not None and number and clash.exists():
            raise serializers.ValidationError(
                {"unit_number": ["This unit number already exists in the property."]}
            )
        return attrs
