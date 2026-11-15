from rest_framework import serializers

from .models import Property


class PropertySerializer(serializers.ModelSerializer):
    """Matches ``Property`` in frontend/src/types/domain.ts.

    Rollup fields must come from ``selectors.with_occupancy``.
    """

    total_units = serializers.IntegerField(read_only=True)
    occupied_units = serializers.IntegerField(read_only=True)
    available_units = serializers.IntegerField(read_only=True)
    maintenance_units = serializers.IntegerField(read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "name",
            "city",
            "country",
            "address",
            "status",
            "total_units",
            "occupied_units",
            "available_units",
            "maintenance_units",
            "manager",
            "created_at",
        ]
        read_only_fields = fields


class PropertyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["name", "city", "country", "address", "status", "manager"]
