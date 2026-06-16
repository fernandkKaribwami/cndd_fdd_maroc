from rest_framework import serializers
from .models import Membre, ProfilEtudiant
from core.serializers import CycleSerializer, DomaineSerializer, FiliereSerializer, NiveauSerializer


class ProfilEtudiantSerializer(serializers.ModelSerializer):
    cycle_detail = CycleSerializer(source="cycle", read_only=True)
    domaine_detail = DomaineSerializer(source="domaine", read_only=True)
    filiere_detail = FiliereSerializer(source="filiere", read_only=True)
    niveau_detail = NiveauSerializer(source="niveau", read_only=True)

    class Meta:
        model = ProfilEtudiant
        fields = [
            "id", "cycle", "cycle_detail", "domaine", "domaine_detail",
            "filiere", "filiere_detail", "niveau", "niveau_detail",
            "etablissement", "ville_etudes", "annee_academique",
            "statut_parcours", "date_diplome",
        ]


class MembreListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour les listes (pagination)."""
    statut_cotisation = serializers.SerializerMethodField()

    class Meta:
        model = Membre
        fields = [
            "id", "nom", "prenom", "sexe", "categorie_affiliation",
            "statut_socio_pro", "statut_compte", "ville_residence",
            "cellule", "date_adhesion", "statut_cotisation",
        ]

    def get_statut_cotisation(self, obj):
        derniere = obj.cotisations.order_by("-annee", "-trimestre").first()
        if not derniere:
            return None
        return derniere.statut


class MembreDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la fiche membre."""
    profil_etudiant = ProfilEtudiantSerializer(read_only=True)
    nom_complet = serializers.ReadOnlyField()
    statut_cotisation = serializers.SerializerMethodField()

    class Meta:
        model = Membre
        fields = [
            "id", "nom", "prenom", "nom_complet", "sexe", "date_naissance",
            "telephone", "email", "ville_residence", "date_arrivee_maroc",
            "categorie_affiliation", "statut_socio_pro", "statut_compte",
            "cellule", "date_adhesion", "observations", "profil_etudiant", "statut_cotisation",
        ]

    def get_statut_cotisation(self, obj):
        derniere = obj.cotisations.order_by("-annee", "-trimestre").first()
        return derniere.statut if derniere else None


class MembreCreateUpdateSerializer(serializers.ModelSerializer):
    profil_etudiant = ProfilEtudiantSerializer(required=False)

    class Meta:
        model = Membre
        fields = [
            "id", "nom", "prenom", "sexe", "date_naissance",
            "telephone", "email", "ville_residence", "date_arrivee_maroc",
            "categorie_affiliation", "statut_socio_pro", "statut_compte",
            "cellule", "observations", "profil_etudiant",
        ]

    def create(self, validated_data):
        profil_data = validated_data.pop("profil_etudiant", None)
        membre = Membre.objects.create(**validated_data)
        if profil_data:
            ProfilEtudiant.objects.create(membre=membre, **profil_data)
        return membre

    def update(self, instance, validated_data):
        profil_data = validated_data.pop("profil_etudiant", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if profil_data:
            ProfilEtudiant.objects.update_or_create(
                membre=instance, defaults=profil_data
            )
        return instance
