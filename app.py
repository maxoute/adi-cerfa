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

app = Flask(__name__)
app.secret_key = os.environ["SECRET_KEY"]

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
client = genai.Client(api_key=GEMINI_API_KEY)

# ─────────────────────────────────────────────
# Prompts Gemini
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
    """Envoie l'image à Gemini et retourne les données extraites."""
    prompts = {
        "carte_grise": PROMPT_CARTE_GRISE,
        "cni": PROMPT_CNI,
        "auto": PROMPT_LIBRE,
    }
    prompt = prompts.get(doc_type, PROMPT_LIBRE)
    image = PIL.Image.open(io.BytesIO(image_bytes))

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt, image],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
        return {"error": "Impossible de parser la réponse", "raw": text}


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/")
def index():
    with open(os.path.join(os.path.dirname(__file__), "templates", "index.html"), encoding="utf-8") as f:
        return f.read()


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
