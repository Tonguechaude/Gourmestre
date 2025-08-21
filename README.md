# Gourmestre

[![CI Pipeline](https://github.com/tonguechaude/Gourmestre/actions/workflows/ci.yml/badge.svg)](https://github.com/tonguechaude/Gourmestre/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/tonguechaude/Gourmestre/branch/main/graph/badge.svg)](https://codecov.io/gh/tonguechaude/Gourmestre)
[![Security Audit](https://img.shields.io/badge/security-audit-green.svg)](https://github.com/tonguechaude/Gourmestre/actions)
[![Rust Version](https://img.shields.io/badge/rust-1.70+-blue.svg)](https://www.rust-lang.org)

Une application de gestion de restaurants type "Letterboxd pour restaurants" construite avec Rust, React et PostgreSQL.

## Fonctionnalités

- **Gestion de restaurants** : Ajout, notation et organisation de vos restaurants favoris
- **Wishlist** : Liste de restaurants à découvrir avec système de priorités
- **Authentification sécurisée** : Système de comptes utilisateurs avec sessions
- **Interface moderne** : Frontend React responsive et intuitive
- **Architecture moderne** : Frontend refactorisé avec React Query, Zod validation et code splitting
- **Performance optimisée** : Bundle optimisé avec lazy loading et React.memo

## Stack Technique

**Backend**
- Rust (Actix-web, SQLx, Tokio)
- PostgreSQL avec audit logging
- Authentification par sessions sécurisées

**Frontend**
- React 19 + TypeScript
- React Query pour la gestion d'état serveur
- React Hook Form + Zod pour la validation
- Vite pour le développement et build
- Architecture feature-based modulaire

**Infrastructure**
- Docker & Docker Compose
- PostgreSQL 16

## Architecture Frontend

Le frontend utilise une architecture moderne feature-based :

```
frontend/src/
├── features/              # Organisation par fonctionnalités
│   ├── restaurants/       # Gestion des restaurants
│   │   ├── components/    # Composants React
│   │   └── hooks/         # Hooks personnalisés
│   ├── wishlist/          # Gestion de la wishlist
│   └── dashboard/         # Layout et navigation
├── shared/                # Code partagé
│   ├── components/        # Composants réutilisables
│   ├── hooks/             # Hooks utilitaires
│   └── validation/        # Schémas Zod
└── app/                   # Configuration globale
    └── providers/         # React Query, contextes
```

**Dépendances clés :**
- `@tanstack/react-query` : Cache intelligent et gestion des appels API
- `react-hook-form` : Formulaires performants avec validation
- `zod` : Validation type-safe des données
- `zustand` : État global léger (alternative à Redux)

## Roadmap

### Terminé
- [x] Structure de projet Rust + React
- [x] Configuration PostgreSQL avec Docker
- [x] Modèles de données (users, restaurants, wishlist)
- [x] Système de sessions sécurisé
- [x] Audit logging et contraintes de sécurité
- [x] Refactoring frontend complet (870 → 330 lignes Dashboard)
- [x] Architecture feature-based modulaire
- [x] Validation type-safe avec Zod
- [x] Performance optimisée avec code splitting
- [x] Interface responsive (mobile/tablet/desktop)

### En cours
- [ ] Implémentation des modèles Rust manquants
- [ ] API REST complète (CRUD restaurants/wishlist)
- [ ] Système d'authentification frontend

### À venir
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Recherche et filtres avancés
- [ ] Import/export de données
- [ ] Mode sombre
- [ ] API mobile-ready

## Installation

### Prérequis
- Rust 1.80+
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
   ```
    # Base de données
    DATABASE_URL=postgresql://u_gourmestre:tongue@127.0.0.1:5432/Gourmestre
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_NAME=Gourmestre
    DB_USER=u_gourmestre
    DB_PASSWORD=tongue

    # Rust params
    RUST_LOG=debug
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

## Guide d'utilisation des dépendances

### React Hook Form
Simplification des formulaires avec validation automatique :
```typescript
// Utilisation basique
const { register, handleSubmit, errors } = useForm();

// Dans le JSX
<input {...register('name')} />
<button onClick={handleSubmit(onSubmit)}>Valider</button>
```

### Zod Validation
Validation type-safe des données :
```typescript
// Définition du schéma
const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  rating: z.number().min(1).max(5)
});

// Validation automatique
const result = schema.parse(formData);
```

### React Query
Gestion intelligente des appels API avec cache :
```typescript
// Récupération des données
const { data: restaurants, isLoading } = useQuery({
  queryKey: ['restaurants'],
  queryFn: restaurantApi.getAll
});
```

### Zustand
État global simple :
```typescript
// Création du store
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// Utilisation
const user = useStore(state => state.user);
```

## Base de données

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

## Tests et CI/CD

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

## Architecture Projet

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
│   │   ├── features/  # Architecture feature-based
│   │   ├── shared/    # Code partagé
│   │   └── app/       # Configuration globale
│   └── package.json
├── docker/            # Configuration Docker
│   ├── docker-compose.yml
│   └── init.sql       # Schema PostgreSQL
└── CHANGELOG.md       # Journal des modifications
```

## Sécurité

- **Sessions limitées** : Maximum 5 sessions actives par utilisateur
- **Audit logging** : Traçabilité de toutes les actions utilisateurs
- **Isolation base** : Utilisateur PostgreSQL dédié avec permissions minimales
- **Contraintes fortes** : Validation des données côté base
- **Hash sécurisé** : Mots de passe hachés avec contraintes de longueur

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contribution

Les contributions sont les bienvenues ! Consultez le [CHANGELOG.md](CHANGELOG.md) pour suivre l'évolution du projet.

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
