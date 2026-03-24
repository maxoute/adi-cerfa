export default function Header() {
  return (
    <header className="bg-[#003189] text-white px-8 py-5 flex items-center gap-4">
      <div>
        <div className="text-2xl font-extrabold tracking-tight">ADI Cerfa</div>
        <div className="text-xs opacity-75 mt-0.5">
          Cerfa 15776*01 — Certificat de cession — Remplissage automatique par IA
        </div>
      </div>
      <span className="ml-auto bg-white/15 border border-white/30 rounded-full px-3 py-1 text-xs font-semibold">
        ✨ Gemini Vision
      </span>
    </header>
  )
}
