import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

export default function ChatBot() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })

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
      <div className="w-full max-w-6xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 pt-16 backdrop-blur-md relative z-10 mt-4 flex flex-col items-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"
            alt="Loading bar"
            className="w-32 h-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px #a78bfa)' }}
          />
          <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center">
            Work in Progress
          </div>
          <div className="text-neutral-300 text-sm text-center max-w-md">
            🚧 The Mindray ChatBot is getting ready behind the scenes. Check back soon for smart support!
          </div>
        </div>
      </div>
    </div>
  )
}
