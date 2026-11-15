from rest_framework import serializers

from .models import Contract, Resident


class ResidentSerializer(serializers.ModelSerializer):
    unit_id = serializers.CharField(read_only=True)

    class Meta:
        model = Resident
        fields = ["id", "name", "email", "phone", "nationality", "move_in_date", "unit_id"]
        read_only_fields = fields


class ContractSerializer(serializers.ModelSerializer):
    resident_id = serializers.CharField(read_only=True)
    unit_id = serializers.CharField(read_only=True)

    class Meta:
        model = Contract
        fields = ["id", "resident_id", "unit_id", "start_date", "end_date", "status"]
        read_only_fields = fields
