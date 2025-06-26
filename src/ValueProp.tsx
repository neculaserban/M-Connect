import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'

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
    <div className="min-h-screen flex flex-col items-center py-8 relative overflow-x-hidden">
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
        {/* Left: Back Button */}
        <button
          className="px-2 py-1 sm:px-4 sm:py-2 rounded bg-emerald-500 border border-emerald-600 text-white font-semibold hover:bg-emerald-600 transition text-xs shadow
            whitespace-nowrap
            min-w-[36px] sm:min-w-[120px]
            text-[13px] sm:text-xs
            "
          style={{
            fontSize: '13px',
            minWidth: '36px',
            maxWidth: '90vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onClick={() => navigate('/')}
        >
          <span className="hidden sm:inline">&larr; Back to Competitive Matrix</span>
          <span className="inline sm:hidden">&larr; Back</span>
        </button>
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

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 pt-16 backdrop-blur-md relative z-10 mt-4">
        <div className="border border-white/20 rounded-xl bg-white/5 mb-6">
          <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-extrabold text-lg px-4 py-2 rounded-t-xl tracking-tight border-b border-white/10">
            Value Proposition Battle Cards
          </div>
          <div className="flex flex-wrap gap-6 justify-center p-6">
            {loading ? (
              <div className="text-neutral-200 text-center text-lg">Loading...</div>
            ) : error ? (
              <div className="text-red-400 text-center text-sm">{error}</div>
            ) : cards.length === 0 ? (
              <div className="text-neutral-300 text-center text-sm">No value proposition cards found.</div>
            ) : (
              cards.map((card, idx) => (
                <div
                  key={card.name}
                  className="group perspective w-64 h-40"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer`}
                    style={{
                      transform: flipped[idx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                    onClick={() => handleFlip(idx)}
                  >
                    {/* Front */}
                    <div className="absolute w-full h-full rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 border border-white/20 shadow-xl flex items-center justify-center text-center text-neutral-100 font-bold text-lg px-4 py-2 backface-hidden">
                      {card.name}
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full rounded-xl bg-white/10 border border-white/20 shadow-xl flex items-center justify-center text-center text-neutral-200 font-medium text-base px-4 py-2 backface-hidden"
                      style={{ transform: 'rotateY(180deg)' }}>
                      {card.description}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
