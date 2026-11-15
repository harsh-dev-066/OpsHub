import django_filters

from .models import Ticket


class TicketFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Ticket.Status.choices)
    priority = django_filters.ChoiceFilter(choices=Ticket.Priority.choices)
    category = django_filters.ChoiceFilter(choices=Ticket.Category.choices)
    propertyId = django_filters.CharFilter(field_name="property_id")
    unitId = django_filters.CharFilter(field_name="unit_id")
    assigneeId = django_filters.CharFilter(field_name="assignee_id")

    class Meta:
        model = Ticket
        fields = ["status", "priority", "category", "propertyId", "unitId", "assigneeId"]
