# app4dums — Projet Cowork

## Stack technique
- **Frontend** : React 18 + Vite + TypeScript
- **UI** : Shadcn/UI + Tailwind CSS + Radix UI
- **Backend** : Supabase (Auth + DB + Storage)
- **Déploiement** : Coolify via Docker + Nginx

## Structure
```
src/
├── components/      — Composants UI
├── pages/           — Pages de l'app
├── hooks/           — Custom hooks
├── lib/             — Utilitaires (supabase client, etc.)
└── integrations/    — Intégrations Supabase générées
```

## Commandes
```bash
npm run dev      # Dev local (port 5173)
npm run build    # Build production → dist/
npm run preview  # Prévisualiser le build
```

## Variables d'environnement
Copier `.env.example` → `.env` et renseigner les valeurs.

| Variable | Description |
|---|---|
| VITE_SUPABASE_URL | URL de ton projet Supabase |
| VITE_SUPABASE_PUBLISHABLE_KEY | Clé anon publique Supabase |
| VITE_SUPABASE_PROJECT_ID | ID du projet Supabase |

## Déploiement Coolify
Voir `COOLIFY_DEPLOY.md` pour le guide complet.

## GitHub
Repo : https://github.com/pixeeplay/style-wizard-ai-59
