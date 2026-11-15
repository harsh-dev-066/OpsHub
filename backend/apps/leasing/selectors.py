from django.db.models import QuerySet

from .models import Contract, Resident


def resident_list() -> QuerySet[Resident]:
    return Resident.objects.all()


def contract_list() -> QuerySet[Contract]:
    return Contract.objects.all()


def current_contracts() -> QuerySet[Contract]:
    return Contract.objects.filter(status__in=Contract.CURRENT_STATUSES)


def current_contract_for_unit(unit_id: str) -> Contract | None:
    """The contract holding the unit now, else the most recent one."""
    contract = current_contracts().filter(unit_id=unit_id).order_by("-start_date").first()
    if contract is None:
        contract = Contract.objects.filter(unit_id=unit_id).order_by("-start_date").first()
    return contract
