# Gourmestre

[![CI Pipeline](https://github.com/tonguechaude/Gourmestre/actions/workflows/ci.yml/badge.svg)](https://github.com/tonguechaude/Gourmestre/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/tonguechaude/Gourmestre/branch/main/graph/badge.svg)](https://codecov.io/gh/tonguechaude/Gourmestre)
[![Security Audit](https://img.shields.io/badge/security-audit-green.svg)](https://github.com/tonguechaude/Gourmestre/actions)
[![Rust Version](https://img.shields.io/badge/rust-1.70+-blue.svg)](https://www.rust-lang.org)

Une application de gestion de restaurants type "Letterboxd pour restaurants" construite avec Rust, React et PostgreSQL.

## 🍽️ Fonctionnalités

- **Gestion de restaurants** : Ajout, notation et organisation de vos restaurants favoris
- **Wishlist** : Liste de restaurants à découvrir avec système de priorités
- **Authentification sécurisée** : Système de comptes utilisateurs avec sessions
- **Interface moderne** : Frontend React responsive et intuitive

## 🚀 Stack Technique

**Backend**
- Rust (Actix-web, SQLx, Tokio)
- PostgreSQL avec audit logging
- Authentification par sessions sécurisées

**Frontend**
- React 19 + TypeScript
- Vite pour le développement
- Axios pour les appels API

**Infrastructure**
- Docker & Docker Compose
- PostgreSQL 16

## 📋 Roadmap

### ✅ Fait
- [x] Structure de projet Rust + React
- [x] Configuration PostgreSQL avec Docker
- [x] Modèles de données (users, restaurants, wishlist)
- [x] Système de sessions sécurisé
- [x] Audit logging et contraintes de sécurité

### 🚧 En cours
- [ ] Implémentation des modèles Rust manquants
- [ ] API REST complète (CRUD restaurants/wishlist)  
- [ ] Interface utilisateur React
- [ ] Système d'authentification frontend

### 📅 À venir
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Système de notation (1-5 étoiles)
- [ ] Recherche et filtres avancés
- [ ] Import/export de données
- [ ] Mode sombre
- [ ] API mobile-ready

## 🛠️ Installation

### Prérequis
- Rust 1.70+
- Node.js 18+
- Docker & Docker Compose

### Démarrage rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/tonguechaude/Gourmestre.git
   cd Gourmestre
   ```

2. **Lancer la base de données**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Configuration environnement**
   ```bash
   # Créer le fichier .env à la racine du backend
   echo "DATABASE_URL=postgresql://u_gourmestre:tongue@localhost:5432/Gourmestre" > backend/.env
   ```

4. **Lancer le backend**
   ```bash
   cd backend
   cargo run
   # API disponible sur http://localhost:8080
   ```

5. **Lancer le frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Interface disponible sur http://localhost:5173
   ```

## 🗄️ Base de données

### Connexion PostgreSQL
- **Conteneur** : `docker exec -it <container_id> /bin/bash`
- **Base** : `psql -U u_gourmestre -d Gourmestre`
- **Tables** : `\\dt`
- **Users** : `SELECT * FROM users;`

### Schéma principal
- `users` : Gestion des comptes utilisateurs
- `restaurants` : Restaurants visités et notés  
- `wishlist_items` : Restaurants à découvrir
- `sessions` : Sessions utilisateurs sécurisées
- `audit_log` : Journal d'audit des actions

## 🧪 Tests et CI/CD

### Tests locaux
```bash
# Tests unitaires
cd backend && cargo test --lib

# Tests d'intégration  
cd backend && cargo test tests::integration

# Tous les tests
cd backend && cargo test

# Coverage
cd backend && cargo tarpaulin --out Html --output-dir coverage
```

### Pipeline CI/CD
1. **Code Quality** : formatage, linting, audit sécurité
2. **Unit Tests** : tests des fonctions de base
3. **Integration Tests** : tests des flows API complets
4. **Coverage** : génération et upload du coverage
5. **Build Check** : compilation multi-versions Rust
6. **Security Audit** : audit sécurité final

### Stack de tests
- `tokio-test` : Tests async avec Tokio
- `rstest` : Fixtures réutilisables et tests paramétrés
- `httpmock` : Mock server HTTP pour les tests d'intégration
- `reqwest` : Client HTTP pour tester les API
- `pretty_assertions` : Assertions avec diff colorés
- `cargo-tarpaulin` : Coverage pour Rust

## 🏗️ Architecture

```
Gourmestre/
├── backend/           # API Rust (Actix-web)
│   ├── src/
│   │   ├── main.rs
│   │   ├── models/    # Modèles de données
│   │   └── routes/    # Endpoints API
│   └── Cargo.toml
├── frontend/          # Interface React
│   ├── src/
│   │   ├── api/       # Client API
│   │   ├── hooks/     # React hooks
│   │   └── components/
│   └── package.json
├── docker/            # Configuration Docker
│   ├── docker-compose.yml
│   └── init.sql       # Schema PostgreSQL
└── CHANGELOG.md       # Journal des modifications
```

## 🔒 Sécurité

- **Sessions limitées** : Maximum 5 sessions actives par utilisateur
- **Audit logging** : Traçabilité de toutes les actions utilisateurs
- **Isolation base** : Utilisateur PostgreSQL dédié avec permissions minimales
- **Contraintes fortes** : Validation des données côté base
- **Hash sécurisé** : Mots de passe hachés avec contraintes de longueur

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le [CHANGELOG.md](CHANGELOG.md) pour suivre l'évolution du projet.

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request