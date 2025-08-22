# Déploiement Gourmestre v0.1.0

## Prérequis VPS

- Ubuntu/Debian avec nginx installé
- Docker et Docker Compose
- Certbot pour Let's Encrypt
- Accès sudo

## Étapes de déploiement

### 1. Copier les fichiers sur le VPS

```bash
scp -r deploy/ user@ton-vps.com:/tmp/gourmestre-deploy/
```

### 2. Configurer les variables d'environnement

Modifier `/tmp/gourmestre-deploy/.env.prod` :
```bash
DB_PASSWORD=MOT_DE_PASSE_SECURISE
```

### 3. Lancer le déploiement

```bash
ssh user@ton-vps.com
cd /tmp/gourmestre-deploy
chmod +x deploy.sh
./deploy.sh
```

## Configuration nginx

Le script configure automatiquement :
- Reverse proxy vers les containers Docker
- HTTPS avec Let's Encrypt
- Headers de sécurité
- Compression gzip

## Accès

- Application : https://gourmestre.tonguechaude.fr
- API : https://gourmestre.tonguechaude.fr/api
- Documentation : https://gourmestre.tonguechaude.fr/swagger-ui/

## Commandes utiles

```bash
# Voir les logs
docker-compose -f /opt/gourmestre/docker-compose.prod.yml logs -f

# Redémarrer
docker-compose -f /opt/gourmestre/docker-compose.prod.yml restart

# Arrêter
docker-compose -f /opt/gourmestre/docker-compose.prod.yml down
```