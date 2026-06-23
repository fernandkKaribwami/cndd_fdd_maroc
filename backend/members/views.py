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
from core.models import Cycle, Domaine, Filiere, Niveau
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

# Ville principale associée à chaque cellule (pour pré-remplir ville_residence)
CELLULE_VILLE = {
    "TANGER_TETOUAN_OUJDA": "Tanger",
    "KENITRA": "Kénitra",
    "AGADIR": "Agadir",
    "RABAT_SALE": "Rabat",
    "LAAYOUNE_DAKHLA": "Laâyoune",
    "FEZ_MEKNES": "Fès",
    "CASABLANCA": "Casablanca",
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

        def classify_header(text_upper):
            """Retourne (statut, cycle_nom, skip) pour un en-tête de colonne.
            skip=True → colonne à ignorer (spécialités, descriptions, etc.)
            """
            # Colonnes à ignorer explicitement
            if re.search(r'SPÉCIALTÉ|SPÉCIALITÉ|SPECIALTE|SPECIALITÉ', text_upper):
                return ("SKIP", None)
            if re.search(r'PROFESSIONNEL', text_upper):
                return ("TRAVAILLEUR", None)
            if "DOCTORAL" in text_upper:
                return ("ETUDIANT", "Doctorat")
            if "MASTER" in text_upper:
                return ("ETUDIANT", "Master")
            if re.search(r'INGÉNI|INGENI', text_upper):
                return ("ETUDIANT", "Cycle ingénieur")
            if re.search(r'MÉDECINE|MEDECINE', text_upper):
                return ("ETUDIANT", "Médecine")
            if re.search(r'\bLICENCE\b', text_upper):
                return ("ETUDIANT", "Licence")
            return None

        def is_name_cell(text):
            """Retourne True si le texte d'une cellule ressemble à un nom de personne."""
            text = text.strip()
            if len(text) < 3 or len(text) > 65:
                return False
            upper = text.upper()
            # En-têtes/mots-clés à ignorer
            SKIP_EXACT = {
                "ABAGUMYABANGA", "SECTION MAROC", "SECTION", "MAROC",
                "LES PROFESSIONNELS", "PROFESSIONNELS", "SPÉCIALTÉ",
                "SPÉCIALITÉ", "N°", "NOM", "PRÉNOM", "LISTE",
                "CYCLE DOCTORAL", "DOCTORAL", "MASTER",
                "INGÉNIEURIE", "MÉDECINE", "MEDECINE", "LICENCE",
            }
            if upper in SKIP_EXACT:
                return False
            if upper.startswith("CELLULE"):
                return False
            # Au moins 2 mots
            parts = text.split()
            if len(parts) < 2:
                return False
            # Principalement des lettres
            alpha = sum(1 for c in text if c.isalpha() or c in " -'")
            if len(text) > 0 and alpha / len(text) < 0.72:
                return False
            if re.search(r'\d{3,}', text):
                return False
            return True

        def parse_name(cell_text):
            """Extrait (nom, prénom) depuis le texte d'une cellule."""
            t = cell_text.strip()
            t = re.sub(
                r'^(Dr\.?\s*|S\.E\.?\s*|M\.?\s*(?=\b[A-Z])|Mme\.?\s*|Prof\.?\s*)',
                '', t, flags=re.IGNORECASE,
            )
            t = re.sub(r'\s*\(.*?\)', '', t)
            t = re.sub(r'\s*(Ambassadeur|Conseiller|Attaché|Chancelier)\b.*$', '', t, flags=re.IGNORECASE)
            t = t.strip()
            parts = t.split()
            if len(parts) < 2:
                return None, None
            if parts[0] == parts[0].upper() and len(parts[0]) > 1:
                return parts[0], ' '.join(parts[1:])
            return parts[0], ' '.join(parts[1:])

        def infer_sex(prenom):
            if not prenom:
                return "M"
            first = prenom.split()[0].lower().strip(".,")
            return "F" if first in FEMALE_FIRST_NAMES else "M"

        extracted = []
        current_cellule = ""
        current_statut = "AUTRE"
        current_cycle = None

        try:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    tables = page.extract_tables()
                    if not tables:
                        continue

                    # col_idx → (statut, cycle_nom)  |  "SKIP" → colonne ignorée
                    col_info: dict = {}

                    for table in tables:
                        for row in table:
                            if not row:
                                continue

                            # ── Passe 1 : détecter si c'est une ligne d'en-têtes ──
                            new_col_info = {}
                            header_found = False
                            for ci, cell in enumerate(row):
                                if not cell:
                                    continue
                                upper_cs = str(cell).strip().upper()
                                if "CELLULE" in upper_cs:
                                    detected = detect_cellule(upper_cs)
                                    if detected:
                                        current_cellule = detected
                                    new_col_info[ci] = ("SKIP", None)
                                    header_found = True
                                else:
                                    result = classify_header(upper_cs)
                                    if result is not None:
                                        new_col_info[ci] = result
                                        header_found = True

                            if header_found and new_col_info:
                                col_info = new_col_info
                                # Statut/cycle global = première colonne non-SKIP
                                for v in col_info.values():
                                    if v[0] != "SKIP":
                                        current_statut = v[0]
                                        current_cycle = v[1]
                                        break
                                continue  # ligne d'en-tête → pas de noms

                            # ── Passe 2 : traiter les cellules de données ──
                            for ci, cell in enumerate(row):
                                if not cell:
                                    continue
                                cs = str(cell).strip()
                                if not cs:
                                    continue
                                upper_cs = cs.upper()

                                # Cellule fusionnée contenant un nom de cellule
                                if "CELLULE" in upper_cs:
                                    detected = detect_cellule(upper_cs)
                                    if detected:
                                        current_cellule = detected
                                    continue

                                # Colonne marquée SKIP (ex: "Spécialté")
                                col_meta = col_info.get(ci)
                                if col_meta and col_meta[0] == "SKIP":
                                    continue

                                cell_statut = (col_meta[0] if col_meta else None) or current_statut
                                cell_cycle = (col_meta[1] if col_meta else None) or current_cycle

                                if is_name_cell(cs):
                                    nom, prenom = parse_name(cs)
                                    if nom and prenom and len(nom) >= 2 and len(prenom) >= 2:
                                        extracted.append({
                                            "nom": nom,
                                            "prenom": prenom,
                                            "sexe": infer_sex(prenom),
                                            "cellule": current_cellule,
                                            "statut_socio_pro": cell_statut,
                                            "cycle_nom": cell_cycle,
                                            "categorie_affiliation": "ABAGUMYABANGA",
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

        # Domaine/filière/niveau génériques pour les étudiants sans profil détaillé
        _domaine_cache: dict = {}
        _filiere_cache: dict = {}
        _cycle_cache: dict = {}
        _niveau_cache: dict = {}

        def get_or_create_cycle(nom):
            if nom not in _cycle_cache:
                obj, _ = Cycle.objects.get_or_create(nom=nom)
                _cycle_cache[nom] = obj
            return _cycle_cache[nom]

        def get_placeholder_domaine():
            key = "Non spécifié"
            if key not in _domaine_cache:
                obj, _ = Domaine.objects.get_or_create(nom=key)
                _domaine_cache[key] = obj
            return _domaine_cache[key]

        def get_placeholder_filiere(domaine):
            key = domaine.id
            if key not in _filiere_cache:
                obj, _ = Filiere.objects.get_or_create(
                    nom="Non spécifiée", domaine=domaine
                )
                _filiere_cache[key] = obj
            return _filiere_cache[key]

        def get_placeholder_niveau():
            key = "Non spécifié"
            if key not in _niveau_cache:
                obj, _ = Niveau.objects.get_or_create(nom=key)
                _niveau_cache[key] = obj
            return _niveau_cache[key]

        for i, m_data in enumerate(extracted):
            try:
                membre, was_created = Membre.objects.get_or_create(
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
                    # Créer ProfilEtudiant si le cycle est connu
                    cycle_nom = m_data.get("cycle_nom")
                    if m_data["statut_socio_pro"] == "ETUDIANT" and cycle_nom:
                        cycle = get_or_create_cycle(cycle_nom)
                        domaine = get_placeholder_domaine()
                        filiere = get_placeholder_filiere(domaine)
                        niveau = get_placeholder_niveau()
                        ProfilEtudiant.objects.get_or_create(
                            membre=membre,
                            defaults={
                                "cycle": cycle,
                                "domaine": domaine,
                                "filiere": filiere,
                                "niveau": niveau,
                                "etablissement": "Non spécifié",
                                "ville_etudes": "",
                                "annee_academique": "2025-2026",
                            },
                        )
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
