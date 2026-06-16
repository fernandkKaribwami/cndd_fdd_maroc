from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='membre',
            name='cellule',
            field=models.CharField(
                blank=True,
                choices=[
                    ('TANGER_TETOUAN_OUJDA', 'Cellule Tanger-Tétouan-Oujda'),
                    ('KENITRA', 'Cellule Kénitra'),
                    ('AGADIR', 'Cellule Agadir'),
                    ('RABAT_SALE', 'Cellule Rabat-Salé'),
                    ('LAAYOUNE_DAKHLA', 'Cellule Laâyoune-Dakhla'),
                    ('FEZ_MEKNES', 'Cellule Fès-Meknès'),
                    ('CASABLANCA', 'Cellule Casablanca'),
                    ('AUTRE', 'Autre cellule'),
                ],
                max_length=25,
                verbose_name='Cellule',
            ),
        ),
    ]
