from django.contrib import admin
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin
from .models import TarifCotisation, Cotisation


@admin.register(TarifCotisation)
class TarifCotisationAdmin(admin.ModelAdmin):
    list_display = ["categorie_affiliation", "annee", "montant_trimestriel"]
    list_filter = ["annee", "categorie_affiliation"]
    ordering = ["-annee"]


@admin.register(Cotisation)
class CotisationAdmin(ImportExportModelAdmin):
    list_display = [
        "membre", "annee", "trimestre",
        "montant_attendu", "montant_paye", "statut_badge",
        "mode_paiement", "date_paiement"
    ]
    list_filter = ["statut", "annee", "trimestre", "mode_paiement"]
    search_fields = ["membre__nom", "membre__prenom"]
    autocomplete_fields = ["membre"]
    ordering = ["-annee", "-trimestre"]

    def statut_badge(self, obj):
        colors = {
            "A_JOUR": "#1EB53A",
            "EN_RETARD": "#CE1126",
            "PARTIEL": "#F59E0B",
            "EXONERE": "#6B7280",
        }
        color = colors.get(obj.statut, "#000")
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = "Statut"
