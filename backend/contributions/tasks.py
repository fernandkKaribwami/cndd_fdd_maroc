from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


@shared_task(name="contributions.tasks.generer_cotisations_trimestre")
def generer_cotisations_trimestre(annee=None, trimestre=None):
    """Génère automatiquement les cotisations pour tous les membres actifs."""
    from members.models import Membre
    from contributions.models import Cotisation, TarifCotisation

    if annee is None:
        annee = timezone.now().year
    if trimestre is None:
        mois = timezone.now().month
        trimestre = (mois - 1) // 3 + 1

    membres_actifs = Membre.objects.filter(statut_compte="ACTIF")
    crees = 0

    for membre in membres_actifs:
        tarif = TarifCotisation.objects.filter(
            categorie_affiliation=membre.categorie_affiliation, annee=annee
        ).first()
        montant = tarif.montant_trimestriel if tarif else 0

        _, created = Cotisation.objects.get_or_create(
            membre=membre, annee=annee, trimestre=trimestre,
            defaults={"montant_attendu": montant, "montant_paye": 0}
        )
        if created:
            crees += 1

    return f"{crees} cotisations créées pour {annee} T{trimestre}"


@shared_task(name="contributions.tasks.recalcul_statuts_cotisation")
def recalcul_statuts_cotisation():
    """Recalcule les statuts de toutes les cotisations."""
    from contributions.models import Cotisation

    cotisations = Cotisation.objects.exclude(statut="EXONERE")
    mises_a_jour = 0

    for c in cotisations:
        ancien_statut = c.statut
        c.recalculer_statut()
        if c.statut != ancien_statut:
            c.save(update_fields=["statut"])
            mises_a_jour += 1

    return f"{mises_a_jour} statuts mis à jour"


@shared_task(name="contributions.tasks.relance_cotisations_retard")
def relance_cotisations_retard():
    """Génère et envoie la liste des membres en retard au trésorier."""
    from contributions.models import Cotisation
    from django.contrib.auth.models import User

    en_retard = Cotisation.objects.filter(
        statut__in=["EN_RETARD", "PARTIEL"]
    ).select_related("membre").order_by("membre__nom")

    noms = "\n".join([
        f"- {c.membre} ({c.annee} T{c.trimestre}) : payé {c.montant_paye}/{c.montant_attendu} MAD"
        for c in en_retard[:100]
    ])

    tresoriers = User.objects.filter(groups__name="Trésorier(ère)")
    for t in tresoriers:
        if t.email:
            send_mail(
                subject=f"[CNDD-FDD Maroc] Cotisations en retard — {en_retard.count()} membres",
                message=f"Bonjour,\n\nVoici les membres avec des cotisations en retard :\n\n{noms}\n\nTotal : {en_retard.count()} cotisations en retard.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[t.email],
                fail_silently=True,
            )

    return f"Relance envoyée pour {en_retard.count()} cotisations en retard"


@shared_task(name="contributions.tasks.rappel_mise_a_jour_academique")
def rappel_mise_a_jour_academique():
    """Envoie un rappel pour mettre à jour les profils étudiants."""
    from django.contrib.auth.models import User

    charges = User.objects.filter(groups__name="Chargé(e) académique")
    for charge in charges:
        if charge.email:
            send_mail(
                subject="[CNDD-FDD Maroc] Rappel : mise à jour des profils étudiants",
                message=(
                    "Bonjour,\n\n"
                    "La nouvelle année académique a commencé. "
                    "Merci de mettre à jour le niveau et l'année académique de chaque étudiant "
                    "dans le système de gestion.\n\n"
                    "Connectez-vous sur la plateforme pour effectuer les mises à jour."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[charge.email],
                fail_silently=True,
            )

    return "Rappel envoyé aux chargés académiques"


@shared_task(name="contributions.tasks.archivage_diplomes")
def archivage_diplomes():
    """Archive les profils marqués diplômés depuis plus de 6 mois."""
    from members.models import ProfilEtudiant, Membre
    from datetime import date, timedelta

    seuil = date.today() - timedelta(days=180)
    profils = ProfilEtudiant.objects.filter(
        statut_parcours="DIPLOME",
        date_diplome__lte=seuil,
        membre__statut_compte="ACTIF"
    )
    archives = 0
    for profil in profils:
        # Basculer vers catégorie diaspora et statut inactif si souhaité
        # Ici on marque juste le membre comme 'INACTIF' pour archivage
        Membre.objects.filter(pk=profil.membre_id).update(statut_compte="INACTIF")
        archives += 1

    return f"{archives} profils diplômés archivés"
