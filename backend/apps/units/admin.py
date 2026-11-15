from django.contrib import admin

from .models import Unit


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("unit_number", "property", "type", "floor", "status", "monthly_rate")
    list_filter = ("status", "type")
    search_fields = ("unit_number", "property__name")
    raw_id_fields = ("property",)
