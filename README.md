# 🗺️ GuessThePlace

<div align="center">

**Une application web de géolocalisation et de devinettes**

Projet réalisé dans le cadre du cours ArchiOWeb et DévMobil - HEIG-VD

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey)](https://expressjs.com/)

🌐 **[www.guesstheplace.ch](https://www.guesstheplace.ch)** 🌐

📚 **[Documentation API](https://www.guesstheplace.ch/api-docs/)** 📚

</div>

---

## 📝 Description

**GuessThePlace** est une application de jeu géolocalisé interactive où les utilisateurs publient des photos géolocalisées et tentent de deviner leur emplacement exact pour gagner des points.

Le système de score se base sur la précision de la localisation devinée, créant ainsi une expérience compétitive et ludique. Le backend repose sur une **API REST sécurisée** respectant les bonnes pratiques d'architecture et de qualité de code.

---

## 👥 Équipe

- **Mathilde Ançay**
- **Estelle Bolay**
- **Maximilien Maret**
- **Victor Wojciechowski**

---

## ✨ Fonctionnalités principales

### Gestion des utilisateurs

- Inscription et authentification sécurisée (JWT)
- Système de rôles (utilisateur / administrateur)
- Gestion de profil

### Gestion des équipes

- Création et gestion d'équipes
- Attribution des joueurs aux équipes

### Publications

- Publication de photos géolocalisées
- Validation des publications par un administrateur
- Upload d'images avec stockage local

### Système de jeu

- Devinettes avec calcul de score basé sur la précision géographique
- Système de zones géographiques (Suisse)
- Calcul de distance avec la bibliothèque GeoLib

### Classement

- Classement global des joueurs
- Système de points basé sur la précision
- Agrégations de scores

Note : Les droits administrateurs existent, mais ne sont pour le moment implémentés que du côté backend (middleware, routes spécialisées, propriété is_admin du model User)
---

## 🛠️ Stack technique

### Backend

- **Langage** : Node.js (ES Modules)
- **Framework** : Express 5.1
- **Base de données** : MongoDB avec Mongoose 8.19
- **Authentification** : JWT (JSON Web Tokens)
- **Hashing** : bcrypt
- **Géolocalisation** : GeoLib
- **Upload** : Multer
- **Tests** : Jest + Supertest
- **Documentation** : OpenAPI/Swagger UI

### Frontend

- **Framework** : Vue.js 3.5
- **Routing** : Vue Router 4.6
- **State Management** : Vuex 4.0
- **Styling** : Tailwind CSS 4.1
- **Cartographie** : Leaflet 1.9 + D3.js 7.8
- **Build** : Vite 7.1
- **Icons** : Lucide Vue

### DevOps

- **Environnement** : dotenv
- 

---

## 🏗️ Architecture

```
GuessThePlace/
├── backend/              # API REST Node.js/Express
│   ├── src/
│   │   ├── bin/         # Point d'entrée (start.js)
│   │   ├── controllers/ # Logique métier
│   │   ├── models/      # Modèles Mongoose
│   │   ├── routes/      # Routes API v1
│   │   ├── middlewares/ # Auth & Admin
│   │   ├── data/        # Données GeoJSON
│   │   └── spec/        # Tests Jest
│   ├── openapi.yml      # Documentation API
│   ├── compose.yaml     # Docker Compose
│   └── package.json
│
└── frontend/            # Application Vue.js
    ├── src/
    │   ├── App.vue          # Composant racine
    │   ├── main.js          # Point d'entrée
    │   ├── components/      # Composants Vue réutilisables
    │   ├── composables/     # Logique réutilisable (Composition API)
    │   │   ├── api/         # Appels API (getProfile, getRankings, etc.)
    │   │   ├── useAuth.js   # Gestion authentification
    │   │   └── useLogout.js # Gestion déconnexion
    │   ├── views/           # Pages/vues de l'application
    │   ├── router/          # Configuration Vue Router
    │   ├── store/           # State management (Vuex)
    │   └── css/             # Styles globaux
    ├── public/              # Assets statiques
    ├── index.html           # Template HTML
    ├── vite.config.js       # Configuration Vite
    └── package.json
```

---

## 🚀 Installation et démarrage

### Prérequis

- Node.js 20.19+ ou 22.12+
- MongoDB (via Docker ou installation locale)
- npm ou yarn

### 1. Cloner le projet

```bash
git clone https://github.com/ProjArtBAMAgency/GuessThePlace.git
cd GuessThePlace
```

### 2. Configuration de la base de données

Démarrer MongoDB avec Docker Compose :

```bash
cd backend
docker compose up -d
```

MongoDB sera accessible sur `localhost:27017` avec :

- Username: `root`
- Password: `example`

### 3. Configuration du Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à la racine du dossier backend :

```env
DATABASE_URL=mongodb://root:example@localhost:27017/guesstheplace?authSource=admin
JWT_SECRET=your-secret-key-here
PORT=3000
```

Démarrer le serveur :

```bash
npm start
# ou en mode développement
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

### 4. Configuration du Frontend

```bash
cd frontend
npm install
```

Démarrer le serveur de développement :

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### 5. Build de production

Frontend :

```bash
cd frontend
npm run build
```

Les fichiers compilés seront dans `frontend/dist/` et automatiquement servis par le backend Express.

---

## 📚 Documentation API

### Accès à la documentation

#### Production

**[https://www.guesstheplace.ch/api-docs/](https://www.guesstheplace.ch/api-docs/)**

#### Développement local

Une fois le backend démarré : **http://localhost:3000/api-docs**

### Endpoints principaux

#### Authentication

- `POST /api/v1/register` - Inscription
- `POST /api/v1/login` - Connexion

#### Users

- `GET /api/v1/users` - Liste des utilisateurs
- `GET /api/v1/users/:id` - Détails d'un utilisateur
- `PATCH /api/v1/users/:id` - Mise à jour
- `DELETE /api/v1/users/:id` - Suppression

#### Teams

- `GET /api/v1/teams` - Liste des équipes
- `POST /api/v1/teams` - Créer une équipe
- `GET /api/v1/teams/:id` - Détails
- `PATCH /api/v1/teams/:id` - Mise à jour
- `DELETE /api/v1/teams/:id` - Suppression

#### Posts

- `GET /api/v1/posts` - Liste des publications (avec pagination)
- `POST /api/v1/posts` - Créer une publication (avec image)
- `GET /api/v1/posts/:id` - Détails
- `PATCH /api/v1/posts/:id` - Valider/modifier
- `DELETE /api/v1/posts/:id` - Suppression

#### Guesses

- `GET /api/v1/guesses` - Liste des devinettes
- `POST /api/v1/guesses` - Soumettre une devinette
- `GET /api/v1/guesses/:id` - Détails

#### Zones

- `GET /api/v1/zones` - Liste des zones géographiques
- `GET /api/v1/zones/:id` - Détails d'une zone

#### Scores

- `GET /api/v1/scores` - Classement global

### Authentification

Toutes les routes protégées nécessitent un token JWT dans un cookie nommé `token` :


```
Cookie: token=<votre-token-jwt>
```

---

## 🗄️ Modèle de données

### Schéma UML

Voir le [schéma UML complet](https://editor.plantuml.com/uml/dL8nRiCm3Dpz2a5ZYmJjcYbRrowT3KPY4WAoQ4XKEXHzJn_IZvMM6WCndA7L84XtH-cEu3uB92b3w3eN86VpbZ6PZyxeUYHlTeQYjDkOiNXM94kYU6eW3a1XWOtwpZidtvyXdnSSvHxyG57X0tD0Y0rt2K7Gzo3AU3qA3TYeCleLwlDg-9Mpt35CJah2XOC0GbBy11y3mwysS3ojm7-sTGrvWK2LNmOjsjz-zZcdU2ce-sgCxBY6c87_cRhzk3Me708vxGV76qjr1kopDPkDiK_RxODjNTuPMqlGhabQ1DKSWSHsjUAE8k7t5q-YRe_HJzFt0m00)

### Collections MongoDB

- **Users** : Utilisateurs avec authentification
- **Teams** : Équipes de joueurs
- **Posts** : Publications avec photos et géolocalisation
- **Guesses** : Tentatives de localisation
- **Zones** : Zones géographiques (données GeoJSON Suisse)

---

## 🎨 Design et Maquettes

Voir le [prototype interactif Figma](https://www.figma.com/proto/AcTlSTiW4zEp6mNWQY8846/ArchiOWeb---Maquettes?page-id=29%3A2&node-id=29-10&p=f&viewport=160%2C316%2C0.2&t=KLujkWTvebTQ7Dbh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=29%3A10)

---

## 🧪 Tests

Lancer les tests backend :

```bash
cd backend
npm run test
```

Les tests couvrent :

- Authentication (signup, login)
- Users CRUD
- Teams CRUD
- Posts avec upload d'images
- Guesses et calcul de scores
- Les routes /profile et /user-scores
- Zones géographiques

---

## 🔐 Sécurité

- Hashing des mots de passe avec bcrypt
- Authentification JWT
- Protection des routes avec middleware d'authentification
- Contrôle d'accès basé sur les rôles
- Validation des données entrantes
- Protection contre les injections NoSQL (Mongoose)

---

## 📊 Fonctionnalités clés

### Calcul du score

Le score est calculé en fonction de la distance entre la localisation devinée et la localisation réelle :

- Distance croissante : Points décroissants
- Algorithme basé sur GeoLib pour les calculs géographiques

### Pagination

L'API supporte la pagination pour optimiser les performances :

- Query params : `page`, `limit`
- Disponible sur : `/posts`, `/users`, `/guesses`

### Upload d'images

- Upload via Multer
- Stockage local dans `backend/images/`
- Formats supportés : JPG, PNG, GIF
- Taille maximum : configurable

---

## 🌐 Déploiement

### Application en production

L'application est accessible en ligne sur : **[www.guesstheplace.ch](https://www.guesstheplace.ch)**

### Variables d'environnement requises

```env
# Database
DATABASE_URL=mongodb://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=production
```

### Build frontend

```bash
cd frontend
npm run build
```

Les fichiers statiques dans `dist/` sont automatiquement servis par Express.

---

## 📄 Licence

Ce projet est développé dans le cadre académique du cours ArchiOWeb et DévMobil à la HEIG-VD.

---

## 📞 Contact

Projet GuessThePlace - [@ProjArtBAMAgency](https://github.com/ProjArtBAMAgency)

Lien du projet : [https://github.com/ProjArtBAMAgency/GuessThePlace](https://github.com/ProjArtBAMAgency/GuessThePlace)

---

<div align="center">

**Fait avec ❤️ à la HEIG-VD**

</div>
