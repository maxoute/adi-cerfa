export type DocType = 'carte_grise' | 'cni' | 'auto'

export interface CerfaData {
  // Véhicule
  immatriculation: string
  date_premiere_immat: string
  numero_vin: string
  marque: string
  type_variante_version: string
  denomination_commerciale: string
  genre_national: string
  numero_formule: string
  date_certificat: string
  kilometrage: string
  // Vendeur
  sexe_vendeur: string
  nom_vendeur: string
  nom_usage_vendeur: string
  prenom_vendeur: string
  siret_vendeur: string
  numero_voie_vendeur: string
  type_voie_vendeur: string
  nom_voie_vendeur: string
  code_postal_vendeur: string
  commune_vendeur: string
  // Acheteur
  sexe_acheteur: string
  nom_acheteur: string
  nom_usage_acheteur: string
  prenom_acheteur: string
  siret_acheteur: string
  date_naissance_acheteur: string
  lieu_naissance_acheteur: string
  numero_voie_acheteur: string
  type_voie_acheteur: string
  nom_voie_acheteur: string
  code_postal_acheteur: string
  commune_acheteur: string
  // Cession
  date_cession: string
  heure_cession: string
  lieu_cession: string
}

export const emptyCerfa = (): CerfaData => ({
  immatriculation: '', date_premiere_immat: '', numero_vin: '', marque: '',
  type_variante_version: '', denomination_commerciale: '', genre_national: '',
  numero_formule: '', date_certificat: '', kilometrage: '',
  sexe_vendeur: '', nom_vendeur: '', nom_usage_vendeur: '', prenom_vendeur: '',
  siret_vendeur: '', numero_voie_vendeur: '', type_voie_vendeur: '',
  nom_voie_vendeur: '', code_postal_vendeur: '', commune_vendeur: '',
  sexe_acheteur: '', nom_acheteur: '', nom_usage_acheteur: '', prenom_acheteur: '',
  siret_acheteur: '', date_naissance_acheteur: '', lieu_naissance_acheteur: '',
  numero_voie_acheteur: '', type_voie_acheteur: '', nom_voie_acheteur: '',
  code_postal_acheteur: '', commune_acheteur: '',
  date_cession: '', heure_cession: '', lieu_cession: '',
})

// Mapping réponse Gemini → champs CerfaData
export const AI_FIELD_MAP: Record<string, keyof CerfaData> = {
  immatriculation: 'immatriculation',
  date_premiere_immat: 'date_premiere_immat',
  numero_vin: 'numero_vin',
  marque: 'marque',
  type_variante_version: 'type_variante_version',
  denomination_commerciale: 'denomination_commerciale',
  genre_national: 'genre_national',
  numero_formule: 'numero_formule',
  date_certificat: 'date_certificat',
  kilometrage: 'kilometrage',
  // depuis carte grise → vendeur
  nom_proprietaire: 'nom_vendeur',
  prenom_proprietaire: 'prenom_vendeur',
  code_postal: 'code_postal_vendeur',
  commune: 'commune_vendeur',
  // depuis CNI vendeur
  nom: 'nom_vendeur',
  prenom: 'prenom_vendeur',
  nom_usage: 'nom_usage_vendeur',
  sexe: 'sexe_vendeur',
  numero_voie: 'numero_voie_vendeur',
  type_voie: 'type_voie_vendeur',
  nom_voie: 'nom_voie_vendeur',
  siret: 'siret_vendeur',
  // depuis CNI acheteur
  nom_acheteur: 'nom_acheteur',
  prenom_acheteur: 'prenom_acheteur',
  nom_usage_acheteur: 'nom_usage_acheteur',
  sexe_acheteur: 'sexe_acheteur',
  date_naissance_acheteur: 'date_naissance_acheteur',
  lieu_naissance_acheteur: 'lieu_naissance_acheteur',
  numero_voie_acheteur: 'numero_voie_acheteur',
  type_voie_acheteur: 'type_voie_acheteur',
  nom_voie_acheteur: 'nom_voie_acheteur',
  code_postal_acheteur: 'code_postal_acheteur',
  commune_acheteur: 'commune_acheteur',
  // cession
  date_cession: 'date_cession',
  heure_cession: 'heure_cession',
  lieu_cession: 'lieu_cession',
}
