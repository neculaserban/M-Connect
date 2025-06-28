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
      <div className="w-full max-w-3xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 pt-16 backdrop-blur-md relative z-10 mt-8 flex flex-col items-center">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-2">
            <img
              src="https://cdn-icons-gif.flaticon.com/12544/12544440.gif"
              alt="AI Assistant"
              className="w-28 h-28 object-contain rounded-full border-4 border-emerald-400 shadow-lg mb-2"
              style={{ background: 'rgba(52,211,153,0.08)' }}
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-lg">
              Meet Your Next-Gen ChatBot Sales Assistant
            </h1>
            <div className="text-neutral-200 text-base sm:text-lg text-center max-w-xl font-medium mt-2">
              <span className="inline-block bg-gradient-to-r from-emerald-400/20 to-violet-400/20 px-3 py-1 rounded-lg font-semibold text-emerald-200 mb-2">
                🚀 Coming Soon
              </span>
              <br />
              We’re building something powerful behind the scenes — an intelligent assistant to elevate your sales and project success.
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureCard
                icon="💡"
                title="Quotation Assistance"
                desc=" Generate product configurations and quotations based on specific customer needs."
              />
              <FeatureCard
                icon="📄"
                title="Tender Assistence"
                desc="Analyze tender documents and identify the manufacturer and product with the highest chance to win, formulate clarifications to adjust specs to our products, autofill tender documents with proof of compliance based on the features requested by tender authority."
              />
              <FeatureCard
                icon="🎤"
                title="Sales Pitch Builder"
                desc="Create customer-specific sales pitches based on your project's unique requirements."
              />
              <FeatureCard
                icon="🛠️"
                title="Technical Solution Design"
                desc="Develop detailed, technical solution proposals for client needs and specify deliverables and technical requirements based on the project configuration."
              />
              <FeatureCard
                icon="📊"
                title="Lead Scoring & Strategy"
                desc="Help sales managers identify project success probability and advise on tender strategy (provide risk assessment, margin proposals, resource gap analysis, sales lead scoring)."
              />
              <FeatureCard
                icon="🤖"
                title="AI Sales Coaching"
                desc="Provide real-time training and guidance to sales teams based on real-life project scenarios, up-to-date product knowledge and validated sales techniques."
              />
            </div>
          </div>
          <div className="mt-8 text-center text-neutral-400 text-sm max-w-lg">
            <span className="inline-block bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow">
              <b>Stay tuned:</b> The future of sales support is almost here.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

type FeatureCardProps = {
  icon: string
  title: string
  desc: string
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start gap-2 bg-white/10 border border-white/20 rounded-xl p-4 shadow hover:scale-[1.03] hover:border-emerald-400 transition-all duration-200 min-h-[120px]">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-emerald-200 text-base">{title}</span>
      <span className="text-neutral-200 text-sm">{desc}</span>
    </div>
  )
}
