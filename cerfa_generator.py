"""
Remplissage du Cerfa 15776*01 original via ses champs AcroForm.
"""

import io
import os
from pypdf import PdfReader, PdfWriter

# Template PDF officiel Cerfa 15776*01 — NE PAS SUPPRIMER (requis pour générer les PDF remplis)
CERFA_PATH = os.path.join(os.path.dirname(__file__), "cerfa_15776-01 (2).pdf")


def _map_fields(data: dict) -> dict:
    """
    Traduit le dictionnaire de données métier vers les noms de champs AcroForm
    du PDF officiel. Les deux pages (Page1 / Page2) ont les mêmes champs.
    """
    # Découpage des dates
    def _split_date(val):
        if val and "/" in val:
            parts = val.split("/")
            if len(parts) == 3:
                return parts[0], parts[1], parts[2]
        return val or "", "", ""

    j_immat, m_immat, a_immat = _split_date(data.get("date_premiere_immat", ""))
    j_cert,  m_cert,  a_cert  = _split_date(data.get("date_certificat", ""))
    j_vente, m_vente, a_vente = _split_date(data.get("date_cession", ""))
    j_nais,  m_nais,  a_nais  = _split_date(data.get("date_naissance_acheteur", ""))

    heure = data.get("heure_cession", "")
    h1, h2 = ("", "")
    if heure:
        heure_clean = heure.replace("h", ":").replace("H", ":")
        if ":" in heure_clean:
            parts = heure_clean.split(":")
            h1, h2 = parts[0], parts[1] if len(parts) > 1 else ""
        else:
            h1 = heure_clean

    nom_vendeur = " ".join(filter(None, [
        data.get("nom_vendeur", ""),
        data.get("nom_usage_vendeur", ""),
        data.get("prenom_vendeur", "")
    ]))
    nom_acheteur = " ".join(filter(None, [
        data.get("nom_acheteur", ""),
        data.get("nom_usage_acheteur", ""),
        data.get("prenom_acheteur", "")
    ]))

    # Champs identiques sur Page1 et Page2
    shared = {
        "num_Immatriculation":             data.get("immatriculation", ""),
        "num_Identification":              data.get("numero_vin", ""),
        "num_DateImmatriculationJour":     j_immat,
        "num_DateImmatriculationMois":     m_immat,
        "num_DateImmatriculationAnnée":    a_immat,
        "txt_MarqueVéhicule":              data.get("marque", ""),
        "txt_TypeVarianteVersionVéhicule": data.get("type_variante_version", ""),
        "txt_GenreNational":               data.get("genre_national", ""),
        "txt_DénominationCommerciale":     data.get("denomination_commerciale", ""),
        "num_KilométrageCompteur":         data.get("kilometrage", ""),
        "num_Formule":                     data.get("numero_formule", ""),
        "num_DateCertificatJour":          j_cert,
        "num_DateCertificatMois":          m_cert,
        "num_DateCertificatAnnée":         a_cert,
        # Vendeur
        "txt_IdentitéVendeur":             nom_vendeur,
        "Num_Siret":                       data.get("siret_vendeur", ""),
        "num_VoieAdresse":                 data.get("numero_voie_vendeur", ""),
        "txt_ExtensionAdresse":            data.get("extension_voie_vendeur", ""),
        "txt_TypeVoieAdresse":             data.get("type_voie_vendeur", ""),
        "txt_NomVoie":                     data.get("nom_voie_vendeur", ""),
        "num_CodePostalAdresse":           data.get("code_postal_vendeur", ""),
        "txt_CommuneAdresse":              data.get("commune_vendeur", ""),
        # Date/heure vente
        "num_DateVenteJour":               j_vente,
        "num_DateVenteMois":               m_vente,
        "num_DateVenteAnnée":              a_vente,
        "num_HoraireVente1":               h1,
        "num_HoraireVente2":               h2,
        # Lieu déclaration
        "txt_LieuDéclaration1":            data.get("lieu_cession", ""),
        "txt_LieuDéclaration2":            data.get("lieu_cession", ""),
        # Acheteur
        "txt_IdentitéAcheteur":            nom_acheteur,
        "num_SiretAcheteur":               data.get("siret_acheteur", ""),
        "num_DateNaissanceAcheteurJ":      j_nais,
        "num_DateNaissanceAcheteurM":      m_nais,
        "num_DateNaissanceAcheteurA":      a_nais,
        "txt_LieuNaissanceAcheteur":       data.get("lieu_naissance_acheteur", ""),
        "num_VoieAdresseAcheteur":         data.get("numero_voie_acheteur", ""),
        "txt_ExtensionAdresseAcheteur":    data.get("extension_voie_acheteur", ""),
        "txt_TypeVoieAdresseAcheteur":     data.get("type_voie_acheteur", ""),
        "txt_NomVoieAdresseAcheteur":      data.get("nom_voie_acheteur", ""),
        "num_CodePostalAdresseAcheteur":   data.get("code_postal_acheteur", ""),
        "txt_CommuneAdresseAcheteur":      data.get("commune_acheteur", ""),
    }

    # Construire le dictionnaire final avec les noms complets de champs
    result = {}
    for page in ("Page1", "Page2"):
        for field, value in shared.items():
            full_key = f"topmostSubform[0].{page}[0].{field}[0]"
            result[full_key] = value

    return result


def _force_black_text(writer: PdfWriter):
    """Force la couleur noire sur tous les champs texte AcroForm."""
    from pypdf.generic import NameObject, ByteStringObject
    import re

    if "/AcroForm" not in writer._root_object:
        return

    acroform = writer._root_object["/AcroForm"]

    def fix_field(obj):
        if hasattr(obj, "get"):
            ft = obj.get("/FT")
            if ft == "/Tx":
                da = obj.get("/DA", "")
                if isinstance(da, bytes):
                    da = da.decode("latin-1")
                # Remplace toute couleur existante par 0 g (noir)
                da_new = re.sub(r'[\d.]+ [\d.]+ [\d.]+ rg', '0 g', da)
                da_new = re.sub(r'[\d.]+ g', '0 g', da_new)
                if "0 g" not in da_new:
                    da_new = da_new.strip() + " 0 g"
                obj[NameObject("/DA")] = ByteStringObject(da_new.encode("latin-1"))

    # Parcourir tous les champs via /Fields
    fields_array = acroform.get("/Fields", [])
    queue = list(fields_array)
    while queue:
        ref = queue.pop()
        try:
            obj = ref.get_object() if hasattr(ref, "get_object") else ref
        except Exception:
            continue
        fix_field(obj)
        kids = obj.get("/Kids", [])
        queue.extend(kids)


def generate_cerfa_pdf(data: dict) -> bytes:
    """Remplit le PDF officiel Cerfa 15776*01 et retourne les bytes."""
    reader = PdfReader(CERFA_PATH)
    writer = PdfWriter()
    writer.append(reader)

    fields = _map_fields(data)
    writer.update_page_form_field_values(writer.pages[0], fields, auto_regenerate=False)
    writer.update_page_form_field_values(writer.pages[1], fields, auto_regenerate=False)

    _force_black_text(writer)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.read()
