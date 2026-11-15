from django.contrib import admin

from .models import ActivityItem


@admin.register(ActivityItem)
class ActivityItemAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "type", "message", "entity_id", "actor")
    list_filter = ("type",)
    search_fields = ("message", "entity_id")
