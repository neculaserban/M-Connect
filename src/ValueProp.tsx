import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'
import NavDropdown from './components/NavDropdown'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000 // 10 minutes

// Google Sheets config for battle cards (Sheet4)
const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
const RANGE = 'Sheet4!A1:B1000' // A: Feature Name, B: Description

type Card = {
  name: string
  description: string
}

function useBattleCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCards() {
      setLoading(true)
      setError(null)
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch value proposition cards')
        const data = await res.json()
        const values: string[][] = data.values
        const cards: Card[] = []
        for (let i = 1; i < values.length; ++i) {
          const [name, description] = values[i]
          if (name && description) cards.push({ name: name.trim(), description: description.trim() })
        }
        setCards(cards)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchCards()
  }, [])

  return { cards, loading, error }
}

export default function ValueProp() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })

  // Auto logoff logic
  useAutoLogout({
    isLoggedIn: !!loggedInUser,
    onLogout: () => {
      setLoggedInUser(null)
      localStorage.removeItem(LOGIN_KEY)
      navigate('/')
    },
    timeoutMs: AUTO_LOGOUT_MS,
    onAutoLoggedOut: () => setAutoLoggedOut(true),
  })

  // Hide auto logoff message after a few seconds
  useEffect(() => {
    if (autoLoggedOut) {
      const t = setTimeout(() => setAutoLoggedOut(false), 4000)
      return () => clearTimeout(t)
    }
  }, [autoLoggedOut])

  const handleLogout = () => {
    setLoggedInUser(null)
    localStorage.removeItem(LOGIN_KEY)
    navigate('/')
  }

  const { cards, loading, error } = useBattleCards()
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})

  const handleFlip = (idx: number) => {
    setFlipped(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Animated GIF background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `url('https://www.mindray.com/content/dam/xpace/en/products-solutions/products/patient-monitoring/centralized-mornitoring/benevision-cms/p12-s3.gif') center center / cover no-repeat`,
          opacity: 0.18,
          filter: 'blur(2.5px) brightness(0.7) saturate(1.2)',
          willChange: 'opacity, filter',
        }}
      />
      {/* Top bar */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center px-2 sm:px-4 py-2 z-20 relative">
        {/* Left: More Dropdown */}
        <NavDropdown />
        {/* Right: Logged in as and Logout */}
        {loggedInUser && (
          <div className="flex items-center ml-2 sm:ml-0">
            <span className="text-neutral-200 text-xs mr-2 whitespace-nowrap">
              Logged in as <b>{loggedInUser}</b>
            </span>
            <button
              className="text-xs px-2 py-1 sm:px-3 sm:py-1 rounded bg-white/10 border border-white/20 text-neutral-300 hover:bg-emerald-500 hover:text-white transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      {/* Auto logoff message */}
      {autoLoggedOut && (
        <div className="mb-4 text-center text-red-400 text-sm font-semibold bg-white/10 border border-red-400/30 rounded-lg py-2 px-4 shadow">
          You have been automatically logged off due to inactivity.
        </div>
      )}
      {/* Main Content - identical paddings and widths as main page */}
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <section className="relative py-4 px-1">
            <div className="relative z-10 flex flex-col items-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                Value Proposition Battle Cards
              </h2>
              <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
                <span className="inline-block bg-gradient-to-r from-emerald-400/20 to-violet-400/20 px-3 py-1 rounded-lg font-semibold text-emerald-200 mb-2">
                  🔁 Tap a card to flip
                </span>
                <br />
                Discover the key value propositions for Mindray products and solutions.
              </div>
              <div className="flex flex-col gap-3 items-center max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 backdrop-blur-md">
                <div className="w-full mt-2">
                  {loading ? (
                    <div className="text-neutral-200 text-center text-lg">Loading...</div>
                  ) : error ? (
                    <div className="text-red-400 text-center text-sm">{error}</div>
                  ) : cards.length === 0 ? (
                    <div className="text-neutral-300 text-center text-sm">No value proposition cards found.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 justify-center">
                      {cards.map((card, idx) => (
                        <div
                          key={card.name}
                          className="group perspective flex justify-center"
                          style={{ perspective: '1200px', minWidth: 0 }}
                        >
                          <div
                            className={`relative transition-transform duration-500 transform-style-preserve-3d cursor-pointer`}
                            style={{
                              width: '420px',
                              minWidth: '340px',
                              maxWidth: '480px',
                              height: '340px',
                              margin: '0 auto',
                              transform: flipped[idx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            }}
                            onClick={() => handleFlip(idx)}
                          >
                            {/* Front */}
                            <div className="absolute w-full h-full rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 border border-white/20 shadow-xl flex flex-col items-center justify-center text-center text-neutral-100 font-bold text-lg px-4 py-2 backface-hidden break-words">
                              <span className="w-full break-words text-center">{card.name}</span>
                            </div>
                            {/* Back */}
                            <div
                              className="absolute w-full h-full rounded-xl bg-white/10 border border-white/20 shadow-xl flex flex-col items-center justify-center text-center text-neutral-200 font-medium text-[13px] px-4 py-3 backface-hidden overflow-auto break-words custom-scroll"
                              style={{
                                transform: 'rotateY(180deg)',
                                maxHeight: '100%',
                                maxWidth: '100%',
                                fontSize: '0.92rem',
                                wordBreak: 'break-word',
                                lineHeight: '1.35',
                                padding: '1.1rem',
                              }}
                            >
                              {card.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-8 text-center text-neutral-400 text-sm max-w-lg">
                  <span className="inline-block bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow">
                    <b>Tip:</b> Use these cards to sharpen your competitive edge!
                  </span>
                </div>
              </div>
            </div>
            <style>{`
              .perspective {
                perspective: 1200px;
              }
              .transform-style-preserve-3d {
                transform-style: preserve-3d;
              }
              .backface-hidden {
                backface-visibility: hidden;
              }
              .custom-scroll::-webkit-scrollbar {
                width: 8px;
                background: transparent;
              }
              .custom-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #34d399 0%, #a78bfa 100%);
                border-radius: 8px;
              }
              .custom-scroll::-webkit-scrollbar-track {
                background: rgba(24,24,27,0.15);
                border-radius: 8px;
              }
              .custom-scroll {
                scrollbar-width: thin;
                scrollbar-color: #34d399 #23272a;
              }
            `}</style>
          </section>
        </div>
      </main>
    </div>
  )
}
