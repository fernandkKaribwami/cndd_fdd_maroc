from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Membre, ProfilEtudiant


class ProfilEtudiantInline(admin.StackedInline):
    model = ProfilEtudiant
    extra = 0
    can_delete = False


@admin.register(Membre)
class MembreAdmin(ImportExportModelAdmin):
    list_display = [
        "nom", "prenom", "sexe", "categorie_affiliation",
        "statut_socio_pro", "statut_compte", "ville_residence", "date_adhesion"
    ]
    list_filter = [
        "categorie_affiliation", "statut_socio_pro", "statut_compte",
        "sexe", "ville_residence",
    ]
    search_fields = ["nom", "prenom", "email", "telephone"]
    inlines = [ProfilEtudiantInline]
    date_hierarchy = "date_adhesion"
    ordering = ["nom", "prenom"]
    readonly_fields = ["date_adhesion"]

    fieldsets = (
        ("Identité", {
            "fields": ("nom", "prenom", "sexe", "date_naissance")
        }),
        ("Contact", {
            "fields": ("telephone", "email", "ville_residence", "date_arrivee_maroc")
        }),
        ("Affiliation CNDD-FDD", {
            "fields": ("categorie_affiliation", "statut_compte", "date_adhesion")
        }),
        ("Statut socio-professionnel", {
            "fields": ("statut_socio_pro",)
        }),
        ("Observations", {
            "fields": ("observations",),
            "classes": ("collapse",)
        }),
    )


@admin.register(ProfilEtudiant)
class ProfilEtudiantAdmin(ImportExportModelAdmin):
    list_display = [
        "membre", "cycle", "domaine", "filiere",
        "niveau", "etablissement", "annee_academique", "statut_parcours"
    ]
    list_filter = [
        "cycle", "domaine", "filiere", "niveau",
        "annee_academique", "statut_parcours"
    ]
    search_fields = [
        "membre__nom", "membre__prenom", "etablissement", "ville_etudes"
    ]
    autocomplete_fields = ["membre"]
