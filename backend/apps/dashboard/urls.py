from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/summary", views.SummaryView.as_view(), name="dashboard-summary"),
    path("dashboard/occupancy", views.OccupancyView.as_view(), name="dashboard-occupancy"),
    path(
        "dashboard/tickets-by-priority",
        views.TicketsByPriorityView.as_view(),
        name="dashboard-tickets-by-priority",
    ),
    path(
        "dashboard/tickets-by-status",
        views.TicketsByStatusView.as_view(),
        name="dashboard-tickets-by-status",
    ),
    path("dashboard/activity", views.ActivityView.as_view(), name="dashboard-activity"),
]
