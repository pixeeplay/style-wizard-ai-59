# 🚀 Déploiement Coolify — app4dums

## Prérequis
- Coolify v4+ installé sur ton serveur
- Repo GitHub : https://github.com/pixeeplay/style-wizard-ai-59
- Domaine pointé vers ton serveur : `app4dums.com`

---

## Étape 1 — Connecter GitHub (1ère fois)
Coolify → **Sources → + Add → GitHub App** → autoriser `pixeeplay` + repo `style-wizard-ai-59`

---

## Étape 2 — Créer la ressource

Coolify → ton projet → **+ New Resource → Public Repository → Dockerfile**

| Champ | Valeur |
|---|---|
| Repository URL | `https://github.com/pixeeplay/style-wizard-ai-59` |
| Branch | `main` |
| Build Pack | **Dockerfile** |
| Dockerfile path | `Dockerfile` |
| Port | `80` |
| Domain | `app4dums.com` |

---

## Étape 3 — Variables d'environnement (Build Args)

Dans **Build Variables** (pas Environment Variables — Vite les injecte au build) :

```
VITE_SUPABASE_URL=https://luvvnwclzxhsxifzvusd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=luvvnwclzxhsxifzvusd
```

> ⚠️ Important : les variables `VITE_*` doivent être en **Build Args** dans Coolify,
> pas en Runtime Env — elles sont embarquées dans le bundle au moment du build.

---

## Étape 4 — Déployer

Clique **Deploy** → Coolify clone le repo, build l'image Docker, sert via Nginx.

SSL Let's Encrypt est géré automatiquement par Coolify.

---

## Déploiement auto (optionnel)

Dans Coolify → ton service → **Webhooks** → copie l'URL webhook
Puis dans GitHub → repo → Settings → Webhooks → colle l'URL
→ chaque push sur `main` redéploie automatiquement.
