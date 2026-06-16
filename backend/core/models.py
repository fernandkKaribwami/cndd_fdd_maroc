from django.db import models


class Cycle(models.Model):
    """Ex: Licence, Master, Doctorat, Formation professionnelle"""
    nom = models.CharField(max_length=100, unique=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordre", "nom"]
        verbose_name = "Cycle d'études"
        verbose_name_plural = "Cycles d'études"

    def __str__(self):
        return self.nom


class Domaine(models.Model):
    """Ex: Ingénierie, Médecine, Économie & Gestion, Droit..."""
    nom = models.CharField(max_length=150, unique=True)

    class Meta:
        ordering = ["nom"]
        verbose_name = "Domaine"
        verbose_name_plural = "Domaines"

    def __str__(self):
        return self.nom


class Filiere(models.Model):
    """Ex: Génie Civil, Génie Informatique, Finance..."""
    nom = models.CharField(max_length=150)
    domaine = models.ForeignKey(Domaine, on_delete=models.PROTECT, related_name="filieres")

    class Meta:
        unique_together = ("nom", "domaine")
        ordering = ["domaine__nom", "nom"]
        verbose_name = "Filière"
        verbose_name_plural = "Filières"

    def __str__(self):
        return f"{self.nom} ({self.domaine})"


class Niveau(models.Model):
    """Ex: 1ère année, 2ème année, ... Niveau final"""
    nom = models.CharField(max_length=50, unique=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordre", "nom"]
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"

    def __str__(self):
        return self.nom
