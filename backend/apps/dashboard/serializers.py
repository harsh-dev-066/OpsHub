from rest_framework import serializers


class SummarySerializer(serializers.Serializer):
    occupancy_rate = serializers.FloatField()
    available_units = serializers.IntegerField()
    maintenance_units = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    total_properties = serializers.IntegerField()
    total_units = serializers.IntegerField()


class OccupancyPointSerializer(serializers.Serializer):
    month = serializers.CharField()
    occupancy_rate = serializers.FloatField()


class BreakdownItemSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()
