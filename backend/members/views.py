from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, date
import re
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

CELLULE_MAP_PDF = {
    "TANGER": "TANGER_TETOUAN_OUJDA",
    "TÉTOUAN": "TANGER_TETOUAN_OUJDA",
    "TETOUAN": "TANGER_TETOUAN_OUJDA",
    "OUJDA": "TANGER_TETOUAN_OUJDA",
    "KÉNITRA": "KENITRA",
    "KENITRA": "KENITRA",
    "AGADIR": "AGADIR",
    "RABAT": "RABAT_SALE",
    "SALÉ": "RABAT_SALE",
    "SALE": "RABAT_SALE",
    "LAAYOUNE": "LAAYOUNE_DAKHLA",
    "LAÂYOUNE": "LAAYOUNE_DAKHLA",
    "DAKHLA": "LAAYOUNE_DAKHLA",
    "FÈS": "FEZ_MEKNES",
    "FEZ": "FEZ_MEKNES",
    "FES": "FEZ_MEKNES",
    "MEKNÈS": "FEZ_MEKNES",
    "MEKNES": "FEZ_MEKNES",
    "CASABLANCA": "CASABLANCA",
}

CELLULE_VALID = {
    "TANGER_TETOUAN_OUJDA", "KENITRA", "AGADIR", "RABAT_SALE",
    "LAAYOUNE_DAKHLA", "FEZ_MEKNES", "CASABLANCA", "AUTRE",
}

PDF_SKIP_PATTERNS = re.compile(
    r'^(ABAGUMYABANGA|MAROC|LISTE|SECTION|CNDD|FDD|SPÉCIALTÉ|SPECIALTE'
    r'|N°|MEMBRES|CELLULE|CYCLE|NIVEAU|PROFESSIONNELS|LES\s+PROFESSIONNELS'
    r'|CYCLE\s+DOCTORAL|CYCLE\s+D.INGÉNI|MASTER|MÉDECINE|LICENCE'
    r'|PROFIL|CATEGORIE|CATEGORIE|NOM\s+COMPLET)\b',
    re.IGNORECASE | re.UNICODE
)

FEMALE_FIRST_NAMES = {
    "monia", "joëlla", "joella", "sandra", "aloysie", "florence", "élodie",
    "elodie", "diane", "divine", "francine", "collade", "ornella", "lady",
    "belyse", "olivella", "patience", "angélique", "angelique", "sandrine",
    "gérardine", "gerardine", "alice", "bella", "fleur", "princia", "carelle",
    "clairia", "leila", "eunice", "joyce", "delis", "christa", "mélance",
    "melance", "mireille", "praxède", "praxede", "kerry", "kerren", "livia",
    "deltine", "diesse", "verlaine", "dominique", "fabiola", "grace",
    "marlène", "marlene", "nadège", "nadege", "noëlle", "noelle",
    "quinthia", "rose", "sylvie", "yvette", "fatima", "nimpaye",
    "nahimana", "iteka", "uwihoreye", "mado", "nkurunziza",
    "niyobuhungiro", "niyonkuru", "nsanganiye", "mukamarakiza", "niyokindi",
    "namugisha", "ishimwe", "ngabirano", "singirankabo", "ndizeye",
    "irangabiye", "matsiko", "irankunda",
}


