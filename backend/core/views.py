from rest_framework import viewsets, permissions
from .models import Cycle, Domaine, Filiere, Niveau
from .serializers import CycleSerializer, DomaineSerializer, FiliereSerializer, NiveauSerializer


class CycleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cycle.objects.all()
    serializer_class = CycleSerializer
    permission_classes = [permissions.IsAuthenticated]


class DomaineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Domaine.objects.all()
    serializer_class = DomaineSerializer
    permission_classes = [permissions.IsAuthenticated]


class FiliereViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Filiere.objects.select_related("domaine").all()
    serializer_class = FiliereSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["domaine"]


class NiveauViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Niveau.objects.all()
    serializer_class = NiveauSerializer
    permission_classes = [permissions.IsAuthenticated]
