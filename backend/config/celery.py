import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("cndd_fdd_maroc")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Tâches planifiées automatiques
app.conf.beat_schedule = {
    # Début de chaque trimestre : génère les cotisations
    "generer-cotisations-T1": {
        "task": "contributions.tasks.generer_cotisations_trimestre",
        "schedule": crontab(month_of_year="1", day_of_month="1", hour="6", minute="0"),
        "args": (None, 1),
    },
    "generer-cotisations-T2": {
        "task": "contributions.tasks.generer_cotisations_trimestre",
        "schedule": crontab(month_of_year="4", day_of_month="1", hour="6", minute="0"),
        "args": (None, 2),
    },
    "generer-cotisations-T3": {
        "task": "contributions.tasks.generer_cotisations_trimestre",
        "schedule": crontab(month_of_year="7", day_of_month="1", hour="6", minute="0"),
        "args": (None, 3),
    },
    "generer-cotisations-T4": {
        "task": "contributions.tasks.generer_cotisations_trimestre",
        "schedule": crontab(month_of_year="10", day_of_month="1", hour="6", minute="0"),
        "args": (None, 4),
    },
    # Quotidien : recalcul statuts
    "recalcul-statuts-quotidien": {
        "task": "contributions.tasks.recalcul_statuts_cotisation",
        "schedule": crontab(hour="2", minute="0"),
    },
    # Mensuel : relance cotisations en retard
    "relance-cotisations-mensuel": {
        "task": "contributions.tasks.relance_cotisations_retard",
        "schedule": crontab(day_of_month="5", hour="8", minute="0"),
    },
    # Septembre : rappel mise à jour académique
    "rappel-academique-septembre": {
        "task": "contributions.tasks.rappel_mise_a_jour_academique",
        "schedule": crontab(month_of_year="9", day_of_month="1", hour="9", minute="0"),
    },
    # Périodique : archivage des diplômés
    "archivage-diplomes-mensuel": {
        "task": "contributions.tasks.archivage_diplomes",
        "schedule": crontab(day_of_month="1", hour="3", minute="0"),
    },
}
