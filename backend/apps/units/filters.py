import django_filters

from .models import Unit


class UnitFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Unit.Status.choices)
    type = django_filters.ChoiceFilter(choices=Unit.Type.choices)
    propertyId = django_filters.CharFilter(field_name="property_id")

    class Meta:
        model = Unit
        fields = ["status", "type", "propertyId"]
