from rest_framework import serializers
from .models import Cycle, Domaine, Filiere, Niveau


class CycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cycle
        fields = ["id", "nom", "ordre"]


class DomaineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domaine
        fields = ["id", "nom"]


class FiliereSerializer(serializers.ModelSerializer):
    domaine_nom = serializers.CharField(source="domaine.nom", read_only=True)

    class Meta:
        model = Filiere
        fields = ["id", "nom", "domaine", "domaine_nom"]


class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = ["id", "nom", "ordre"]
