import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, Scan, Car, CreditCard, Search } from 'lucide-react'
import type { DocType } from '../types'

interface Props {
  onExtracted: (data: Record<string, string>, count: number) => void
}

const DOC_TYPES: { id: DocType; label: string; icon: React.ReactNode }[] = [
  { id: 'carte_grise', label: 'Carte grise', icon: <Car size={18} /> },
  { id: 'cni', label: 'CNI / Passeport', icon: <CreditCard size={18} /> },
  { id: 'auto', label: 'Auto-détect', icon: <Search size={18} /> },
]

type Status = { type: 'idle' | 'loading' | 'success' | 'error'; message: string }

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

  const statusColors = {
    idle: '',
    loading: 'bg-yellow-50 border border-yellow-300 text-yellow-800',
    success: 'bg-green-50 border border-green-300 text-green-800',
    error: 'bg-red-50 border border-red-300 text-red-800',
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload card */}
      <div className="bg-white rounded-xl shadow border border-[#d0d8e8] overflow-hidden">
        <div className="bg-[#e8f0fe] border-b-2 border-[#003189] px-5 py-3.5 flex items-center gap-2 font-bold text-sm text-[#003189]">
          <Upload size={15} /> Scanner un document
        </div>
        <div className="p-5 flex flex-col gap-4">

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all
              ${drag ? 'border-[#003189] bg-[#d4e2f8]' : 'border-[#4a7adb] bg-[#e8f0fe] hover:bg-[#d4e2f8]'}`}
          >
            <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onInputChange} />
            <div className="text-4xl mb-2">📄</div>
            <p className="font-semibold text-[#003189]">
              {file ? file.name : 'Déposer ou cliquer pour uploader'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Carte grise · Pièce d'identité · Photo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC, PDF</p>
          </div>

          {/* Preview */}
          {preview && (
            <img src={preview} alt="Aperçu" className="w-full rounded-lg border border-[#d0d8e8] max-h-48 object-contain" />
          )}

          {/* Doc type selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">Type de document :</p>
            <div className="flex gap-2">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setDocType(dt.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-semibold transition-all
                    ${docType === dt.id
                      ? 'border-[#003189] bg-[#e8f0fe] text-[#003189]'
                      : 'border-[#d0d8e8] bg-white text-gray-500 hover:border-[#4a7adb]'}`}
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#003189] text-white font-bold text-sm
              hover:bg-[#00236b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <><Scan size={16} /> Analyser avec l'IA</>
            )}
          </button>

          {/* Status */}
          {status.type !== 'idle' && (
            <div className={`px-4 py-2.5 rounded-lg text-xs font-semibold ${statusColors[status.type]}`}>
              {status.type === 'loading' && '⏳ '}{status.type === 'success' && '✅ '}{status.type === 'error' && '❌ '}
              {status.message}
            </div>
          )}
        </div>
      </div>

      {/* Tips card */}
      <div className="bg-white rounded-xl shadow border border-[#d0d8e8] overflow-hidden">
        <div className="bg-[#e8f0fe] border-b-2 border-[#003189] px-5 py-3.5 flex items-center gap-2 font-bold text-sm text-[#003189]">
          💡 Conseils
        </div>
        <div className="p-5 text-xs text-gray-600 space-y-1.5 leading-relaxed">
          <p>1️⃣ Uploadez la <strong>carte grise</strong> → infos véhicule + vendeur</p>
          <p>2️⃣ Uploadez la <strong>CNI du vendeur</strong> → section vendeur complétée</p>
          <p>3️⃣ Uploadez la <strong>CNI de l'acheteur</strong> → section acheteur complétée</p>
          <p>4️⃣ Vérifiez et complétez les champs manquants</p>
          <p>5️⃣ Téléchargez le <strong>PDF officiel</strong> rempli</p>
        </div>
      </div>
    </div>
  )
}
