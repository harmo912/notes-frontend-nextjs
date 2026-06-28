# EduPulse — Frontend Next.js 14

Interface utilisateur de la plateforme de gestion académique.

---

## Stack technique

| Technologie | Version |
|---|---|
| Next.js | 14.x |
| TypeScript | 5.x |
| Tailwind CSS | 3.x |
| Axios | 1.x |
| Recharts | 2.x |
| jsPDF | 2.x |
| jsPDF-AutoTable | 3.x |

---

## Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-user/notes-frontend-nextjs.git
cd notes-frontend-nextjs
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
```bash
cp .env.local.example .env.local
```

### 4. Configurer `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 5. Démarrer le serveur de développement
```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`

---

## Structure des dossiers

```
src/
├── app/
│   ├── page.tsx                    # Page d'accueil publique
│   ├── login/
│   │   └── page.tsx                # Page de connexion
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard administrateur
│   ├── enseignant/
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard enseignant
│   └── etudiant/
│       └── dashboard/
│           └── page.tsx            # Dashboard étudiant
├── components/
│   ├── AuthGuard.tsx               # Protection des routes
│   └── Footer.tsx                  # Pied de page
├── context/
│   └── AuthContext.tsx             # Contexte authentification global
└── lib/
    └── api.ts                      # Instance Axios + intercepteur Bearer
```

---

## Authentification

Le système utilise **Bearer Token** stocké dans le `localStorage`.

L'intercepteur Axios dans `src/lib/api.ts` injecte automatiquement le token dans chaque requête :
```
Authorization: Bearer {token}
```

Le composant `AuthGuard` protège toutes les pages privées et redirige vers `/login` si le token est absent.

---

## Espaces utilisateur

### Page d'accueil (`/`)
- Présentation de la plateforme
- Accès direct à la connexion
- Redirection automatique si déjà connecté

### Page de connexion (`/login`)
- Formulaire email + mot de passe
- Redirection automatique selon le rôle après connexion

### Espace Étudiant (`/etudiant/dashboard`)
- Statistiques personnelles (moyenne générale, nb notes, nb matières)
- Moyennes par matière avec barres de progression
- Graphique d'évolution des notes dans le temps (Recharts)
- Tableau détaillé de toutes les évaluations
- Téléchargement du bulletin PDF

### Espace Enseignant (`/enseignant/dashboard`)
- Statistiques (classes, matières, étudiants)
- Configuration de l'évaluation (classe, matière, type, coefficient, date)
- Graphique des moyennes de classe (Recharts BarChart)
- Grille de saisie de notes en masse
- Toast notifications (succès / erreur)

### Espace Admin (`/admin/dashboard`)
- Dashboard stats (étudiants, enseignants, notes, classes)
- Onglet Utilisateurs — CRUD complet avec rôles
- Onglet Classes — CRUD complet
- Onglet Matières — CRUD complet
- Onglet Affectations — Liaison enseignant → matière → classe
- Modals de création/édition
- Toast notifications

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@test.com | password |
| Enseignant 1 | koffi@test.com | password |
| Enseignant 2 | marie@test.com | password |
| Étudiant 1 | etudiant1@test.com | password |
| Étudiant 2 | etudiant2@test.com | password |

---

## Build production

```bash
npm run build
npm start
```

---

## Déploiement Vercel

```bash
npm install -g vercel
vercel --prod
```

Configurer la variable d'environnement `NEXT_PUBLIC_API_URL` dans le dashboard Vercel avec l'URL de production du backend.