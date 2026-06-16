from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from django.db.models.functions import TruncYear
from django.utils import timezone
from members.models import Membre, ProfilEtudiant
from contributions.models import Cotisation


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        annee = timezone.now().year

        # ── Totaux ───────────────────────────────────────────────
        total_membres = Membre.objects.count()
        total_actifs = Membre.objects.filter(statut_compte="ACTIF").count()
        total_etudiants = Membre.objects.filter(statut_socio_pro="ETUDIANT").count()
        total_travailleurs = Membre.objects.filter(statut_socio_pro="TRAVAILLEUR").count()

        # ── Répartitions ─────────────────────────────────────────
        par_categorie = list(
            Membre.objects.values("categorie_affiliation")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        par_cycle = list(
            ProfilEtudiant.objects.values("cycle__nom")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        par_domaine = list(
            ProfilEtudiant.objects.values("domaine__nom")
            .annotate(count=Count("id"))
            .order_by("-count")[:8]
        )

        par_ville = list(
            Membre.objects.exclude(ville_residence="")
            .values("ville_residence")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        par_statut_compte = list(
            Membre.objects.values("statut_compte")
            .annotate(count=Count("id"))
        )

        # ── Cotisations de l'année ────────────────────────────────
        cots_annee = Cotisation.objects.filter(annee=annee)
        total_attendu = cots_annee.aggregate(t=Sum("montant_attendu"))["t"] or 0
        total_paye = cots_annee.aggregate(t=Sum("montant_paye"))["t"] or 0

        par_statut_cotisation = list(
            cots_annee.values("statut").annotate(count=Count("id"))
        )

        par_trimestre = []
        for t in range(1, 5):
            qs = cots_annee.filter(trimestre=t)
            a_jour = qs.filter(statut="A_JOUR").count()
            total = qs.count()
            par_trimestre.append({
                "trimestre": f"T{t}",
                "a_jour": a_jour,
                "total": total,
                "taux": round(a_jour / total * 100, 1) if total > 0 else 0,
            })

        # ── Évolution adhésions ───────────────────────────────────
        evolution_adhesions = list(
            Membre.objects.annotate(annee_adhesion=TruncYear("date_adhesion"))
            .values("annee_adhesion")
            .annotate(count=Count("id"))
            .order_by("annee_adhesion")
        )
        evolution_adhesions = [
            {"annee": int(e["annee_adhesion"].year) if e["annee_adhesion"] else 0, "count": e["count"]}
            for e in evolution_adhesions
            if e["annee_adhesion"] is not None
        ]

        # ── Derniers membres ──────────────────────────────────────
        derniers = list(
            Membre.objects.order_by("-date_adhesion")[:5]
            .values("id", "nom", "prenom", "categorie_affiliation", "statut_compte", "date_adhesion")
        )

        # ── En retard ─────────────────────────────────────────────
        en_retard = Cotisation.objects.filter(
            annee=annee, statut__in=["EN_RETARD", "PARTIEL"]
        ).select_related("membre").count()

        return Response({
            "totaux": {
                "membres": total_membres,
                "actifs": total_actifs,
                "etudiants": total_etudiants,
                "travailleurs": total_travailleurs,
                "inactifs": total_membres - total_actifs,
            },
            "par_categorie": par_categorie,
            "par_cycle": par_cycle,
            "par_domaine": par_domaine,
            "par_ville": par_ville,
            "par_statut_compte": par_statut_compte,
            "cotisations": {
                "annee": annee,
                "total_attendu": float(total_attendu),
                "total_paye": float(total_paye),
                "taux_recouvrement": round(
                    float(total_paye) / float(total_attendu) * 100, 1
                ) if total_attendu > 0 else 0,
                "par_statut": par_statut_cotisation,
                "par_trimestre": par_trimestre,
                "en_retard": en_retard,
            },
            "evolution_adhesions": evolution_adhesions,
            "derniers_membres": derniers,
        })


class MembresByCycleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = list(
            ProfilEtudiant.objects.values("cycle__nom")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return Response(data)


class CotisationsRetardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        annee = request.query_params.get("annee", timezone.now().year)
        trimestre = request.query_params.get("trimestre")

        qs = Cotisation.objects.filter(
            annee=annee, statut__in=["EN_RETARD", "PARTIEL"]
        ).select_related("membre")

        if trimestre:
            qs = qs.filter(trimestre=trimestre)

        data = [{
            "membre_id": c.membre_id,
            "membre": str(c.membre),
            "trimestre": c.trimestre,
            "montant_attendu": float(c.montant_attendu),
            "montant_paye": float(c.montant_paye),
            "solde": float(c.montant_attendu - c.montant_paye),
            "statut": c.statut,
        } for c in qs[:100]]

        return Response({"count": qs.count(), "retards": data})
