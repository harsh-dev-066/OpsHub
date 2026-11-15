from rest_framework import serializers

from .models import ActivityItem


class ActivityItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityItem
        fields = ["id", "type", "message", "timestamp", "entity_id"]
        read_only_fields = fields
