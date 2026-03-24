import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, Scan, Car, CreditCard, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { DocType } from '../types'

interface Props {
  onExtracted: (data: Record<string, string>, count: number) => void
}

const DOC_TYPES: { id: DocType; label: string; icon: React.ReactNode }[] = [
  { id: 'carte_grise', label: 'Carte grise', icon: <Car size={16} /> },
  { id: 'cni', label: 'CNI / Passeport', icon: <CreditCard size={16} /> },
  { id: 'auto', label: 'Auto-détect', icon: <Search size={16} /> },
]

type Status = { type: 'idle' | 'loading' | 'success' | 'error'; message: string }

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(37, 99, 235, 0.12)',
  boxShadow: '0 4px 24px rgba(37, 99, 235, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

const cardHeader: React.CSSProperties = {
  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
  borderBottom: '1px solid rgba(37, 99, 235, 0.15)',
  padding: '14px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 700,
  fontSize: '13px',
  color: '#1d4ed8',
}

export default function UploadPanel({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [docType, setDocType] = useState<DocType>('carte_grise')
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' })

  function handleFile(f: File) {
    setFile(f)
    setStatus({ type: 'idle', message: '' })
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function extract() {
    if (!file) return
    setLoading(true)
    setStatus({ type: 'loading', message: 'Gemini Vision analyse votre document...' })

    const form = new FormData()
    form.append('file', file)
    form.append('doc_type', docType)

    try {
      const res = await fetch('/api/extract', { method: 'POST', body: form })
      const json = await res.json()
      if (json.success && json.data) {
        const count = Object.values(json.data).filter((v) => v && v !== '').length
        onExtracted(json.data, count)
        setStatus({ type: 'success', message: `${count} champs remplis automatiquement !` })
      } else {
        setStatus({ type: 'error', message: json.error || 'Réponse invalide' })
      }
    } catch (err: unknown) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur réseau' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Upload card */}
      <div style={card}>
        <div style={cardHeader}>
          <Upload size={14} />
          Scanner un document
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${drag ? '#2563eb' : file ? '#10b981' : '#93c5fd'}`,
              borderRadius: '12px',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: drag ? 'rgba(37, 99, 235, 0.06)' : file ? 'rgba(16, 185, 129, 0.04)' : 'rgba(219, 234, 254, 0.4)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={onInputChange} />

            {/* Animated ring when dragging */}
            {drag && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, rgba(37,99,235,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            )}

            <div style={{ fontSize: '36px', marginBottom: '8px', lineHeight: 1 }}>
              {file ? '✅' : '📄'}
            </div>
            <p style={{ fontWeight: 700, fontSize: '13px', color: file ? '#059669' : '#1d4ed8', marginBottom: '4px' }}>
              {file ? file.name : 'Déposer ou cliquer pour uploader'}
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
              Carte grise · Pièce d'identité · Photo
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>JPG, PNG, HEIC, PDF</p>
          </div>

          {/* Preview */}
          {preview && (
            <div style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <img src={preview} alt="Aperçu" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', display: 'block' }} />
            </div>
          )}

          {/* Doc type selector */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Type de document
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setDocType(dt.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: `2px solid ${docType === dt.id ? '#2563eb' : 'rgba(37,99,235,0.12)'}`,
                    background: docType === dt.id ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#fff',
                    color: docType === dt.id ? '#1d4ed8' : '#6b7280',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: docType === dt.id ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                  }}
                >
                  {dt.icon}
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extract button */}
          <button
            onClick={extract}
            disabled={!file || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              borderRadius: '12px',
              background: !file || loading
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              color: !file || loading ? '#94a3b8' : '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              border: 'none',
              cursor: !file || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: !file || loading ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.35)',
              letterSpacing: '0.1px',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Analyse en cours...
              </>
            ) : (
              <><Scan size={16} /> Analyser avec l'IA</>
            )}
          </button>

          {/* Status */}
          {status.type !== 'idle' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ...(status.type === 'loading' && { background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }),
              ...(status.type === 'success' && { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }),
              ...(status.type === 'error' && { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' }),
            }}>
              {status.type === 'loading' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
              {status.type === 'success' && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
              {status.type === 'error' && <AlertCircle size={14} style={{ flexShrink: 0 }} />}
              {status.message}
            </div>
          )}
        </div>
      </div>

      {/* Tips card */}
      <div style={card}>
        <div style={cardHeader}>
          <span>💡</span> Conseils d'utilisation
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { num: '1', text: <><strong>Carte grise</strong> → infos véhicule + vendeur</> },
            { num: '2', text: <><strong>CNI du vendeur</strong> → section vendeur complétée</> },
            { num: '3', text: <><strong>CNI de l'acheteur</strong> → section acheteur complétée</> },
            { num: '4', text: <>Vérifiez et complétez les champs manquants</> },
            { num: '5', text: <>Téléchargez le <strong>PDF officiel</strong> rempli</> },
          ].map(({ num, text }) => (
            <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{
                width: '20px', height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}>{num}</span>
              <span style={{ fontSize: '12.5px', color: '#374151', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
