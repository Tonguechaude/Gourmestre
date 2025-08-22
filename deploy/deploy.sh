#!/bin/bash

# Script de déploiement Gourmestre v0.1.0
# Usage: ./deploy.sh

set -e

echo "Déploiement Gourmestre v0.1.0 sur VPS"
echo "====================================="

DOMAIN="gourmestre.tonguechaude.fr"
APP_DIR="/opt/gourmestre"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

echo "Vérifications préalables..."

if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé. Installez Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installé. Installez Docker Compose d'abord."
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    echo "Nginx n'est pas installé. Installez Nginx d'abord."
    exit 1
fi

echo "Création du répertoire d'application..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo "Copie des fichiers..."
cp -r ../docker/* $APP_DIR/
cp $ENV_FILE $APP_DIR/.env

echo "Configuration des permissions..."
chmod +x $APP_DIR/deploy.sh
chmod 600 $APP_DIR/.env

echo "Arrêt des services existants..."
cd $APP_DIR
docker-compose -f $DOCKER_COMPOSE_FILE down 2>/dev/null || true

echo "Construction et démarrage des services..."
docker-compose -f $DOCKER_COMPOSE_FILE up --build -d

echo "Attente du démarrage des services..."
sleep 30

echo "Vérification des services..."
if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
    echo "Services Docker démarrés avec succès"
else
    echo "Erreur lors du démarrage des services Docker"
    docker-compose -f $DOCKER_COMPOSE_FILE logs
    exit 1
fi

echo "Configuration Nginx..."

sudo cp nginx-gourmestre.conf /etc/nginx/sites-available/$DOMAIN

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

if sudo nginx -t; then
    echo "Configuration Nginx valide"
else
    echo "Erreur dans la configuration Nginx"
    exit 1
fi

echo "Configuration SSL..."
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "Génération du certificat SSL pour $DOMAIN..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@tonguechaude.fr
else
    echo "Certificat SSL déjà présent pour $DOMAIN"
fi

echo "Rechargement Nginx..."
sudo systemctl reload nginx

if command -v ufw &> /dev/null; then
    echo "Configuration du firewall..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
fi

echo "Tests finaux..."

if curl -f http://localhost:8080/health &> /dev/null; then
    echo "Backend accessible localement"
else
    echo "Backend non accessible"
fi

if curl -f http://localhost:3000 &> /dev/null; then
    echo "Frontend accessible localement"
else
    echo "Frontend non accessible"
fi

echo ""
echo "Déploiement terminé !"
echo "===================="
echo "Application: https://$DOMAIN"
echo "API: https://$DOMAIN/api/health"
echo "Documentation: https://$DOMAIN/swagger-ui/"
echo ""
echo "Commandes utiles:"
echo "- Logs: docker-compose -f $APP_DIR/$DOCKER_COMPOSE_FILE logs -f"
echo "- Status: docker-compose -f $APP_DIR/$DOCKER_COMPOSE_FILE ps"
echo "- Restart: docker-compose -f $APP_DIR/$DOCKER_COMPOSE_FILE restart"
echo "- Stop: docker-compose -f $APP_DIR/$DOCKER_COMPOSE_FILE down"
echo ""
echo "Configuration dans: $APP_DIR"
