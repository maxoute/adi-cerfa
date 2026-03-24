"""
Application OCR - Remplissage automatique du Cerfa 15776*01
Certificat de cession d'un véhicule d'occasion
"""

import os
import json
import io
from flask import Flask, request, jsonify, send_file
from google import genai
from google.genai import types
import PIL.Image
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", static_url_path="")
app.secret_key = os.environ["SECRET_KEY"]

# ─────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────

PROMPT_CARTE_GRISE = """
Tu es un expert en lecture de cartes grises françaises (certificats d'immatriculation).
Analyse cette image et extrais TOUTES les informations visibles.

Retourne UNIQUEMENT un JSON valide avec ces champs (laisse "" si non visible) :
{
  "immatriculation": "",
  "date_premiere_immat": "",
  "numero_vin": "",
  "marque": "",
  "type_variante_version": "",
  "denomination_commerciale": "",
  "genre_national": "",
  "numero_formule": "",
  "date_certificat": "",
  "nom_proprietaire": "",
  "adresse_proprietaire": "",
  "code_postal": "",
  "commune": ""
}
"""

PROMPT_CNI = """
Tu es un expert en lecture de documents d'identité français (CNI, passeport, permis de conduire).
Analyse cette image et extrais les informations d'identité.

Retourne UNIQUEMENT un JSON valide avec ces champs (laisse "" si non visible) :
{
  "nom": "",
  "nom_usage": "",
  "prenom": "",
  "date_naissance": "",
  "lieu_naissance": "",
  "sexe": "",
  "adresse": "",
  "numero_voie": "",
  "type_voie": "",
  "nom_voie": "",
  "code_postal": "",
  "commune": "",
  "siret": ""
}
"""

PROMPT_LIBRE = """
Tu es un assistant expert en extraction de données de documents.
Analyse ce document et extrais toutes les informations pertinentes pour remplir
un certificat de cession de véhicule (Cerfa 15776*01).

Retourne UNIQUEMENT un JSON valide avec les champs que tu peux identifier parmi :
{
  "type_document": "",
  "immatriculation": "",
  "date_premiere_immat": "",
  "numero_vin": "",
  "marque": "",
  "type_variante_version": "",
  "denomination_commerciale": "",
  "genre_national": "",
  "numero_formule": "",
  "kilometrage": "",
  "nom_vendeur": "",
  "prenom_vendeur": "",
  "adresse_vendeur": "",
  "code_postal_vendeur": "",
  "commune_vendeur": "",
  "nom_acheteur": "",
  "prenom_acheteur": "",
  "date_naissance_acheteur": "",
  "lieu_naissance_acheteur": "",
  "adresse_acheteur": "",
  "code_postal_acheteur": "",
  "commune_acheteur": "",
  "date_cession": "",
  "heure_cession": "",
  "lieu_cession": ""
}
"""


def extract_data_from_image(image_bytes: bytes, doc_type: str = "auto") -> dict:
    """Envoie l'image au modèle IA configuré (AI_PROVIDER + AI_MODEL) et retourne les données extraites."""
    prompts = {
        "carte_grise": PROMPT_CARTE_GRISE,
        "cni": PROMPT_CNI,
        "auto": PROMPT_LIBRE,
    }
    prompt = prompts.get(doc_type, PROMPT_LIBRE)

    provider = os.environ.get("AI_PROVIDER", "gemini").lower()
    model = os.environ.get("AI_MODEL", "gemini-2.0-flash")

    if provider == "gemini":
        image = PIL.Image.open(io.BytesIO(image_bytes))
        gemini_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        response = gemini_client.models.generate_content(
            model=model,
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )
        raw = response.text

    elif provider in ("mistral", "openai"):
        import base64
        from openai import OpenAI

        api_keys = {
            "mistral": os.environ.get("MISTRAL_API_KEY", ""),
            "openai": os.environ.get("OPENAI_API_KEY", ""),
        }
        base_urls = {
            "mistral": "https://api.mistral.ai/v1",
            "openai": None,
        }
        oai_client = OpenAI(
            api_key=api_keys[provider],
            base_url=base_urls[provider],
        )
        img_b64 = base64.b64encode(image_bytes).decode()
        response = oai_client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
                    ],
                }
            ],
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content

    else:
        raise ValueError(f"Fournisseur IA inconnu : '{provider}'. Valeurs acceptées : gemini, mistral, openai")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
        return {"error": "Impossible de parser la réponse", "raw": raw}


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path: str):
    # Serve the React build; fall back to index.html for client-side routing
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    file_path = os.path.join(static_dir, path)
    if path and os.path.isfile(file_path):
        return send_file(file_path)
    return send_file(os.path.join(static_dir, "index.html"))


@app.route("/api/extract", methods=["POST"])
def extract():
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier reçu"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400

    doc_type = request.form.get("doc_type", "auto")
    image_bytes = file.read()

    try:
        data = extract_data_from_image(image_bytes, doc_type)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    cerfa_data = request.get_json()
    try:
        from cerfa_generator import generate_cerfa_pdf
        pdf_bytes = generate_cerfa_pdf(cerfa_data)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="cerfa_15776-01_rempli.pdf",
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="127.0.0.1", port=port, debug=debug)
