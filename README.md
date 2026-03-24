# ADI Cerfa — Remplissage automatique par IA 🚗✨

Une application web puissante et élégante qui automatise le remplissage du **Cerfa 15776*01** (certificat de cession d'un véhicule d'occasion) en analysant vos documents (carte grise, CNI) via l'IA Vision.

---

## 🌟 Points Forts

-   **Extraction IA Multi-Modèle** : Support natif de **Gemini 2.0 Flash**, **Mistral**, et **OpenAI** via Vision.
-   **Design Premium** : Interface moderne sous React (Vite) avec **Glassmorphism**, animations fluides et dark mode élégant.
-   **Zéro Saisie** : Scannez la carte grise et les pièces d'identité, l'IA remplit les champs officiels pour vous.
-   **Export Officiel** : Génère le PDF Cerfa original de l'ANTS avec les champs AcroForm parfaitement positionnés.

## 🛠️ Stack Technique

-   **Frontend** : React 19, Vite, Tailwind CSS, Lucide Icons, Glassmorphism.
-   **Backend** : Python 3.12, Flask, LiteLLM-ready (multi-provider support).
-   **IA** : Google Gemini Vision (par défaut), Mistral AI, OpenAI GPT-4o.
-   **PDF Engine** : `pypdf` pour le mapping dynamique des champs AcroForm.

## 🚀 Installation & Lancement

### 1. Backend (Flask)
```bash
# Dans la racine du projet
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Configurez AI_PROVIDER, AI_MODEL et vos clés API dans .env
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 3. Lancer l'application
Démarrez le serveur Python :
```bash
python app.py
```
L'application est alors accessible sur [http://localhost:8080](http://localhost:8080).

## ⚙️ Configuration (.env)

| Variable | Description |
|---|---|
| `AI_PROVIDER` | `gemini` (défaut), `mistral` ou `openai` |
| `AI_MODEL` | `gemini-2.0-flash`, `mistral-large-latest`, `gpt-4o`, etc. |
| `GEMINI_API_KEY` | Requis pour le provider Gemini |
| `MISTRAL_API_KEY` | Requis pour le provider Mistral |
| `OPENAI_API_KEY` | Requis pour le provider OpenAI |
| `FLASK_DEBUG` | `true` pour le développement |

## 💡 Documents Supportés

1.  **Immatriculation (A)** : Remplit les infos véhicule (VIN, Marque, Genre, etc.).
2.  **CNI / Passeport (Vendeur/Acheteur)** : Extrait noms, prénoms et adresses.
3.  **Auto-détection** : Mode libre pour tout autre document lié à la vente.

---
Développé avec ❤️ et l'IA par **ADI Cerfa**.
