import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Download } from 'lucide-react'
import type { CerfaData } from '../types'
import FormField from './FormField'

interface Props {
  data: CerfaData
  highlighted: Set<keyof CerfaData>
  onChange: (field: keyof CerfaData, value: string) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#d0d8e8] pb-5 mb-5 last:border-none last:mb-0 last:pb-0">
      <div className="text-xs font-extrabold uppercase tracking-wider text-[#003189] bg-[#e8f0fe] border-l-4 border-[#003189] rounded px-3 py-1.5 mb-4">
        {title}
      </div>
      {children}
    </div>
  )
}

export default function CerfaForm({ data, highlighted, onChange }: Props) {
  const [generating, setGenerating] = useState(false)

  function field(
    label: string,
    id: keyof CerfaData,
    opts?: { code?: string; placeholder?: string; className?: string }
  ) {
    return (
      <FormField
        key={id}
        label={label}
        id={id}
        value={data[id]}
        code={opts?.code}
        placeholder={opts?.placeholder}
        highlighted={highlighted.has(id)}
        className={opts?.className}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(id, e.target.value)}
      />
    )
  }

  function selectField(label: string, id: keyof CerfaData, options: { value: string; label: string }[]) {
    return (
      <FormField
        key={id}
        label={label}
        id={id}
        value={data[id]}
        highlighted={highlighted.has(id)}
        onChange={(e) => onChange(id, e.target.value)}
        type="select"
        options={options}
      />
    )
  }

  async function generatePDF() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cerfa_15776-01_rempli.pdf'
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const err = await res.json()
        alert('Erreur : ' + err.error)
      }
    } catch (e: unknown) {
      alert('Erreur réseau : ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setGenerating(false)
    }
  }

  const SEXE_OPTIONS = [
    { value: '', label: '—' },
    { value: 'M', label: 'M — Masculin' },
    { value: 'F', label: 'F — Féminin' },
  ]

  return (
    <div className="bg-white rounded-xl shadow border border-[#d0d8e8] overflow-hidden">
      <div className="bg-[#e8f0fe] border-b-2 border-[#003189] px-5 py-3.5 font-bold text-sm text-[#003189]">
        📋 Cerfa 15776*01 — Certificat de cession
      </div>
      <div className="p-5">

        {/* VÉHICULE */}
        <Section title="🚗 Le véhicule">
          <div className="grid grid-cols-3 gap-3">
            {field('Immatriculation', 'immatriculation', { code: 'A', placeholder: 'AB-123-CD' })}
            {field('Date 1re immat.', 'date_premiere_immat', { code: 'B', placeholder: 'JJ/MM/AAAA' })}
            {field('Kilométrage', 'kilometrage', { placeholder: '85000' })}
          </div>
          <div className="mt-3">
            {field("N° d'identification VIN", 'numero_vin', { code: 'E', placeholder: '17 caractères', className: 'col-span-3' })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {field('Marque', 'marque', { code: 'D.1', placeholder: 'RENAULT...' })}
            {field('Type / Version', 'type_variante_version', { code: 'D.2' })}
            {field('Genre national', 'genre_national', { code: 'J.1', placeholder: 'VP, CTTE...' })}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {field('Dénomination commerciale', 'denomination_commerciale', { code: 'D.3' })}
            {field('N° de formule certificat', 'numero_formule', { placeholder: '2...' })}
          </div>
          <div className="mt-3">
            {field('Date du certificat', 'date_certificat', { placeholder: 'JJ/MM/AAAA' })}
          </div>
        </Section>

        {/* VENDEUR */}
        <Section title="👤 Ancien propriétaire (Vendeur)">
          <div className="grid grid-cols-2 gap-3">
            {selectField('Sexe', 'sexe_vendeur', SEXE_OPTIONS)}
            {field('N° SIRET (si société)', 'siret_vendeur', { placeholder: '14 chiffres' })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {field('Nom', 'nom_vendeur', { placeholder: 'NOM' })}
            {field("Nom d'usage", 'nom_usage_vendeur', { placeholder: '(si différent)' })}
            {field('Prénom', 'prenom_vendeur', { placeholder: 'Prénom' })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {field('N° de voie', 'numero_voie_vendeur', { placeholder: '12' })}
            {field('Type de voie', 'type_voie_vendeur', { placeholder: 'rue, avenue...' })}
            {field('Nom de la voie', 'nom_voie_vendeur', { placeholder: 'de la Paix' })}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {field('Code postal', 'code_postal_vendeur', { placeholder: '75001' })}
            {field('Commune', 'commune_vendeur', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* ACHETEUR */}
        <Section title="👤 Nouveau propriétaire (Acheteur)">
          <div className="grid grid-cols-2 gap-3">
            {selectField('Sexe', 'sexe_acheteur', SEXE_OPTIONS)}
            {field('N° SIRET (si société)', 'siret_acheteur', { placeholder: '14 chiffres' })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {field('Nom', 'nom_acheteur', { placeholder: 'NOM' })}
            {field("Nom d'usage", 'nom_usage_acheteur', { placeholder: '(si différent)' })}
            {field('Prénom', 'prenom_acheteur', { placeholder: 'Prénom' })}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {field('Date de naissance', 'date_naissance_acheteur', { placeholder: 'JJ/MM/AAAA' })}
            {field('Lieu de naissance', 'lieu_naissance_acheteur', { placeholder: 'Ville' })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {field('N° de voie', 'numero_voie_acheteur', { placeholder: '12' })}
            {field('Type de voie', 'type_voie_acheteur', { placeholder: 'rue, avenue...' })}
            {field('Nom de la voie', 'nom_voie_acheteur', { placeholder: 'de la Paix' })}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {field('Code postal', 'code_postal_acheteur', { placeholder: '75001' })}
            {field('Commune', 'commune_acheteur', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* CESSION */}
        <Section title="📅 Informations de cession">
          <div className="grid grid-cols-3 gap-3">
            {field('Date de cession', 'date_cession', { placeholder: 'JJ/MM/AAAA' })}
            {field('Heure de cession', 'heure_cession', { placeholder: '14h30' })}
            {field('Lieu de cession', 'lieu_cession', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* GENERATE PDF */}
        <button
          onClick={generatePDF}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#1a7a4a] text-white font-bold text-sm
            hover:bg-[#145d38] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {generating ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération en cours...</>
          ) : (
            <><Download size={16} /> Télécharger le Cerfa rempli (PDF)</>
          )}
        </button>

      </div>
    </div>
  )
}