class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.select_related("profil_etudiant").prefetch_related("cotisations")
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MembreFilter
    search_fields = ["nom", "prenom", "email", "telephone", "ville_residence"]
    ordering_fields = ["nom", "prenom", "date_adhesion", "categorie_affiliation", "cellule"]
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

    @action(detail=False, methods=["get"], url_path="cellules")
    def cellules(self, request):
        return Response([
            {"value": k, "label": v}
            for k, v in Membre.CELLULE_CHOICES
        ])

    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Membres"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill("solid", fgColor="CE1126")

        headers = [
            "ID", "Nom", "Prénom", "Sexe", "Cellule", "Catégorie", "Statut socio-pro",
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
            ws.cell(row=row, column=5, value=membre.get_cellule_display() if membre.cellule else "")
            ws.cell(row=row, column=6, value=membre.get_categorie_affiliation_display())
            ws.cell(row=row, column=7, value=membre.get_statut_socio_pro_display())
            ws.cell(row=row, column=8, value=membre.get_statut_compte_display())
            ws.cell(row=row, column=9, value=membre.ville_residence)
            ws.cell(row=row, column=10, value=membre.email)
            ws.cell(row=row, column=11, value=membre.telephone)
            ws.cell(row=row, column=12, value=str(membre.date_adhesion))

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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Import Membres"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill("solid", fgColor="CE1126")

        headers = [
            "Nom *", "Prénom *", "Sexe *", "Catégorie *", "Cellule",
            "Statut socio-pro", "Statut compte", "Ville résidence",
            "Téléphone", "Email", "Date naissance", "Observations",
        ]
        notes = [
            "", "", "M ou F",
            "ABAGUMYABANGA / SYMPATHISANT / DIASPORA",
            "TANGER_TETOUAN_OUJDA / KENITRA / AGADIR / RABAT_SALE / LAAYOUNE_DAKHLA / FEZ_MEKNES / CASABLANCA",
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
            "NIYONKURU", "Jean", "M", "ABAGUMYABANGA", "RABAT_SALE", "ETUDIANT", "ACTIF",
            "Rabat", "+212612345678", "jean@email.com", "2000-01-15",
            "Exemple d'observation",
        ])
        ws.append(["" if not n else f"({n})" for n in notes])
        for col, note in enumerate(notes, 1):
            if note:
                ws.cell(row=3, column=col).font = Font(italic=True, color="999999", size=8)

        for col in ws.columns:
            max_len = max((len(str(c.value or "")) for c in col), default=0)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 55)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="modele_import_membres.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=["post"], url_path="import-excel",
            parser_classes=[MultiPartParser])
    def import_excel(self, request):
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

                cellule = str(row[4] or "").strip().upper() if len(row) > 4 else ""
                if cellule not in CELLULE_VALID:
                    cellule = ""

                socio = str(row[5] or "AUTRE").strip().upper().replace(" ", "_") if len(row) > 5 else "AUTRE"
                if socio not in SOCIO_VALID:
                    socio = "AUTRE"

                compte = str(row[6] or "ACTIF").strip().upper() if len(row) > 6 else "ACTIF"
                if compte not in COMPTE_VALID:
                    compte = "ACTIF"

                ville = str(row[7] or "").strip() if len(row) > 7 else ""
                telephone = str(row[8] or "").strip() if len(row) > 8 else ""
                email_val = str(row[9] or "").strip() if len(row) > 9 else ""

                date_naissance = None
                if len(row) > 10 and row[10]:
                    try:
                        val = row[10]
                        if isinstance(val, datetime):
                            date_naissance = val.date()
                        elif isinstance(val, date):
                            date_naissance = val
                        else:
                            date_naissance = datetime.strptime(str(val).strip(), "%Y-%m-%d").date()
                    except Exception:
                        pass

                obs = str(row[11] or "").strip() if len(row) > 11 else ""

                Membre.objects.create(
                    nom=nom, prenom=prenom, sexe=sexe,
                    date_naissance=date_naissance,
                    telephone=telephone, email=email_val,
                    ville_residence=ville,
                    categorie_affiliation=cat,
                    cellule=cellule,
                    statut_socio_pro=socio,
                    statut_compte=compte,
                    observations=obs,
                )
                created += 1
            except Exception as e:
                errors.append({"ligne": i, "erreur": str(e)})

        return Response({"crees": created, "erreurs": errors})

    @action(detail=False, methods=["post"], url_path="import-pdf",
            parser_classes=[MultiPartParser])
    def import_pdf(self, request):
        """Import intelligent depuis un fichier PDF ABAGUMYABANGA."""
        try:
            import pdfplumber
        except ImportError:
            return Response(
                {"error": "Le module pdfplumber n'est pas installé sur le serveur."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        file = request.FILES.get("file")
        if not file:
            return Response({"error": "Aucun fichier fourni"}, status=status.HTTP_400_BAD_REQUEST)

        def detect_cellule(text_upper):
            for key, val in CELLULE_MAP_PDF.items():
                if key in text_upper:
                    return val
            return None

        def is_name_line(text):
            """Retourne True si la ligne ressemble à un nom de personne."""
            text = text.strip()
            if len(text) < 4 or len(text) > 70:
                return False
            # Ignorer les lignes trop courtes ou qui sont des mots-clés
            if PDF_SKIP_PATTERNS.match(text):
                return False
            # Doit contenir au moins 2 mots
            parts = text.split()
            if len(parts) < 2:
                return False
            # Doit contenir principalement des lettres
            alpha_chars = sum(1 for c in text if c.isalpha() or c in "-' ")
            if alpha_chars / len(text) < 0.75:
                return False
            # Exclure les lignes avec des chiffres ou caractères spéciaux
            if re.search(r'\d{2,}', text):
                return False
            return True

        def parse_name(line):
            """Extrait nom/prénom depuis une ligne."""
            # Supprimer titres honorifiques
            line = re.sub(
                r'^(Dr\.?\s*|S\.E\.?\s*|M\.?\s*(?=\b)|Mme\.?\s*|Prof\.?\s*|'
                r'1er\s+|1ère\s+|2è[mèe]*\s+|Ambassadeur\s+)',
                '', line.strip(), flags=re.IGNORECASE
            )
            # Supprimer annotations entre parenthèses
            line = re.sub(r'\s*\(.*?\)', '', line).strip()
            # Supprimer rôles officiels en fin
            line = re.sub(
                r'\s*(Ambassadeur|Conseiller|Attaché|Chancelier).*$',
                '', line, flags=re.IGNORECASE
            ).strip()
            parts = line.split()
            if len(parts) < 2:
                return None, None
            # Heuristique : si le premier mot est en MAJUSCULES → c'est le NOM
            if parts[0] == parts[0].upper() and len(parts[0]) > 1:
                return parts[0], ' '.join(parts[1:])
            # Sinon premier mot = NOM (capitalisé), reste = prénom
            return parts[0], ' '.join(parts[1:])

        def infer_sex(prenom):
            """Déduit le sexe à partir du prénom."""
            if not prenom:
                return "M"
            first = prenom.split()[0].lower().strip(".,")
            return "F" if first in FEMALE_FIRST_NAMES else "M"

        extracted = []
        current_cellule = ""
        current_statut = "AUTRE"
        current_categorie = "ABAGUMYABANGA"

        try:
            with pdfplumber.open(file) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if not text:
                        continue

                    lines = [l.strip() for l in text.split('\n') if l.strip()]

                    for line in lines:
                        upper = line.upper()

                        # Détecter la cellule
                        if "CELLULE" in upper:
                            detected = detect_cellule(upper)
                            if detected:
                                current_cellule = detected
                            continue

                        # Détecter le type socio-professionnel
                        if re.search(r'PROFESSIONNEL', upper):
                            current_statut = "TRAVAILLEUR"
                            continue
                        if re.search(r'CYCLE\s+DOCTORAL', upper):
                            current_statut = "ETUDIANT"
                            continue
                        if re.search(r'\bMASTER\b', upper):
                            current_statut = "ETUDIANT"
                            continue
                        if re.search(r'INGÉNI|INGENI', upper):
                            current_statut = "ETUDIANT"
                            continue
                        if re.search(r'MÉDECINE|MEDECINE', upper):
                            current_statut = "ETUDIANT"
                            continue
                        if re.search(r'\bLICENCE\b', upper):
                            current_statut = "ETUDIANT"
                            continue

                        # Essayer de parser comme nom
                        if is_name_line(line):
                            nom, prenom = parse_name(line)
                            if nom and prenom and len(nom) >= 2 and len(prenom) >= 2:
                                sexe = infer_sex(prenom)
                                extracted.append({
                                    "nom": nom,
                                    "prenom": prenom,
                                    "sexe": sexe,
                                    "cellule": current_cellule,
                                    "statut_socio_pro": current_statut,
                                    "categorie_affiliation": current_categorie,
                                })

        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la lecture du PDF : {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer les membres en base
        created = 0
        skipped = 0
        errors = []

        for i, m_data in enumerate(extracted):
            try:
                _, was_created = Membre.objects.get_or_create(
                    nom__iexact=m_data["nom"],
                    prenom__iexact=m_data["prenom"],
                    defaults={
                        "nom": m_data["nom"],
                        "prenom": m_data["prenom"],
                        "sexe": m_data["sexe"],
                        "cellule": m_data["cellule"],
                        "statut_socio_pro": m_data["statut_socio_pro"],
                        "categorie_affiliation": m_data["categorie_affiliation"],
                        "statut_compte": "ACTIF",
                        "observations": "Importé automatiquement depuis PDF ABAGUMYABANGA",
                    }
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1
            except Exception as e:
                errors.append({"index": i + 1, "nom": m_data.get("nom", "?"), "erreur": str(e)})

        return Response({
            "extraits": len(extracted),
            "crees": created,
            "ignores": skipped,
            "erreurs": errors,
        })

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
