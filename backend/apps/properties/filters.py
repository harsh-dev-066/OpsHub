import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Property.Status.choices)
    city = django_filters.CharFilter(field_name="city", lookup_expr="iexact")

    class Meta:
        model = Property
        fields = ["status", "city"]
