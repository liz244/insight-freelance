# Insight Freelance

Plateforme de mise en relation freelances / clients, développée dans le cadre du Bachelor Data & Business Intelligence — Chef de Projet Web (RNCP40857) à Nexa Digital School.

## URLs publiques

- **Frontend (site)** : https://insight-freelance.vercel.app
- **Backend (API)** : https://insight-freelance-backend.onrender.com
- **Documentation API** : https://insight-freelance-backend.onrender.com/docs

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS
- **Backend** : Python 3 + FastAPI + SQLAlchemy + Pydantic
- **Base de données** : PostgreSQL (Neon) en production, SQLite en développement
- **Hébergement** : Vercel (frontend) + Render (backend) + Neon (BDD)

## Prérequis d'installation (en local)

- Node.js >= 18
- Python >= 3.10
- pip
- Git

## Étapes d'installation en local

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python migrate_verified.py
python migrate_request.py
python migrate_suspended.py
uvicorn app.main:app --reload
```

Le backend tourne sur http://127.0.0.1:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur http://localhost:5173

## Identifiants de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@liz.com | Test1234 |
| Freelance | jean@gmail.com | Test1234 |
| Freelance | elodiequeen21@gmail.com | Test1234 |
| Client | lilybouka45@gmail.com | Test1234 |
| Client | client-test@test.com | Test1234 |

## Accès administrateur

L'accès admin n'est pas disponible via l'inscription publique.
Pour attribuer le rôle admin à un compte existant, exécuter dans le SQL Editor de Neon :

```sql
UPDATE users SET role = 'admin' WHERE email = 'votre@email.com';
```

Puis se connecter avec ce compte — le dashboard admin est accessible via /admin.

## Connexion à la base de données (production)

- **Hébergeur** : Neon (PostgreSQL serverless)
- **Région** : AWS Europe West 2 (London)
- **Base** : neondb
- La chaîne de connexion complète est configurée en variable d'environnement DATABASE_URL sur Render (non exposée publiquement pour des raisons de sécurité)

## Lancer les tests automatisés

```bash
cd backend
venv\Scripts\activate
python -m pytest tests/ -v
```

Résultat attendu : 7 passed

## Compatibilité navigateurs

Testé et validé sur :
- Chrome (desktop + mobile)
- Firefox (desktop)
- Safari (mobile iOS)
- Edge (desktop)

## Variables d'environnement

### Backend (Render)
- `DATABASE_URL` : chaîne de connexion PostgreSQL Neon
- `SECRET_KEY` : clé secrète de signature des tokens JWT

### Frontend (Vercel)
- `VITE_API_URL` : URL du backend déployé (https://insight-freelance-backend.onrender.com)

## Structure du projet

```
insight-freelance/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   └── routers/
│   ├── tests/
│   │   └── test_app.py
│   ├── migrate_verified.py
│   ├── migrate_request.py
│   ├── migrate_suspended.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── api.ts
    │   └── main.tsx
    ├── index.html
    └── package.json
```