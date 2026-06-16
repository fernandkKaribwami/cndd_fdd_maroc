from django.contrib import admin
from .models import Cycle, Domaine, Filiere, Niveau


@admin.register(Cycle)
class CycleAdmin(admin.ModelAdmin):
    list_display = ["nom", "ordre"]
    ordering = ["ordre"]


@admin.register(Domaine)
class DomaineAdmin(admin.ModelAdmin):
    list_display = ["nom"]
    search_fields = ["nom"]


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ["nom", "domaine"]
    list_filter = ["domaine"]
    search_fields = ["nom", "domaine__nom"]


@admin.register(Niveau)
class NiveauAdmin(admin.ModelAdmin):
    list_display = ["nom", "ordre"]
    ordering = ["ordre"]
