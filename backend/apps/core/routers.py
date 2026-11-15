from rest_framework.routers import DefaultRouter


class ApiRouter(DefaultRouter):
    """Router without trailing slashes and without the browsable API root."""

    include_root_view = False

    def __init__(self) -> None:
        super().__init__(trailing_slash=False)
