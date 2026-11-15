from django.contrib import admin

from .models import Contract, Resident


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "nationality", "move_in_date", "unit")
    search_fields = ("name", "email")
    raw_id_fields = ("unit",)


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("id", "resident", "unit", "start_date", "end_date", "status")
    list_filter = ("status",)
    raw_id_fields = ("resident", "unit")
