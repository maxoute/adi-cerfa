import { useState, useCallback } from 'react'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import CerfaForm from './components/CerfaForm'
import { emptyCerfa, AI_FIELD_MAP } from './types'
import type { CerfaData } from './types'

export default function App() {
  const [data, setData] = useState<CerfaData>(emptyCerfa())
  const [highlighted, setHighlighted] = useState<Set<keyof CerfaData>>(new Set())

  const handleExtracted = useCallback((aiData: Record<string, string>) => {
    setData((prev) => {
      const next = { ...prev }
      const newHighlights = new Set<keyof CerfaData>()

      for (const [aiKey, cerfaKey] of Object.entries(AI_FIELD_MAP)) {
        const val = aiData[aiKey]
        if (val && val !== '' && !prev[cerfaKey]) {
          next[cerfaKey] = val
          newHighlights.add(cerfaKey)
        }
      }

      setHighlighted(newHighlights)
      setTimeout(() => setHighlighted(new Set()), 3000)

      return next
    })
  }, [])

  const handleChange = useCallback((field: keyof CerfaData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-[380px_1fr] gap-6 items-start max-[900px]:grid-cols-1">
        <UploadPanel onExtracted={handleExtracted} />
        <CerfaForm data={data} highlighted={highlighted} onChange={handleChange} />
      </div>
      <footer className="text-center py-5 text-xs text-gray-400">
        Application développée avec Gemini Vision · Cerfa 15776*01 © ANTS
      </footer>
    </div>
  )
}
