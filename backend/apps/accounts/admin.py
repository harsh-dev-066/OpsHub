from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "name", "email", "roles", "is_active", "date_joined")
    list_filter = ("is_active", "is_staff")
    search_fields = ("username", "name", "email")
    ordering = ("date_joined",)
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Profile", {"fields": ("name", "email", "roles")}),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "name", "email", "roles", "password1", "password2"),
            },
        ),
    )
