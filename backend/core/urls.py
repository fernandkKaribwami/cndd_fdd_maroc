from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CycleViewSet, DomaineViewSet, FiliereViewSet, NiveauViewSet

router = DefaultRouter()
router.register("cycles", CycleViewSet)
router.register("domaines", DomaineViewSet)
router.register("filieres", FiliereViewSet)
router.register("niveaux", NiveauViewSet)

urlpatterns = [
    path("referentiels/", include(router.urls)),
]
