from django.urls import path
from .views import DashboardStatsView, MembresByCycleView, CotisationsRetardView

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("dashboard/membres-par-cycle/", MembresByCycleView.as_view(), name="membres-par-cycle"),
    path("dashboard/cotisations-retard/", CotisationsRetardView.as_view(), name="cotisations-retard"),
]
