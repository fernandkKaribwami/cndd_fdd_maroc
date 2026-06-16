from rest_framework import serializers
from .models import TarifCotisation, Cotisation


class TarifCotisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TarifCotisation
        fields = ["id", "categorie_affiliation", "annee", "montant_trimestriel"]


class CotisationSerializer(serializers.ModelSerializer):
    membre_nom = serializers.CharField(source="membre.nom_complet", read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    trimestre_display = serializers.CharField(source="get_trimestre_display", read_only=True)

    class Meta:
        model = Cotisation
        fields = [
            "id", "membre", "membre_nom", "annee", "trimestre", "trimestre_display",
            "montant_attendu", "montant_paye", "date_paiement", "mode_paiement",
            "statut", "statut_display", "commentaire",
        ]
