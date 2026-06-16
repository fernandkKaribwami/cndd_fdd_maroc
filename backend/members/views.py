from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, date
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from .models import Membre, ProfilEtudiant
from .serializers import (
    MembreListSerializer, MembreDetailSerializer, MembreCreateUpdateSerializer,
    ProfilEtudiantSerializer
)
from .filters import MembreFilter


VILLES_MAROC = [
    "Agadir", "Al Hoceima", "Azilal", "Azrou", "Béni Mellal", "Berkane",
    "Berrechid", "Casablanca", "Chefchaouen", "Dakhla", "El Jadida",
    "Errachidia", "Essaouira", "Fès", "Guelmim", "Ifrane", "Inezgane",
    "Kénitra", "Khémisset", "Khouribga", "Laâyoune", "Larache",
    "Marrakech", "Meknès", "Midelt", "Mohammedia", "Nador",
    "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé", "Settat",
    "Sidi Kacem", "Sidi Slimane", "Tan-Tan", "Tanger", "Taroudant",
    "Taourirt", "Taza", "Temara", "Tétouan", "Tiznit", "Zagora",
]


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

    @action(detail=False, methods=["get"], url_path="villes")
    def villes(self, request):
        return Response(VILLES_MAROC)

    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
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

    @action(detail=False, methods=["get"], url_path="template-import")
    def template_import(self, request):
        """Télécharge le modèle Excel pour l'import de membres."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Import Membres"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill("solid", fgColor="CE1126")

        headers = [
            "Nom *", "Prénom *", "Sexe *", "Catégorie *",
            "Statut socio-pro", "Statut compte", "Ville résidence",
            "Téléphone", "Email", "Date naissance", "Observations",
        ]
        notes = [
            "", "", "M ou F",
            "ABAGUMYABANGA / SYMPATHISANT / DIASPORA",
            "ETUDIANT / TRAVAILLEUR / SANS_ACTIVITE / AUTRE",
            "ACTIF / INACTIF / SUSPENDU",
            "", "", "", "Format: AAAA-MM-JJ", "",
        ]
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")

        ws.append([
            "NIYONKURU", "Jean", "M", "DIASPORA", "ETUDIANT", "ACTIF",
            "Casablanca", "+212612345678", "jean@email.com", "2000-01-15",
            "Exemple d'observation",
        ])
        ws.append(["" if not n else f"({n})" for n in notes])
        for col, note in enumerate(notes, 1):
            if note:
                ws.cell(row=3, column=col).font = Font(italic=True, color="999999", size=8)

        for col in ws.columns:
            max_len = max((len(str(c.value or "")) for c in col), default=0)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 50)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="modele_import_membres.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=["post"], url_path="import-excel",
            parser_classes=[MultiPartParser])
    def import_excel(self, request):
        """Importe des membres depuis un fichier Excel."""
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "Aucun fichier fourni"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wb = openpyxl.load_workbook(file, read_only=True)
        except Exception:
            return Response({"error": "Fichier Excel invalide"}, status=status.HTTP_400_BAD_REQUEST)

        ws = wb.active
        created = 0
        errors = []

        CATEGORIE_VALID = {"ABAGUMYABANGA", "SYMPATHISANT", "DIASPORA"}
        SOCIO_VALID = {"ETUDIANT", "TRAVAILLEUR", "SANS_ACTIVITE", "AUTRE"}
        COMPTE_VALID = {"ACTIF", "INACTIF", "SUSPENDU"}

        for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not row or not row[0] or str(row[0]).strip().startswith("("):
                continue
            nom = str(row[0] or "").strip()
            prenom = str(row[1] or "").strip() if len(row) > 1 else ""
            if not nom or not prenom:
                errors.append({"ligne": i, "erreur": "Nom et Prénom obligatoires"})
                continue
            try:
                sexe_raw = str(row[2] or "M").strip().upper() if len(row) > 2 else "M"
                sexe = "F" if sexe_raw.startswith("F") else "M"

                cat = str(row[3] or "DIASPORA").strip().upper() if len(row) > 3 else "DIASPORA"
                if cat not in CATEGORIE_VALID:
                    cat = "DIASPORA"

                socio = str(row[4] or "AUTRE").strip().upper().replace(" ", "_") if len(row) > 4 else "AUTRE"
                if socio not in SOCIO_VALID:
                    socio = "AUTRE"

                compte = str(row[5] or "ACTIF").strip().upper() if len(row) > 5 else "ACTIF"
                if compte not in COMPTE_VALID:
                    compte = "ACTIF"

                ville = str(row[6] or "").strip() if len(row) > 6 else ""
                telephone = str(row[7] or "").strip() if len(row) > 7 else ""
                email_val = str(row[8] or "").strip() if len(row) > 8 else ""

                date_naissance = None
                if len(row) > 9 and row[9]:
                    try:
                        val = row[9]
                        if isinstance(val, datetime):
                            date_naissance = val.date()
                        elif isinstance(val, date):
                            date_naissance = val
                        else:
                            date_naissance = datetime.strptime(str(val).strip(), "%Y-%m-%d").date()
                    except Exception:
                        pass

                obs = str(row[10] or "").strip() if len(row) > 10 else ""

                Membre.objects.create(
                    nom=nom, prenom=prenom, sexe=sexe,
                    date_naissance=date_naissance,
                    telephone=telephone, email=email_val,
                    ville_residence=ville,
                    categorie_affiliation=cat,
                    statut_socio_pro=socio,
                    statut_compte=compte,
                    observations=obs,
                )
                created += 1
            except Exception as e:
                errors.append({"ligne": i, "erreur": str(e)})

        return Response({"crees": created, "erreurs": errors})

    @action(detail=False, methods=["get"], url_path="etudiants")
    def etudiants(self, request):
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
