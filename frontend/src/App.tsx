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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>
        <UploadPanel onExtracted={handleExtracted} />
        <CerfaForm data={data} highlighted={highlighted} onChange={handleChange} />
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '11.5px',
        color: '#94a3b8',
        borderTop: '1px solid rgba(37, 99, 235, 0.08)',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
        letterSpacing: '0.1px',
      }}>
        Application développée avec{' '}
        <span style={{ color: '#2563eb', fontWeight: 600 }}>Gemini Vision</span>
        {' '}· Cerfa 15776★01 © ANTS
      </footer>

      <style>{`
        @media (max-width: 900px) {
          main {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
