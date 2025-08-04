#!/bin/bash

echo "🍽️ Démarrage de Gourmestre..."

# Fonction pour nettoyer les processus à la sortie
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Démarrer la base de données si elle n'est pas déjà lancée
echo "📋 Vérification de la base de données..."
if ! docker ps | grep -q docker-db-1; then
    echo "🚀 Démarrage de PostgreSQL..."
    docker-compose -f docker/docker-compose.yml up -d
    sleep 3
fi

# Démarrer le backend
echo "🦀 Démarrage du backend Rust..."
cd backend && /home/tonguechaude/.cargo/bin/cargo run &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 5

# Démarrer le frontend
echo "⚛️ Démarrage du frontend React..."
cd frontend && /home/tonguechaude/.nvm/versions/node/v22.17.0/bin/npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services démarrés !"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8080/api/v1"
echo "📊 Test utilisateurs: http://localhost:8080/api/v1/users"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre les processus
wait $BACKEND_PID $FRONTEND_PID