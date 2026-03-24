import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Download, Loader2, Car, User, UserCheck, Calendar } from 'lucide-react'
import type { CerfaData } from '../types'
import FormField from './FormField'

interface Props {
  data: CerfaData
  highlighted: Set<keyof CerfaData>
  onChange: (field: keyof CerfaData, value: string) => void
}

const SECTION_ICONS = {
  vehicle: <Car size={14} />,
  seller: <User size={14} />,
  buyer: <UserCheck size={14} />,
  cession: <Calendar size={14} />,
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(37, 99, 235, 0.08)',
      paddingBottom: '20px',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        padding: '8px 14px',
        background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
        borderLeft: '3px solid #2563eb',
        borderRadius: '0 8px 8px 0',
      }}>
        <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{
          fontSize: '11.5px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#1d4ed8',
        }}>{title}</span>
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

  const gridGap = '10px'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid rgba(37, 99, 235, 0.12)',
      boxShadow: '0 4px 24px rgba(37, 99, 235, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>

      {/* Card Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        borderBottom: '1px solid rgba(37, 99, 235, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1d4ed8' }}>
          📋 Cerfa 15776★01 — Certificat de cession
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#64748b',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(37,99,235,0.12)',
          borderRadius: '6px',
          padding: '3px 8px',
        }}>
          Formulaire officiel ANTS
        </span>
      </div>

      <div style={{ padding: '24px 20px' }}>

        {/* VÉHICULE */}
        <Section title="Le véhicule" icon={SECTION_ICONS.vehicle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap }}>
            {field('Immatriculation', 'immatriculation', { code: 'A', placeholder: 'AB-123-CD' })}
            {field('Date 1re immat.', 'date_premiere_immat', { code: 'B', placeholder: 'JJ/MM/AAAA' })}
            {field('Kilométrage', 'kilometrage', { placeholder: '85000' })}
          </div>
          <div style={{ marginTop: gridGap }}>
            {field("N° d'identification VIN", 'numero_vin', { code: 'E', placeholder: '17 caractères' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Marque', 'marque', { code: 'D.1', placeholder: 'RENAULT...' })}
            {field('Type / Version', 'type_variante_version', { code: 'D.2' })}
            {field('Genre national', 'genre_national', { code: 'J.1', placeholder: 'VP, CTTE...' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Dénomination commerciale', 'denomination_commerciale', { code: 'D.3' })}
            {field('N° de formule certificat', 'numero_formule', { placeholder: '2...' })}
          </div>
          <div style={{ marginTop: gridGap }}>
            {field('Date du certificat', 'date_certificat', { placeholder: 'JJ/MM/AAAA' })}
          </div>
        </Section>

        {/* VENDEUR */}
        <Section title="Ancien propriétaire (Vendeur)" icon={SECTION_ICONS.seller}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap }}>
            {selectField('Sexe', 'sexe_vendeur', SEXE_OPTIONS)}
            {field('N° SIRET (si société)', 'siret_vendeur', { placeholder: '14 chiffres' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Nom', 'nom_vendeur', { placeholder: 'NOM' })}
            {field("Nom d'usage", 'nom_usage_vendeur', { placeholder: '(si différent)' })}
            {field('Prénom', 'prenom_vendeur', { placeholder: 'Prénom' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('N° de voie', 'numero_voie_vendeur', { placeholder: '12' })}
            {field('Type de voie', 'type_voie_vendeur', { placeholder: 'rue, avenue...' })}
            {field('Nom de la voie', 'nom_voie_vendeur', { placeholder: 'de la Paix' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Code postal', 'code_postal_vendeur', { placeholder: '75001' })}
            {field('Commune', 'commune_vendeur', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* ACHETEUR */}
        <Section title="Nouveau propriétaire (Acheteur)" icon={SECTION_ICONS.buyer}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap }}>
            {selectField('Sexe', 'sexe_acheteur', SEXE_OPTIONS)}
            {field('N° SIRET (si société)', 'siret_acheteur', { placeholder: '14 chiffres' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Nom', 'nom_acheteur', { placeholder: 'NOM' })}
            {field("Nom d'usage", 'nom_usage_acheteur', { placeholder: '(si différent)' })}
            {field('Prénom', 'prenom_acheteur', { placeholder: 'Prénom' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Date de naissance', 'date_naissance_acheteur', { placeholder: 'JJ/MM/AAAA' })}
            {field('Lieu de naissance', 'lieu_naissance_acheteur', { placeholder: 'Ville' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('N° de voie', 'numero_voie_acheteur', { placeholder: '12' })}
            {field('Type de voie', 'type_voie_acheteur', { placeholder: 'rue, avenue...' })}
            {field('Nom de la voie', 'nom_voie_acheteur', { placeholder: 'de la Paix' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: gridGap, marginTop: gridGap }}>
            {field('Code postal', 'code_postal_acheteur', { placeholder: '75001' })}
            {field('Commune', 'commune_acheteur', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* CESSION */}
        <Section title="Informations de cession" icon={SECTION_ICONS.cession}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: gridGap }}>
            {field('Date de cession', 'date_cession', { placeholder: 'JJ/MM/AAAA' })}
            {field('Heure de cession', 'heure_cession', { placeholder: '14h30' })}
            {field('Lieu de cession', 'lieu_cession', { placeholder: 'Paris' })}
          </div>
        </Section>

        {/* GENERATE PDF */}
        <button
          onClick={generatePDF}
          disabled={generating}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: generating
              ? '#e2e8f0'
              : 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)',
            color: generating ? '#94a3b8' : '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: generating ? 'not-allowed' : 'pointer',
            boxShadow: generating ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.2s ease',
            letterSpacing: '0.1px',
            fontFamily: 'inherit',
          }}
        >
          {generating ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Génération en cours...</>
          ) : (
            <><Download size={16} /> Télécharger le Cerfa rempli (PDF)</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
