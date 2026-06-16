import django_filters
from .models import Membre


class MembreFilter(django_filters.FilterSet):
    nom = django_filters.CharFilter(lookup_expr="icontains")
    prenom = django_filters.CharFilter(lookup_expr="icontains")
    ville_residence = django_filters.CharFilter(lookup_expr="icontains")
    cellule = django_filters.CharFilter(lookup_expr="exact")

    # Filtres sur le profil étudiant (jointure)
    cycle = django_filters.NumberFilter(field_name="profil_etudiant__cycle")
    domaine = django_filters.NumberFilter(field_name="profil_etudiant__domaine")
    filiere = django_filters.NumberFilter(field_name="profil_etudiant__filiere")
    niveau = django_filters.NumberFilter(field_name="profil_etudiant__niveau")
    annee_academique = django_filters.CharFilter(field_name="profil_etudiant__annee_academique")
    statut_parcours = django_filters.CharFilter(field_name="profil_etudiant__statut_parcours")
    etablissement = django_filters.CharFilter(
        field_name="profil_etudiant__etablissement", lookup_expr="icontains"
    )

    # Filtres sur les cotisations
    statut_cotisation = django_filters.CharFilter(field_name="cotisations__statut")
    annee_cotisation = django_filters.NumberFilter(field_name="cotisations__annee")
    trimestre_cotisation = django_filters.NumberFilter(field_name="cotisations__trimestre")

    class Meta:
        model = Membre
        fields = [
            "categorie_affiliation", "statut_socio_pro", "statut_compte", "sexe",
            "nom", "prenom", "ville_residence", "cellule",
            "cycle", "domaine", "filiere", "niveau", "annee_academique",
            "statut_parcours", "etablissement",
            "statut_cotisation", "annee_cotisation", "trimestre_cotisation",
        ]
