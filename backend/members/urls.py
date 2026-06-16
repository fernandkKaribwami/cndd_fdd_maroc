from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembreViewSet, ProfilEtudiantViewSet

router = DefaultRouter()
router.register("membres", MembreViewSet)
router.register("profils-etudiants", ProfilEtudiantViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
