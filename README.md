<div align="center">

<img src="https://img.shields.io/badge/SmartStyle-AI-gold?style=for-the-badge&logo=sparkles&logoColor=white" alt="SmartStyle AI" />

# ✨ SmartStyle AI

### Votre styliste personnel alimenté par l'intelligence artificielle

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[🌐 Demo Live](https://style-wizard-ai-59.lovable.app) · [🐛 Signaler un bug](https://github.com/issues) · [💡 Proposer une fonctionnalité](https://github.com/issues)

---

![SmartStyle AI Hero](https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=400&fit=crop&q=80)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Captures d'écran](#-captures-décran)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Base de données](#-base-de-données)
- [Edge Functions](#-edge-functions)
- [Déploiement](#-déploiement)
- [Contribuer](#-contribuer)
- [Roadmap](#-roadmap)

---

## 🎯 À propos

**SmartStyle AI** est une application web complète de gestion de garde-robe intelligente. Elle combine l'intelligence artificielle, la vision par ordinateur et les données météo pour vous aider à vous habiller avec style — chaque jour.

> *"Arrêtez de passer 20 minutes chaque matin devant votre armoire. Laissez l'IA faire le travail."*

### Problème résolu

| Sans SmartStyle AI | Avec SmartStyle AI |
|---|---|
| ❌ Indécision matinale | ✅ Look du jour auto-généré |
| ❌ Vêtements portés au lavage | ✅ Suivi du linge en temps réel |
| ❌ Achats mal coordonnés | ✅ Suggestions de marques ciblées |
| ❌ Impossible de visualiser | ✅ Essayage virtuel 3 styles |
| ❌ Budget non maîtrisé | ✅ Analytics coût par port |

---

## 🚀 Fonctionnalités

### 👗 Gestion de garde-robe intelligente
- **Catalogue photo** — Photographiez vos vêtements, l'IA analyse automatiquement couleur, catégorie et style
- **Filtres avancés** — Filtrez par catégorie, couleur, saison, style
- **Suivi du statut** — Disponible / Au lavage
- **Historique de port** — Date de dernier port, nombre de ports

### 🤖 Styliste IA
- **Génération de looks** — Algorithme de cohérence des couleurs et morphologie
- **Mode humeur** — Générez un look selon votre état d'esprit du jour
- **Recommandations personnalisées** — Basées sur météo locale, occasion, préférences

### 📸 Essayage Virtuel (3 styles simultanés)
- **Flat Lay** — Vue de dessus style Instagram
- **Mannequin** — Tenue sur mannequin en studio
- **Éditorial** — Style magazine haute couture
- Génération en **parallèle** via IA
- Accessoires IA auto-ajoutés (chaussures, montre, ceinture...)

### 📅 Planification hebdomadaire
- Calendrier interactif semaine / mois
- Glisser-déposer des looks sur les jours
- Vue météo intégrée par ville
- Navigation tactile mobile (swipe)

### 💰 Analytics Coût par Port
- Calcul automatique du coût réel par utilisation
- Classement meilleur/pire rapport qualité-prix
- Suggestions de vêtements à davantage utiliser
- Graphiques de performance par catégorie

### 🛍️ Suggestions de Marques
- **Haut de gamme** : Sandro, Maje, Jacquemus, Isabel Marant, A.P.C.
- **Fast Fashion** : Zara, H&M, Uniqlo, Mango, & Other Stories
- Liens directs vers les boutiques en ligne
- Prix indicatifs par article

### ✈️ Valise Intelligente (Travel View)
- Création de listes de bagages par destination
- Optimisation selon la durée et le type de voyage
- Sélection intelligente depuis votre garde-robe

### 🎨 Thèmes saisonniers automatiques
- Détection automatique de la saison
- Thèmes spéciaux : Noël, Saint-Valentin, Été, Automne
- Palette de couleurs adaptée à chaque thème

### 🌍 Multi-langue
- Français 🇫🇷
- English 🇬🇧
- Basculement instantané sans rechargement

---

## 📱 Captures d'écran

<div align="center">

| Landing Page | Stylist AI | Virtual Try-On |
|:---:|:---:|:---:|
| ![Landing](https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&h=200&fit=crop) | ![Stylist](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop) | ![TryOn](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop) |

| Weekly Planner | Analytics | Brand Suggestions |
|:---:|:---:|:---:|
| ![Planner](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop) | ![Analytics](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop) | ![Brands](https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop) |

</div>

---

## 🛠 Stack technique

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| **React** | 18.x | Framework UI |
| **TypeScript** | 5.x | Typage statique |
| **Vite** | 5.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Styling utilitaire |
| **shadcn/ui** | latest | Composants UI |
| **React Router** | 6.x | Navigation SPA |
| **TanStack Query** | 5.x | State management & cache |
| **Zod** | 3.x | Validation de schémas |
| **Lucide React** | latest | Icônes |

### Backend (Lovable Cloud / Supabase)
| Service | Usage |
|---|---|
| **Supabase Auth** | Authentification email/password |
| **Supabase Database** | PostgreSQL — garde-robe, tenues, profils |
| **Supabase Storage** | Stockage des photos de vêtements |
| **Supabase Edge Functions** | IA, météo, génération d'images |
| **Row Level Security (RLS)** | Isolation des données par utilisateur |

### IA & APIs externes
| Service | Usage |
|---|---|
| **Lovable AI Gateway** | Génération d'images (virtual try-on) |
| **OpenWeather API** | Météo en temps réel |
| **Gemini / GPT** | Analyse de vêtements, génération de looks |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React SPA)                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Auth     │  │ Wardrobe │  │ Stylist / Try-On │  │
│  │ Pages    │  │ Pages    │  │ Pages            │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
│  ┌────▼──────────────▼──────────────────▼─────────┐ │
│  │           TanStack Query + Hooks               │ │
│  │  useAuth | useWardrobe | useOutfits | useProfile│ │
│  └────────────────────────┬────────────────────────┘ │
└───────────────────────────┼─────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────┐
│                 LOVABLE CLOUD (Supabase)             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth   │  │ Database │  │    Storage       │  │
│  │ (JWT)    │  │ (PgSQL)  │  │ (Photos clothes) │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │              Edge Functions                  │   │
│  │  analyze-clothing | generate-smart-look      │   │
│  │  virtual-tryon (3 styles) | get-weather      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Flux de données — Virtual Try-On 3 styles

```
User clicks "Visualize (3 styles)"
        │
        ├──► Edge Function: virtual-tryon?style=flatlay    ──► AI Gateway ──► Image
        ├──► Edge Function: virtual-tryon?style=mannequin  ──► AI Gateway ──► Image  (parallel)
        └──► Edge Function: virtual-tryon?style=editorial  ──► AI Gateway ──► Image
                │
                └──► Save to Supabase DB (outfits.try_on_images)
                └──► Display in Virtual Try-On Dialog
```

---

## 💻 Installation

### Prérequis

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0 ou **bun** ≥ 1.0.0
- Un compte [Supabase](https://supabase.com) (ou Lovable Cloud)

### 1. Cloner le repo

```bash
git clone https://github.com/YOUR_USERNAME/smartstyle-ai.git
cd smartstyle-ai
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Avec bun (recommandé — plus rapide)
bun install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Supabase / Lovable Cloud
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# OpenWeather API (pour la météo)
OPENWEATHER_API_KEY=your_openweather_key_here
```

> ⚠️ Ne committez **jamais** vos clés privées. Le fichier `.env.local` est dans `.gitignore`.

### 4. Lancer en développement

```bash
npm run dev
# ou
bun dev
```

Ouvrez [http://localhost:8080](http://localhost:8080) dans votre navigateur.

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL de votre projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Clé publique anon Supabase |
| `OPENWEATHER_API_KEY` | ⚠️ | Clé API météo (Edge Function secret) |

### Secrets Edge Functions (Supabase Dashboard)

Ces secrets sont configurés côté serveur et ne sont **jamais** exposés au client :

| Secret | Usage |
|---|---|
| `OPENWEATHER_API_KEY` | Récupération météo locale |
| `AI_GATEWAY_KEY` | Génération d'images IA |

---

## 📁 Structure du projet

```
smartstyle-ai/
│
├── public/                     # Assets statiques
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── assets/                 # Images & ressources
│   │   └── hero-bg.jpg
│   │
│   ├── components/             # Composants React
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── AddClothingDialog.tsx    # Ajout vêtement (photo + IA)
│   │   ├── CapsuleWardrobe.tsx      # Garde-robe capsule
│   │   ├── CostPerWearAnalytics.tsx # Analytics coût/port + marques
│   │   ├── LaundryTracker.tsx       # Suivi du linge
│   │   ├── OutfitCalendar.tsx       # Calendrier des tenues
│   │   ├── OutfitGallery.tsx        # Galerie des looks sauvegardés
│   │   ├── OutfitHistory.tsx        # Historique de port
│   │   ├── OutfitOfTheDay.tsx       # Look du jour (popup)
│   │   ├── OutfitRecommendations.tsx# Recommandations IA
│   │   ├── OutfitSlideshow.tsx      # Slideshow des tenues
│   │   ├── StylistView.tsx          # Vue principale styliste (843 lignes)
│   │   ├── ThemeNotifier.tsx        # Notifications thèmes saisonniers
│   │   ├── TravelView.tsx           # Vue voyage / valise
│   │   ├── TryOnGallery.tsx         # Galerie essayage virtuel
│   │   ├── WardrobeAnalytics.tsx    # Stats garde-robe
│   │   ├── WardrobeFilters.tsx      # Filtres de recherche
│   │   └── WeeklyPlanner.tsx        # Planificateur hebdomadaire
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.tsx              # Auth context + signIn/signUp/signOut
│   │   ├── useOutfits.ts            # CRUD tenues + images try-on
│   │   ├── useProfile.ts            # Profil utilisateur
│   │   ├── useSeasonalTheme.ts      # Thème saisonnier automatique
│   │   ├── useTranslation.ts        # i18n FR/EN
│   │   ├── useWardrobe.ts           # CRUD garde-robe
│   │   └── use-mobile.tsx           # Détection mobile
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Client Supabase (auto-généré)
│   │       └── types.ts             # Types DB TypeScript (auto-généré)
│   │
│   ├── lib/
│   │   ├── seasonal-themes.ts       # Définition des thèmes saisonniers
│   │   ├── translations.ts          # Traductions EN
│   │   ├── translations-fr.ts       # Traductions FR
│   │   └── utils.ts                 # Utilitaires (cn, etc.)
│   │
│   ├── pages/
│   │   ├── Auth.tsx                 # Page connexion / inscription
│   │   ├── Index.tsx                # App principale (tabs)
│   │   ├── Landing.tsx              # Page d'accueil publique
│   │   ├── NotFound.tsx             # Page 404
│   │   └── Onboarding.tsx           # Onboarding (photo, mensurations, morpho)
│   │
│   ├── App.tsx                 # Router + providers + ProtectedRoute
│   ├── App.css                 # Styles globaux
│   ├── index.css               # Design tokens CSS (HSL variables)
│   └── main.tsx                # Entry point React
│
├── supabase/
│   ├── config.toml             # Config Supabase (auto-généré)
│   ├── migrations/             # Migrations SQL (historique)
│   └── functions/              # Edge Functions Deno
│       ├── analyze-clothing/   # Analyse IA d'un vêtement
│       │   └── index.ts
│       ├── generate-smart-look/# Génération de look IA
│       │   └── index.ts
│       ├── get-weather/        # API météo OpenWeather
│       │   └── index.ts
│       └── virtual-tryon/      # Essayage virtuel 3 styles
│           └── index.ts
│
├── tailwind.config.ts          # Config Tailwind + tokens custom
├── tsconfig.json               # Config TypeScript
├── vite.config.ts              # Config Vite
└── package.json
```

---

## 🗄 Base de données

### Schéma PostgreSQL

```sql
-- Profils utilisateurs
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT,
  avatar_url  TEXT,
  height_cm   INTEGER,
  weight_kg   INTEGER,
  morphology  body_morphology,    -- rectangle | hourglass | inverted_triangle | triangle | oval | athletic
  style_preferences  style_type[],
  onboarding_completed  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Garde-robe
CREATE TABLE public.wardrobe (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  name          TEXT,
  category      clothing_category,  -- top | bottom | dress | outerwear | shoes | accessory | ...
  color         TEXT NOT NULL,
  secondary_color TEXT,
  season        season,             -- spring | summer | fall | winter | all
  style         style_type,         -- casual | formal | sport | business | evening | vacation
  brand         TEXT,
  image_url     TEXT NOT NULL,
  purchase_price  DECIMAL,
  wear_count    INTEGER DEFAULT 0,
  last_worn_at  TIMESTAMPTZ,
  status        clothing_status DEFAULT 'available',  -- available | laundry
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Tenues / Outfits
CREATE TABLE public.outfits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  name                TEXT,
  items               TEXT[],           -- Array d'IDs wardrobe
  occasion            TEXT,
  season              season,
  wear_count          INTEGER DEFAULT 0,
  last_worn_at        TIMESTAMPTZ,
  scheduled_date      DATE,
  is_favorite         BOOLEAN DEFAULT false,
  try_on_image_url    TEXT,             -- Image principale
  try_on_images       JSONB,            -- { flatlay, mannequin, editorial }
  visualization_style TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Listes de voyage
CREATE TABLE public.packing_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  destination TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  trip_type   style_type,
  items       JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Politiques RLS (Row Level Security)

Toutes les tables sont protégées — chaque utilisateur ne peut accéder qu'à ses propres données :

```sql
-- Exemple sur wardrobe
CREATE POLICY "Users can only see their own wardrobe"
  ON public.wardrobe FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON public.wardrobe FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## ⚡ Edge Functions

Les Edge Functions sont déployées automatiquement sur Supabase (Deno runtime).

### `analyze-clothing`
Analyse une photo de vêtement avec l'IA et retourne :
- Catégorie détectée (top, bottom, dress...)
- Couleur principale
- Style suggéré
- Nom descriptif

```typescript
POST /functions/v1/analyze-clothing
Body: { imageUrl: string }
Response: { category, color, style, name }
```

### `generate-smart-look`
Génère une combinaison de vêtements optimale :
- Prend en compte la cohérence des couleurs
- Adapte à la météo locale (si ville fournie)
- Respecte la morphologie de l'utilisateur

```typescript
POST /functions/v1/generate-smart-look
Body: { items: WardrobeItem[], mood?: string, city?: string }
Response: { top, bottom, reasoning }
```

### `virtual-tryon`
Génère une visualisation IA de la tenue :
- 3 styles distincts (flatlay / mannequin / editorial)
- Appelée 3x en parallèle pour performance maximale
- Ajoute automatiquement des accessoires complémentaires

```typescript
POST /functions/v1/virtual-tryon
Body: {
  topImageUrl: string,
  bottomImageUrl: string,
  style: 'flatlay' | 'mannequin' | 'editorial',
  accessories: boolean,
  morphology?: string,
  city?: string
}
Response: { imageUrl: string }
```

### `get-weather`
Récupère les conditions météo actuelles :
```typescript
POST /functions/v1/get-weather
Body: { city: string }
Response: { temperature, description, icon, humidity }
```

---

## 🚀 Déploiement

### Option 1 — Lovable (Recommandé)

1. Ouvrez [Lovable](https://lovable.dev/projects/175ae048-9f47-46e2-bfd0-05e5824cd767)
2. Cliquez sur **Publish** en haut à droite
3. Votre app est live sur `votre-projet.lovable.app`

### Option 2 — Vercel / Netlify

```bash
# Build de production
npm run build

# Les fichiers de sortie sont dans dist/
```

**Variables d'environnement à configurer sur votre hébergeur :**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Option 3 — Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t smartstyle-ai .
docker run -p 3000:80 smartstyle-ai
```

---

## 🗺 Roadmap

### Version 1.0 — MVP ✅
- [x] Authentification & onboarding
- [x] Gestion de garde-robe (CRUD + photos)
- [x] Analyse IA des vêtements
- [x] Génération de looks IA
- [x] Virtual Try-On 3 styles
- [x] Planificateur hebdomadaire
- [x] Suivi du linge
- [x] Analytics coût/port
- [x] Suggestions de marques
- [x] Thèmes saisonniers
- [x] Multi-langue FR/EN
- [x] Landing page

### Version 1.1 — En cours 🔄
- [ ] Corrections post-onboarding (redirection vers /app)
- [ ] Gestion d'erreurs enrichie (crédits IA insuffisants)
- [ ] Animations framer-motion sur la landing
- [ ] Mode hors-ligne (PWA)

### Version 2.0 — Planifié 📋
- [ ] App mobile native (React Native)
- [ ] Partage de looks avec la communauté
- [ ] Intégration API shopping (Zalando, ASOS)
- [ ] Recommandations basées sur l'historique complet
- [ ] Analyse de tendances mode (IA)
- [ ] Connexion Google/Apple Sign-In
- [ ] Export PDF planning hebdomadaire
- [ ] Mode collaboratif (couple, famille)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/smartstyle-ai.git
cd smartstyle-ai
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Développer

```bash
npm install
npm run dev
```

### 3. Conventions de code

- **TypeScript strict** — pas de `any` sans justification
- **Composants React** — fonctionnels uniquement, avec hooks
- **Styles** — Tailwind CSS uniquement, via les tokens de `index.css`
- **Commits** — format Conventional Commits :

```
feat: ajouter le partage de looks
fix: corriger la redirection post-onboarding
style: harmoniser les espacements mobile
docs: mettre à jour le README
```

### 4. Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
# Ouvrir une PR sur GitHub avec description détaillée
```

---

## 🔒 Sécurité

- ✅ **RLS activé** sur toutes les tables Supabase
- ✅ **JWT** pour toutes les requêtes authentifiées
- ✅ **Clés privées** jamais exposées côté client
- ✅ **Validation des entrées** avec Zod
- ✅ **HTTPS** obligatoire en production
- ⚠️ Signaler une vulnérabilité via [GitHub Security Advisories](https://github.com/security/advisories)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

Développé avec ❤️ et **[Lovable AI](https://lovable.dev)**

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4?style=for-the-badge)](https://lovable.dev)

---

<div align="center">

**⭐ Si ce projet vous plaît, n'oubliez pas de mettre une étoile !**

[🌐 Demo](https://style-wizard-ai-59.lovable.app) · [📝 Documentation](https://docs.lovable.dev) · [💬 Discord Lovable](https://discord.gg/lovable)

</div>
