# Documentation Docker - Gourmestre

## Démarrage rapide

1. **Cloner le projet et aller dans le dossier docker**
   ```bash
   git clone https://github.com/tonguechaude/Gourmestre.git
   cd Gourmestre/docker
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier .env selon vos besoins
   ```

3. **Lancer l'application complète**
   ```bash
   docker-compose up --build
   ```

4. **Accéder à l'application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Base de données: localhost:5432

## Structure des services

### Services Docker
- **db**: PostgreSQL 16 avec données persistantes
- **backend**: API Rust (Actix-web) compilée en production
- **frontend**: React avec Nginx en mode production

### Ports par défaut
- Frontend: 3000
- Backend: 8080  
- Database: 5432

## Variables d'environnement

Toutes les variables sont configurables via le fichier `.env`:

### Base de données
- `DB_HOST`: Hôte de la base (défaut: db)
- `DB_PORT`: Port de la base (défaut: 5432)
- `DB_NAME`: Nom de la base (défaut: Gourmestre)
- `DB_USER`: Utilisateur PostgreSQL (défaut: u_gourmestre)
- `DB_PASSWORD`: Mot de passe (défaut: tongue)

### Backend
- `DATABASE_URL`: URL complète de connexion PostgreSQL
- `RUST_LOG`: Niveau de logs (défaut: info)
- `SERVER_HOST`: Interface d'écoute (défaut: 0.0.0.0)
- `SERVER_PORT`: Port du serveur (défaut: 8080)

### Frontend
- `FRONTEND_PORT`: Port d'exposition (défaut: 3000)
- `VITE_API_URL`: URL de l'API backend

## Commandes utiles

### Démarrage
```bash
# Démarrage complet
docker-compose up -d

# Démarrage avec rebuild
docker-compose up --build

# Démarrage d'un service spécifique
docker-compose up db backend
```

### Logs et debugging
```bash
# Voir les logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Statut des services
docker-compose ps
```

### Gestion des données
```bash
# Accéder à PostgreSQL
docker-compose exec db psql -U u_gourmestre -d Gourmestre

# Backup de la base
docker-compose exec db pg_dump -U u_gourmestre Gourmestre > backup.sql

# Restaurer la base
docker-compose exec -T db psql -U u_gourmestre -d Gourmestre < backup.sql
```

### Nettoyage
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Nettoyage complet (images, conteneurs, volumes)
docker-compose down -v --rmi all
```

## Health checks

Tous les services ont des health checks configurés:
- **Database**: `pg_isready` toutes les 10s
- **Backend**: `curl http://localhost:8080/health` toutes les 30s  
- **Frontend**: `curl http://localhost:80/health` toutes les 30s

## Optimisations production

### Backend Rust
- Build multi-stage pour réduire la taille
- Utilisateur non-root pour la sécurité
- Compilation optimisée (`lto = true`, `strip = true`)
- Health check intégré

### Frontend React
- Build optimisé avec Vite
- Nginx avec compression gzip
- Cache des assets statiques (1 an)
- Proxy API vers le backend
- Configuration sécurisée (headers CORS, XSS, etc.)

### Base de données
- Volume persistant pour les données
- Script d'initialisation automatique
- Health check PostgreSQL

## Troubleshooting

### Service ne démarre pas
```bash
# Vérifier les logs
docker-compose logs [service_name]

# Vérifier la config
docker-compose config
```

### Problème de connexion base
```bash
# Tester la connexion PostgreSQL
docker-compose exec backend curl -f http://localhost:8080/health
```

### Problème de build
```bash
# Rebuild complet
docker-compose build --no-cache
docker-compose up
```

### Ports déjà utilisés
Modifier les ports dans `.env`:
```bash
FRONTEND_PORT=3001
SERVER_PORT=8081
DB_PORT=5433
```