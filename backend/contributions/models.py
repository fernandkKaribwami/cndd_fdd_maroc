from django.db import models
from members.models import Membre


class TarifCotisation(models.Model):
    """Montant attendu par trimestre, éventuellement selon catégorie"""
    categorie_affiliation = models.CharField(
        max_length=20,
        choices=[
            ("ABAGUMYABANGA", "Membre Abagumyabanga (CNDD-FDD)"),
            ("SYMPATHISANT", "Sympathisant CNDD-FDD"),
            ("DIASPORA", "Diaspora générale / non affilié"),
        ],
        verbose_name="Catégorie d'affiliation"
    )
    annee = models.PositiveIntegerField(verbose_name="Année")
    montant_trimestriel = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name="Montant trimestriel (MAD)"
    )

    class Meta:
        unique_together = ("categorie_affiliation", "annee")
        verbose_name = "Tarif de cotisation"
        verbose_name_plural = "Tarifs de cotisation"
        ordering = ["-annee", "categorie_affiliation"]

    def __str__(self):
        return f"{self.get_categorie_affiliation_display()} — {self.annee} : {self.montant_trimestriel} MAD"


class Cotisation(models.Model):
    TRIMESTRE_CHOICES = [(1, "T1 (Jan-Mars)"), (2, "T2 (Avr-Juin)"), (3, "T3 (Juil-Sep)"), (4, "T4 (Oct-Déc)")]
    MODE_PAIEMENT = [
        ("ESPECES", "Espèces"),
        ("VIREMENT", "Virement"),
        ("MOBILE_MONEY", "Mobile Money"),
        ("AUTRE", "Autre"),
    ]
    STATUT_CHOICES = [
        ("A_JOUR", "À jour"),
        ("EN_RETARD", "En retard"),
        ("PARTIEL", "Partiel"),
        ("EXONERE", "Exonéré"),
    ]

    membre = models.ForeignKey(
        Membre, on_delete=models.CASCADE, related_name="cotisations", verbose_name="Membre"
    )
    annee = models.PositiveIntegerField(verbose_name="Année")
    trimestre = models.PositiveSmallIntegerField(choices=TRIMESTRE_CHOICES, verbose_name="Trimestre")
    montant_attendu = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Montant attendu (MAD)"
    )
    montant_paye = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="Montant payé (MAD)"
    )
    date_paiement = models.DateField(null=True, blank=True, verbose_name="Date de paiement")
    mode_paiement = models.CharField(
        max_length=20, choices=MODE_PAIEMENT, blank=True, verbose_name="Mode de paiement"
    )
    statut = models.CharField(
        max_length=10, choices=STATUT_CHOICES, default="EN_RETARD", verbose_name="Statut"
    )
    commentaire = models.TextField(blank=True, verbose_name="Commentaire")

    class Meta:
        unique_together = ("membre", "annee", "trimestre")
        ordering = ["-annee", "-trimestre", "membre__nom"]
        verbose_name = "Cotisation"
        verbose_name_plural = "Cotisations"

    def __str__(self):
        return f"{self.membre} — {self.annee} T{self.trimestre} [{self.get_statut_display()}]"

    def recalculer_statut(self):
        if self.statut == "EXONERE":
            return
        if self.montant_paye <= 0:
            self.statut = "EN_RETARD"
        elif self.montant_paye < self.montant_attendu:
            self.statut = "PARTIEL"
        else:
            self.statut = "A_JOUR"

    def save(self, *args, **kwargs):
        self.recalculer_statut()
        super().save(*args, **kwargs)
