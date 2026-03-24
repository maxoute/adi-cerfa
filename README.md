# ADI Cerfa — Remplissage automatique par OCR

Application web qui scanne un document (carte grise, CNI) et remplit automatiquement le **Cerfa 15776*01** (certificat de cession d'un véhicule d'occasion) grâce à l'IA Gemini Vision.

---

## Fonctionnement

1. Importer une image de document (carte grise ou CNI)
2. L'IA extrait automatiquement les informations
3. Les champs du Cerfa sont pré-remplis
4. Télécharger le PDF officiel complété

## Stack

- **Backend** : Python / Flask
- **IA** : Google Gemini 2.0 Flash (Vision)
- **PDF** : pypdf — remplissage des champs AcroForm du Cerfa officiel
- **Déploiement** : Gunicorn / Railway / Render

## Installation locale

```bash
git clone https://github.com/maxoute/adi-cerfa.git
cd adi-cerfa

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Renseigner GEMINI_API_KEY et SECRET_KEY dans .env

python app.py
```

L'application est accessible sur [http://localhost:8080](http://localhost:8080).

## Variables d'environnement

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Clé API Google Gemini |
| `SECRET_KEY` | Clé secrète Flask (générer une valeur aléatoire en prod) |
| `PORT` | Port d'écoute (défaut : 8080) |
| `FLASK_DEBUG` | `true` en dev, `false` en prod |

## Déploiement (Railway / Render)

1. Importer le repo GitHub
2. Ajouter les variables d'environnement (`GEMINI_API_KEY`, `SECRET_KEY`)
3. Le `Procfile` lance automatiquement gunicorn

## Documents supportés

- Carte grise (certificat d'immatriculation)
- CNI / Passeport / Permis de conduire
- Tout document (mode auto-détection)
