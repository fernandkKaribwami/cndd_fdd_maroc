# Guide de démarrage — CNDD-FDD Maroc

## Prérequis à installer

### Option A — Installation manuelle (recommandée pour développement)

1. **Python 3.12** : https://www.python.org/downloads/
   - Cochez "Add Python to PATH" lors de l'installation

2. **Node.js 20 LTS** : https://nodejs.org/en/download
   - Choisir l'installeur Windows (.msi)

3. **PostgreSQL 16** : https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Notez le mot de passe du superuser postgres

4. **Git** : https://git-scm.com/download/win

### Option B — Via winget (PowerShell Admin)
```powershell
.\INSTALLER_WINDOWS.ps1
```

### Option C — Docker (tout-en-un)
Installez Docker Desktop : https://www.docker.com/products/docker-desktop/
Puis sautez directement à la section "Déploiement avec Docker".

---

## Démarrage local (développement)

### Étape 1 — Créer la base de données PostgreSQL

Ouvrez pgAdmin ou psql et exécutez :
```sql
CREATE USER cndd_fdd WITH PASSWORD 'cndd_password';
CREATE DATABASE cndd_fdd_maroc OWNER cndd_fdd;
GRANT ALL PRIVILEGES ON DATABASE cndd_fdd_maroc TO cndd_fdd;
```

### Étape 2 — Configurer l'environnement

```powershell
cd c:\Users\HP\Desktop\Fernand\cndd_fdd_maroc
Copy-Item .env.example .env
notepad .env   # Editez DB_PASSWORD et SECRET_KEY
```

### Étape 3 — Setup Backend Django

```powershell
.\SETUP_BACKEND.ps1
```

Ou manuellement :
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Étape 4 — Setup Frontend Next.js

Dans un nouveau terminal :
```powershell
.\SETUP_FRONTEND.ps1
```

Ou manuellement :
```powershell
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

### Accès

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |

---

## Configuration Django Admin

### Créer les groupes et permissions

Dans Django Admin (http://localhost:8000/admin) → Groupes → Ajouter :

| Groupe | Permissions |
|---|---|
| Administrateur | Tous les droits |
| Secrétaire général(e) | CRUD Membre, ProfilEtudiant |
| Trésorier(ère) | CRUD Cotisation, TarifCotisation + lecture Membre |
| Chargé(e) académique | CRUD ProfilEtudiant + lecture Membre |
| Communication | Lecture seule |

### Charger les données de référence initiales

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py shell
```

Dans le shell Python :
```python
from core.models import Cycle, Domaine, Filiere, Niveau

# Cycles
for nom, ordre in [('Licence', 1), ('Master', 2), ('Doctorat', 3), ('Ingénieur', 2), ('BTS', 0)]:
    Cycle.objects.get_or_create(nom=nom, defaults={'ordre': ordre})

# Domaines
for nom in ['Ingénierie', 'Médecine & Santé', 'Économie & Gestion', 'Droit', 'Informatique', 'Sciences Humaines']:
    Domaine.objects.get_or_create(nom=nom)

# Niveaux
for nom, ordre in [('1ère année', 1), ('2ème année', 2), ('3ème année', 3), ('4ème année', 4), ('5ème année', 5)]:
    Niveau.objects.get_or_create(nom=nom, defaults={'ordre': ordre})

print("Données chargées !")
exit()
```

### Configurer les tarifs de cotisation

Dans Django Admin → Tarifs de cotisation → Ajouter :
```
Catégorie: ABAGUMYABANGA | Année: 2025 | Montant trimestriel: 100
Catégorie: SYMPATHISANT  | Année: 2025 | Montant trimestriel: 50
Catégorie: DIASPORA      | Année: 2025 | Montant trimestriel: 30
```

---

## Déploiement avec Docker

### Pré-requis : Docker Desktop installé

```powershell
cd c:\Users\HP\Desktop\Fernand\cndd_fdd_maroc
Copy-Item .env.example .env
# Editez .env avec vos mots de passe sécurisés
notepad .env
```

### Lancer tout en une commande

```powershell
docker compose up --build -d
```

### Initialiser la base de données (première fois)

```powershell
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### Vérifier que tout tourne

```powershell
docker compose ps
docker compose logs backend
```

### Arrêter

```powershell
docker compose down
```

---

## Déploiement en production

### Backend sur Render.com (gratuit pour démarrer)

1. Créez un compte sur https://render.com
2. Connectez votre repo GitHub
3. Créez un "Web Service" avec :
   - Root directory : `backend`
   - Build command : `pip install -r requirements.txt`
   - Start command : `gunicorn config.wsgi:application`
4. Ajoutez les variables d'environnement depuis `.env`
5. Créez un "PostgreSQL" database et copiez l'URL dans `DATABASE_URL`
6. Créez un "Redis" instance et copiez l'URL dans `REDIS_URL`

### Frontend sur Vercel (gratuit)

1. Créez un compte sur https://vercel.com
2. Importez votre repo GitHub
3. Root directory : `frontend`
4. Ajoutez la variable : `NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com/api`
5. Deploy !

### Sur VPS (OVH/Hetzner ~5€/mois)

```bash
# Sur le VPS
git clone https://github.com/votre-org/cndd_fdd_maroc.git
cd cndd_fdd_maroc
cp .env.example .env
nano .env  # configurez vos variables
docker compose up --build -d
```

---

## Lancer Celery (tâches automatiques) en développement

Terminal 1 — Redis (si pas via Docker) :
```powershell
# Téléchargez Redis pour Windows depuis https://github.com/microsoftarchive/redis/releases
redis-server
```

Terminal 2 — Celery Worker :
```powershell
cd backend
.\venv\Scripts\Activate.ps1
celery -A config worker -l info
```

Terminal 3 — Celery Beat (planificateur) :
```powershell
cd backend
.\venv\Scripts\Activate.ps1
celery -A config beat -l info
```

---

## Résumé des URLs API

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/auth/token/` | POST | Login → JWT |
| `/api/membres/` | GET/POST | Liste et création membres |
| `/api/membres/{id}/` | GET/PUT/DELETE | Fiche membre |
| `/api/membres/export-excel/` | GET | Export Excel filtré |
| `/api/membres/etudiants/` | GET | Liste étudiants |
| `/api/cotisations/` | GET/POST | Cotisations |
| `/api/cotisations/generer-trimestre/` | POST | Génération auto |
| `/api/cotisations/export-excel/` | GET | Export Excel |
| `/api/dashboard/stats/` | GET | Stats tableau de bord |
| `/api/referentiels/cycles/` | GET | Cycles |
| `/api/referentiels/domaines/` | GET | Domaines |
| `/api/referentiels/filieres/` | GET | Filières |
| `/api/referentiels/niveaux/` | GET | Niveaux |
