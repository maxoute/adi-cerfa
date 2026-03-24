#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
source venv/bin/activate
echo "🚀 Lancement de l'application Cerfa IA..."
echo "👉 Ouvrir : http://localhost:5000"
python3 app.py
