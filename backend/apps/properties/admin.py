from django.contrib import admin

from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "status", "manager", "created_at")
    list_filter = ("status", "city")
    search_fields = ("name", "city", "address")
