from apps.core.routers import ApiRouter

from .views import ContractViewSet, ResidentViewSet

router = ApiRouter()
router.register("residents", ResidentViewSet, basename="resident")
router.register("contracts", ContractViewSet, basename="contract")

urlpatterns = router.urls
