export default function Header() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      boxShadow: '0 4px 24px rgba(37, 99, 235, 0.35)',
      position: 'relative',
      overflow: 'hidden',
    }} className="text-white px-8 py-5 flex items-center gap-4">

      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: '-20px', right: '15%',
        width: '120px', height: '120px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '50%',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-30px', right: '35%',
        width: '80px', height: '80px',
        background: 'rgba(147, 197, 253, 0.12)',
        borderRadius: '50%',
        filter: 'blur(15px)',
        pointerEvents: 'none',
      }} />

      {/* Logo icon */}
      <div style={{
        width: '44px', height: '44px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.25)',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        fontSize: '22px',
      }}>
        🚗
      </div>

      <div>
        <div style={{
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
        }}>
          ADI <span style={{ opacity: 0.75, fontWeight: 500 }}>·</span>{' '}
          <span style={{ color: '#bfdbfe' }}>Cerfa</span>
        </div>
        <div style={{
          fontSize: '11.5px',
          opacity: 0.65,
          marginTop: '2px',
          fontWeight: 400,
          letterSpacing: '0.1px',
        }}>
          Certificat de cession 15776★01 — Remplissage automatique par IA
        </div>
      </div>

      {/* Badge Gemini */}
      <span style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: '999px',
        padding: '5px 14px',
        fontSize: '12px',
        fontWeight: 600,
        backdropFilter: 'blur(8px)',
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
      }}>
        <span style={{
          width: '7px', height: '7px',
          background: '#4ade80',
          borderRadius: '50%',
          boxShadow: '0 0 8px #4ade80',
          animation: 'pulse 2s infinite',
        }} />
        ✨ Gemini Vision
      </span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  )
}
