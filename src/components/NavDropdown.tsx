import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Update the path for Competitive Matrix to '/competitive'
const NAV_ITEMS = [
  { label: 'Competitive Matrix', path: '/competitive' },
  { label: 'Compatibility Matrix', path: '/comparison-matrix' },
  { label: 'Specification Generator', path: '/specconf' },
  { label: 'Value Proposition', path: '/valueprop' },
  { label: 'ChatBot (soon)', path: '/chatbot' },
]

export default function NavDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [open])

  // Filter out the current page from the dropdown
  const navItems = NAV_ITEMS.filter(item => item.path !== location.pathname)

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-neutral-300 font-semibold shadow hover:bg-emerald-500 hover:text-white transition text-xs"
        style={{
          fontWeight: 600,
          minHeight: '28px',
          minWidth: '80px',
          fontSize: '13px'
        }}
        onClick={() => setOpen(v => !v)}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-base" style={{ fontWeight: 900, letterSpacing: '0.04em' }}>☰</span>
        <span className="font-semibold tracking-wide">More</span>
      </button>
      {open && (
        <div
          className="absolute left-0 mt-2 z-30 min-w-[200px] rounded-xl border border-white/20 shadow-2xl backdrop-blur-md flex flex-col py-2 animate-fade-in nav-dropdown-gradient"
          style={{
            fontFamily: 'inherit',
            background: 'linear-gradient(135deg, #23272a 60%, #44454a 100%)',
          }}
        >
          {navItems.map(item => (
            <button
              key={item.path}
              className="w-full text-left px-4 py-2 text-xs font-semibold rounded transition whitespace-nowrap text-white hover:bg-emerald-500/20 hover:text-emerald-300"
              style={{ fontWeight: 600 }}
              onClick={() => { setOpen(false); navigate(item.path) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.18s cubic-bezier(.4,2,.6,1);
        }
        .nav-dropdown-gradient {
          background: linear-gradient(135deg, #23272a 60%, #44454a 100%);
        }
      `}</style>
    </div>
  )
}
