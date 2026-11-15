import django_filters

from .models import Contract


class ContractFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Contract.Status.choices)

    class Meta:
        model = Contract
        fields = ["status"]
