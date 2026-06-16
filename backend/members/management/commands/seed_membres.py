"""
Management command: python manage.py seed_membres
Initialise la base de données avec les membres du PDF ABAGUMYABANGA Maroc.
Usage: railway run python manage.py seed_membres
"""
from django.core.management.base import BaseCommand
from members.models import Membre

# (nom, prenom, sexe, cellule, statut_socio_pro, ville_residence)
MEMBRES_PDF = [
    # ── Cellule Tanger-Tétouan-Oujda ── Professionnels
    ("SIMBANANIYE", "Cédric", "M", "TANGER_TETOUAN_OUJDA", "TRAVAILLEUR", "Tanger"),
    ("IRAMBONA", "Séverin", "M", "TANGER_TETOUAN_OUJDA", "TRAVAILLEUR", "Tanger"),
    ("ARAMBONA", "Michel-Ange", "M", "TANGER_TETOUAN_OUJDA", "TRAVAILLEUR", "Tétouan"),

    # ── Cellule Agadir ── Professionnels
    ("SABUSHIMIKE", "Lionel", "M", "AGADIR", "TRAVAILLEUR", "Agadir"),
    ("MUREKAMBANZE", "Fiston", "M", "AGADIR", "TRAVAILLEUR", "Agadir"),
    ("IRANZI", "Joëlla Monia", "F", "AGADIR", "TRAVAILLEUR", "Agadir"),

    # ── Cellule Rabat-Salé ── Professionnels
    ("NDAYIKENGURUKIYE", "Aristide", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("NKURUNZIZA", "Sandra", "F", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("BANKUMUKUNZI", "Nestor", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("IRANTIJE", "Jérémie", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("NDIZEYE", "Aloysie", "F", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("MANIRAKIZA", "Eric", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("MANIRAKIZA", "Stanislas", "M", "RABAT_SALE", "TRAVAILLEUR", "Salé"),
    ("UWIMANA", "Ulysse", "M", "RABAT_SALE", "TRAVAILLEUR", "Salé"),
    ("SINGIRANKABO", "Florence", "F", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("NYAWENDA", "Evode", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("MUPFISONI", "Alexandre", "M", "RABAT_SALE", "TRAVAILLEUR", "Salé"),
    ("NIYOMUKUNZI", "Jésus Marie Fileo", "M", "RABAT_SALE", "TRAVAILLEUR", "Salé"),
    ("HAKIZIMANA", "Yannick", "M", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("ISHIMWE", "Elodie Diane", "F", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("NGABIRANO", "Marie Divine", "F", "RABAT_SALE", "TRAVAILLEUR", "Rabat"),
    ("GIRITEKA", "Thierry", "M", "RABAT_SALE", "TRAVAILLEUR", "Salé"),

    # ── Cellule Fès-Meknès ── Professionnels
    ("NIYONGABE", "Cédric", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("NSHUMBUSHO", "Mélance", "F", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("NIYONGERE", "Oswald", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("BARENZAKO", "Liboire", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("NIYOMWUNGERE", "Elias", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("HAVYARIMANA", "Léonidas", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("IRAMBONA", "Emmanuel", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("MANIRAKOZE", "Eric", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("NDAYIKENGURUTSE", "Simon", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("NIZIGIYIMANA", "Jean Marie", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("MUKAMARAKIZA", "Collade", "F", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("MUGISHA", "Acher", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("MANIRADUKUNDA", "Serges", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("MUHOZA", "Arnaud", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("NGENDAKUMANA", "Vital", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("SINKIBASHIKAKO", "Jérôme", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("NSENGIYUMVA", "Anicet", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("KAZOBAVAMWO", "Merlin", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),
    ("MURISHI", "Guy", "M", "FEZ_MEKNES", "TRAVAILLEUR", "Meknès"),
    ("NIYOKINDI", "Francine", "F", "FEZ_MEKNES", "TRAVAILLEUR", "Fès"),

    # ── Étudiants – Cycle Doctoral
    ("NDAYITEZIBIGANZA", "Thierry", "M", "", "ETUDIANT", ""),
    ("MUNEZERO", "Jean Pacifique", "M", "", "ETUDIANT", ""),
    ("HAKORINOTI", "Noé", "M", "", "ETUDIANT", ""),
    ("SINARINZI", "Florian", "M", "", "ETUDIANT", ""),
    ("HABONIMANA", "Avith", "M", "", "ETUDIANT", ""),
    ("NGENDAKUMANA", "Egide", "M", "", "ETUDIANT", ""),
    ("MBAZUMUTIMA", "Louis", "M", "", "ETUDIANT", ""),
    ("IYANKUNZE", "Jean Claude", "M", "", "ETUDIANT", ""),
    ("MBONINYIBUKA", "Désiré", "M", "", "ETUDIANT", ""),
    ("NIYIKIZA", "Eric", "M", "", "ETUDIANT", ""),
    ("SIBOMANA", "Adrien", "M", "", "ETUDIANT", ""),

    # ── Étudiants – Master
    ("MINYURANO", "Aloys", "M", "", "ETUDIANT", ""),
    ("IGIRUBUNTU", "Billy", "M", "", "ETUDIANT", ""),
    ("KUBWIMANA", "Blaise", "M", "", "ETUDIANT", ""),
    ("IRADUKUNDA", "Wellars", "M", "", "ETUDIANT", ""),
    ("IRAKOZE", "Alain Eddy", "M", "", "ETUDIANT", ""),
    ("IRADUKUNDA", "Orly", "M", "", "ETUDIANT", ""),
    ("NSANGANIYE", "L. Quinthia", "F", "", "ETUDIANT", ""),
    ("IRUMVA", "Excellent Florient", "M", "", "ETUDIANT", ""),
    ("NDORIMANA", "Jean Baptiste", "M", "", "ETUDIANT", ""),
    ("SABUSHIMIKE", "Olivier", "M", "", "ETUDIANT", ""),
    ("MUKUNZI", "Jean Joslain", "M", "", "ETUDIANT", ""),
    ("NIYONKURU", "Gad", "M", "", "ETUDIANT", ""),
    ("ITANGISHAKA", "Augustin", "M", "", "ETUDIANT", ""),
    ("IRANKUNDA", "Didace", "M", "", "ETUDIANT", ""),
    ("NIYONKURU", "Lady", "F", "", "ETUDIANT", ""),
    ("NIMPAYE", "Ornella", "F", "", "ETUDIANT", ""),
    ("NAHIMANA", "Onésime", "M", "", "ETUDIANT", ""),
    ("ITEKA", "Ella Vera", "F", "", "ETUDIANT", ""),
    ("MBAZUMUTIMA", "Innocent", "M", "", "ETUDIANT", ""),
    ("NKURUNZIZA", "Faustin", "M", "", "ETUDIANT", ""),
    ("NIYOBUHUNGIRO", "Belyse", "F", "", "ETUDIANT", ""),
    ("ICOYANGEREYE", "Olivella", "F", "", "ETUDIANT", ""),
    ("RUGERINYANGE", "Khaled", "M", "", "ETUDIANT", ""),
    ("HAKIZIMANA", "Vercus", "M", "", "ETUDIANT", ""),
    ("TUYISHIME", "Samuel", "M", "", "ETUDIANT", ""),
    ("NDAYISENGA", "Simplice", "M", "", "ETUDIANT", ""),
    ("BUBERINTWARI", "Emery Patience", "F", "", "ETUDIANT", ""),
    ("UWIHOREYE", "Mado Angélique", "F", "", "ETUDIANT", ""),
    ("NTAKIRUTIMANA", "Berchmas", "M", "", "ETUDIANT", ""),
    ("ISHIMWE", "Guy Derrick Médard", "M", "", "ETUDIANT", ""),

    # ── Étudiants – Cycle d'Ingénieurie
    ("ITERITEKA", "Axel", "M", "", "ETUDIANT", ""),
    ("DUSHIMIRIMANA", "Christ", "M", "", "ETUDIANT", ""),
    ("NIYIDUKIZA", "Gordien", "M", "", "ETUDIANT", ""),
    ("IRAKOZE", "Lewis", "M", "", "ETUDIANT", ""),
    ("INEZERWE", "Elogie", "M", "", "ETUDIANT", ""),
    ("KWIZERIMANA", "Dieudonné", "M", "", "ETUDIANT", ""),
    ("NIBARUTA", "Venant", "M", "", "ETUDIANT", ""),
    ("NIMPAGARITSE", "Wilson", "M", "", "ETUDIANT", ""),
    ("NIYOYANKUNZE", "Obadie", "M", "", "ETUDIANT", ""),
    ("NAMUGISHA", "Sandrine", "F", "", "ETUDIANT", ""),
    ("BUKURU", "Samuel", "M", "", "ETUDIANT", ""),
    ("SIBOMANA", "Gerardine", "F", "", "ETUDIANT", ""),
    ("ININAHAZWE", "Pacifique", "M", "", "ETUDIANT", ""),
    ("IRUMVA", "Ethiel", "M", "", "ETUDIANT", ""),
    ("NIMBONA", "Fabrice", "M", "", "ETUDIANT", ""),
    ("NDUWAYO", "Eric", "M", "", "ETUDIANT", ""),
    ("MUNEZERO", "Cedric Teddy", "M", "", "ETUDIANT", ""),
    ("HAGABIMANA", "J. Claude", "M", "", "ETUDIANT", ""),
    ("NIYOMWUNGERE", "Alice", "F", "", "ETUDIANT", ""),
    ("HAVYARIMANA", "Blaise Pascal", "M", "", "ETUDIANT", ""),
    ("CONGERA", "Alexis", "M", "", "ETUDIANT", ""),
    ("NKURUNZIZA", "Marie Divine", "F", "", "ETUDIANT", ""),
    ("ITERITEKA", "Florence", "F", "", "ETUDIANT", ""),
    ("ISHEMEZWE", "Raoul Miki", "M", "", "ETUDIANT", ""),
    ("NIYOBUHUNGIRO", "Licide", "M", "", "ETUDIANT", ""),
    ("ITERITEKA", "Daniel", "M", "", "ETUDIANT", ""),
    ("BIZIMANA", "Christ Loris", "M", "", "ETUDIANT", ""),
    ("NISHIMEZWE", "Jean Pierre", "M", "", "ETUDIANT", ""),
    ("MANIRAKIZA", "Destin", "M", "", "ETUDIANT", ""),
    ("ISHIMWE", "Christa Bella", "F", "", "ETUDIANT", ""),
    ("MUGISHA", "Angélique", "F", "", "ETUDIANT", ""),

    # ── Étudiants – Médecine 4ème année et +
    ("NSENGIYUMVA", "Justin", "M", "", "ETUDIANT", ""),
    ("IRUMVA", "Fleur Princia", "F", "", "ETUDIANT", ""),
    ("DUSHIME", "Kessie Carelle", "F", "", "ETUDIANT", ""),
    ("MUSAVYIMANA", "Clairia", "F", "", "ETUDIANT", ""),
    ("MUGISHA", "Leila", "F", "", "ETUDIANT", ""),
    ("NIYIMBABAZI", "Ornella", "F", "", "ETUDIANT", ""),
    ("NIYUBAHWE", "Bel-Ami", "M", "", "ETUDIANT", ""),
    ("MUHOZA", "Armand Bruce", "M", "", "ETUDIANT", ""),
    ("NIZIGIYIMANA", "Aimé Rodrigue", "M", "", "ETUDIANT", ""),
    ("NDAYIRAGIJE", "Ezra", "M", "", "ETUDIANT", ""),

    # ── Étudiants – Licence
    ("ISHIMWE", "Belyse", "F", "", "ETUDIANT", ""),
    ("BAYIZERE", "Don Délicia", "M", "", "ETUDIANT", ""),
    ("TUYISENGE", "Siméon", "M", "", "ETUDIANT", ""),
    ("NIZEYIMANA", "Xavier", "M", "", "ETUDIANT", ""),
    ("HAVUGIYAREMYE", "Eddy Freddy", "M", "", "ETUDIANT", ""),
    ("HATUNGIMANA", "Philbert", "M", "", "ETUDIANT", ""),
    ("BAYUBAHE", "Eunice Joyce", "F", "", "ETUDIANT", ""),
    ("NIYONSABA", "Delis", "F", "", "ETUDIANT", ""),
    ("MAHORO", "Dia Christa", "F", "", "ETUDIANT", ""),
    ("NIYONKEZA", "Gueritha", "F", "", "ETUDIANT", ""),
    ("IRANKUNDA", "Mélance", "F", "", "ETUDIANT", ""),
    ("BINAMUNGU", "Francisco", "M", "", "ETUDIANT", ""),
    ("BIZINDAVYI", "Aimé Bertrand", "M", "", "ETUDIANT", ""),
    ("MUSHAHA", "Justin Franklin", "M", "", "ETUDIANT", ""),
    ("ISHIMWE", "Chris Béni", "M", "", "ETUDIANT", ""),
    ("SIMBI", "Elvis", "M", "", "ETUDIANT", ""),
    ("DUSHIMIRIMANA", "Franck", "M", "", "ETUDIANT", ""),
    ("MANIRAKIZA", "Fleury", "M", "", "ETUDIANT", ""),

    # ── Étudiants – Licence (suite)
    ("KARIBWAMI", "Fernand", "M", "FEZ_MEKNES", "ETUDIANT", "Fès"),
    ("IRADUKUNDA", "Néhémie", "M", "", "ETUDIANT", ""),
    ("CIGENA", "Stève", "M", "", "ETUDIANT", ""),
    ("BIVUZEYEZU", "Medard", "M", "", "ETUDIANT", ""),
    ("NZOKIRA", "Abdoul Aziz", "M", "", "ETUDIANT", ""),
    ("IRANGABIYE", "Deltine Diesse", "F", "", "ETUDIANT", ""),
    ("NDIKIJE", "Verlaine", "F", "", "ETUDIANT", ""),
    ("MPUHWE", "Ora Livia", "F", "", "ETUDIANT", ""),
    ("IRAKOZE", "Arcène", "M", "", "ETUDIANT", ""),
    ("NTAKARUTIMANA", "Emmanuel", "M", "", "ETUDIANT", ""),
    ("IRANKUNDA", "Marie Praxede", "F", "", "ETUDIANT", ""),
    ("IZERE", "King Kerry", "F", "", "ETUDIANT", ""),
    ("NIYONGABO", "Brillant Emmanuel", "M", "", "ETUDIANT", ""),
    ("MATSIKO IGABE", "Dressie Kerren", "F", "", "ETUDIANT", ""),
]


class Command(BaseCommand):
    help = "Initialise la base de données avec les membres ABAGUMYABANGA du PDF"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Supprimer tous les membres existants avant d'insérer",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            count = Membre.objects.count()
            Membre.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"  {count} membres supprimés"))

        created = 0
        skipped = 0

        for nom, prenom, sexe, cellule, statut, ville in MEMBRES_PDF:
            _, was_created = Membre.objects.get_or_create(
                nom=nom,
                prenom=prenom,
                defaults={
                    "sexe": sexe,
                    "cellule": cellule,
                    "statut_socio_pro": statut,
                    "statut_compte": "ACTIF",
                    "ville_residence": ville,
                    "categorie_affiliation": "ABAGUMYABANGA",
                    "observations": "Données PDF ABAGUMYABANGA Section Maroc",
                },
            )
            if was_created:
                created += 1
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {created} membres créés, {skipped} déjà existants"
            )
        )
