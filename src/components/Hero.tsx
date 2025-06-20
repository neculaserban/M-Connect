import { Scale } from 'lucide-react'

export default function Hero() {
  return (
    <header className="relative bg-gradient-to-br from-[#1a1c3a] to-[#23264d] text-white py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-[#00ffe7]/30 to-[#3b82f6]/10 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#ff00c8]/20 to-[#00ffe7]/10 rounded-full blur-2xl opacity-60" />
      </div>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        <img
          src="/mindray-mconnect-eu-2025-logo.png"
          alt="Mindray M-Connect EU 2025 meeting"
          className="h-20 mb-6 drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 16px #00ffe7)' }}
        />
        <Scale className="w-16 h-16 mb-4 text-[#00ffe7] drop-shadow-[0_0_12px_#00ffe7]" />
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight bg-gradient-to-r from-[#00ffe7] via-white to-[#ff00c8] bg-clip-text text-transparent">
          Compare Products Instantly
        </h1>
        <p className="text-lg mb-8 max-w-2xl text-white/80">
          Discover the best products for your needs. Select <span className="font-bold text-[#00ffe7]">2–7 items</span> from our catalogue and compare their features side by side. Make smarter choices with confidence.
        </p>
        <a
          href="#catalogue"
          className="inline-block bg-gradient-to-r from-[#00ffe7] to-[#ff00c8] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition transform hover:from-[#ff00c8] hover:to-[#00ffe7] border border-white/20 backdrop-blur-md"
        >
          Browse Catalogue
        </a>
      </div>
    </header>
  )
}
