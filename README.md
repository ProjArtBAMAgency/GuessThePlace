# Guess the Place 🗺️

## Description

Guess the Place est une application de jeu géolocalisé développée dans le cadre du cours ArchiOWeb.  
Les utilisateurs publient des photos géolocalisées et tentent de deviner leur emplacement exact pour gagner des points.  
Le backend repose sur une **API REST sécurisée** et respecte les bonnes pratiques d’architecture et de qualité de code.

## Équipe

- Maximilien Maret  
- Estelle Bolay  
- Victor Wojciechowski  
- Mathilde Ançay

## Fonctionnalités principales

- Création et authentification des utilisateurs (JWT)  
- Publication de photos géolocalisées  
- Validation des publications par un administrateur  
- Système de devinettes avec score calculé selon la précision  
- Classement global des joueurs  
- Gestion des rôles (user / admin)

## Stack technique

- **Langage** : Node.js / Express  
- **Base de données** : PostgreSQL  
- **Auth** : JWT  
- **Tests** : Jest  
- **Déploiement** : Render

## API REST

- User management (inscription, login, auth)  
- Ressources :
  - `users`  
  - `posts` (avec pagination et filtres)  
  - `guesses` (avec agrégations pour le leaderboard)  
- Sécurité : JWT + contrôle des rôles  
- Données géolocalisées + photo upload  
- Documentation via Swagger / OpenAPI

## Modèle de données

Voir le [schéma UML](https://editor.plantuml.com/uml/dL8nRiCm3Dpz2a5ZYmJjcYbRrowT3KPY4WAoQ4XKEXHzJn_IZvMM6WCndA7L84XtH-cEu3uB92b3w3eN86VpbZ6PZyxeUYHlTeQYjDkOiNXM94kYU6eW3a1XWOtwpZidtvyXdnSSvHxyG57X0tD0Y0rt2K7Gzo3AU3qA3TYeCleLwlDg-9Mpt35CJah2XOC0GbBy11y3mwysS3ojm7-sTGrvWK2LNmOjsjz-zZcdU2ce-sgCxBY6c87_cRhzk3Me708vxGV76qjr1kopDPkDiK_RxODjNTuPMqlGhabQ1DKSWSHsjUAE8k7t5q-YRe_HJzFt0m00).

