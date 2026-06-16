from django.db import models
from core.models import Cycle, Domaine, Filiere, Niveau


class Membre(models.Model):
    CATEGORIE_CHOICES = [
        ("ABAGUMYABANGA", "Membre Abagumyabanga (CNDD-FDD)"),
        ("SYMPATHISANT", "Sympathisant CNDD-FDD"),
        ("DIASPORA", "Diaspora générale / non affilié"),
    ]
    STATUT_SOCIO_PRO = [
        ("ETUDIANT", "Étudiant"),
        ("TRAVAILLEUR", "Travailleur / Professionnel"),
        ("SANS_ACTIVITE", "Sans activité déclarée"),
        ("AUTRE", "Autre"),
    ]
    STATUT_COMPTE = [
        ("ACTIF", "Actif"),
        ("INACTIF", "Inactif"),
        ("SUSPENDU", "Suspendu"),
    ]

    nom = models.CharField(max_length=100, verbose_name="Nom")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    sexe = models.CharField(
        max_length=1,
        choices=[("M", "Masculin"), ("F", "Féminin")],
        verbose_name="Sexe"
    )
    date_naissance = models.DateField(null=True, blank=True, verbose_name="Date de naissance")
    telephone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    ville_residence = models.CharField(max_length=100, blank=True, verbose_name="Ville de résidence")
    date_arrivee_maroc = models.DateField(null=True, blank=True, verbose_name="Date d'arrivée au Maroc")

    categorie_affiliation = models.CharField(
        max_length=20,
        choices=CATEGORIE_CHOICES,
        default="DIASPORA",
        verbose_name="Catégorie d'affiliation"
    )
    statut_socio_pro = models.CharField(
        max_length=20,
        choices=STATUT_SOCIO_PRO,
        default="AUTRE",
        verbose_name="Statut socio-professionnel"
    )
    statut_compte = models.CharField(
        max_length=10,
        choices=STATUT_COMPTE,
        default="ACTIF",
        verbose_name="Statut du compte"
    )

    date_adhesion = models.DateField(auto_now_add=True, verbose_name="Date d'adhésion")
    observations = models.TextField(blank=True, verbose_name="Observations")

    class Meta:
        ordering = ["nom", "prenom"]
        verbose_name = "Membre"
        verbose_name_plural = "Membres"

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    @property
    def est_etudiant(self):
        return self.statut_socio_pro == "ETUDIANT"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"


class ProfilEtudiant(models.Model):
    STATUT_PARCOURS = [
        ("EN_COURS", "En cours"),
        ("DIPLOME", "Diplômé"),
        ("ABANDON", "Abandon"),
        ("REORIENTATION", "Réorientation"),
    ]

    membre = models.OneToOneField(
        Membre, on_delete=models.CASCADE, related_name="profil_etudiant"
    )
    cycle = models.ForeignKey(Cycle, on_delete=models.PROTECT, verbose_name="Cycle")
    domaine = models.ForeignKey(Domaine, on_delete=models.PROTECT, verbose_name="Domaine")
    filiere = models.ForeignKey(Filiere, on_delete=models.PROTECT, verbose_name="Filière")
    niveau = models.ForeignKey(Niveau, on_delete=models.PROTECT, verbose_name="Niveau")
    etablissement = models.CharField(max_length=200, verbose_name="Établissement")
    ville_etudes = models.CharField(max_length=100, verbose_name="Ville d'études")
    annee_academique = models.CharField(
        max_length=9,
        help_text="Format: 2025-2026",
        verbose_name="Année académique"
    )
    statut_parcours = models.CharField(
        max_length=15,
        choices=STATUT_PARCOURS,
        default="EN_COURS",
        verbose_name="Statut du parcours"
    )
    date_diplome = models.DateField(null=True, blank=True, verbose_name="Date de diplôme")

    class Meta:
        verbose_name = "Profil étudiant"
        verbose_name_plural = "Profils étudiants"

    def __str__(self):
        return f"{self.membre} — {self.cycle} {self.filiere} ({self.niveau})"
