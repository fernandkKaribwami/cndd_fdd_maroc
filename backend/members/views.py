from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from .models import Membre, ProfilEtudiant
from .serializers import (
    MembreListSerializer, MembreDetailSerializer, MembreCreateUpdateSerializer,
    ProfilEtudiantSerializer
)
from .filters import MembreFilter


class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.select_related("profil_etudiant").prefetch_related("cotisations")
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MembreFilter
    search_fields = ["nom", "prenom", "email", "telephone", "ville_residence"]
    ordering_fields = ["nom", "prenom", "date_adhesion", "categorie_affiliation"]
    ordering = ["nom"]

    def get_serializer_class(self):
        if self.action == "list":
            return MembreListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return MembreCreateUpdateSerializer
        return MembreDetailSerializer

    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        """Exporte la liste filtrée des membres en Excel."""
        queryset = self.filter_queryset(self.get_queryset())

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Membres"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill("solid", fgColor="CE1126")

        headers = [
            "ID", "Nom", "Prénom", "Sexe", "Catégorie", "Statut socio-pro",
            "Statut compte", "Ville", "Email", "Téléphone", "Date adhésion"
        ]
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")

        for row, membre in enumerate(queryset, 2):
            ws.cell(row=row, column=1, value=membre.id)
            ws.cell(row=row, column=2, value=membre.nom)
            ws.cell(row=row, column=3, value=membre.prenom)
            ws.cell(row=row, column=4, value=membre.get_sexe_display())
            ws.cell(row=row, column=5, value=membre.get_categorie_affiliation_display())
            ws.cell(row=row, column=6, value=membre.get_statut_socio_pro_display())
            ws.cell(row=row, column=7, value=membre.get_statut_compte_display())
            ws.cell(row=row, column=8, value=membre.ville_residence)
            ws.cell(row=row, column=9, value=membre.email)
            ws.cell(row=row, column=10, value=membre.telephone)
            ws.cell(row=row, column=11, value=str(membre.date_adhesion))

        for col in ws.columns:
            max_len = max((len(str(c.value or "")) for c in col), default=0)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 40)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="membres_cndd_fdd.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=["get"], url_path="etudiants")
    def etudiants(self, request):
        """Liste des membres étudiants avec leur profil."""
        queryset = self.filter_queryset(
            self.get_queryset().filter(statut_socio_pro="ETUDIANT")
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MembreDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MembreDetailSerializer(queryset, many=True)
        return Response(serializer.data)


class ProfilEtudiantViewSet(viewsets.ModelViewSet):
    queryset = ProfilEtudiant.objects.select_related(
        "membre", "cycle", "domaine", "filiere", "niveau"
    ).all()
    serializer_class = ProfilEtudiantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["cycle", "domaine", "filiere", "niveau", "annee_academique", "statut_parcours"]
    search_fields = ["membre__nom", "membre__prenom", "etablissement", "ville_etudes"]
