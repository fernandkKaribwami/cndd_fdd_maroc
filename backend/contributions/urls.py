from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TarifCotisationViewSet, CotisationViewSet

router = DefaultRouter()
router.register("tarifs-cotisation", TarifCotisationViewSet)
router.register("cotisations", CotisationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
