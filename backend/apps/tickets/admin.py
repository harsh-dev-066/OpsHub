from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "property", "priority", "status", "assignee", "updated_at")
    list_filter = ("status", "priority", "category")
    search_fields = ("id", "title", "description")
    raw_id_fields = ("property", "unit", "assignee", "created_by")
