import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'
import NavDropdown from './components/NavDropdown'

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
              <img
                src="https://cdn-icons-gif.flaticon.com/12544/12544440.gif"
                alt="AI Assistant"
                className="w-28 h-28 object-contain rounded-full border-4 border-emerald-400 shadow-lg mb-2"
                style={{ background: 'rgba(52,211,153,0.08)' }}
              />
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                ChatBot Sales Assistant
              </h2>
              <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
                <span className="inline-block bg-gradient-to-r from-emerald-400/20 to-violet-400/20 px-3 py-1 rounded-lg font-semibold text-emerald-200 mb-2">
                  🚀 Coming Soon
                </span>
                <br />
                We’re building something powerful behind the scenes — an intelligent assistant to elevate your sales and project success.
              </div>
              <div className="flex flex-col gap-3 items-center max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 backdrop-blur-md">
                <div className="w-full mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FeatureCard
                      icon="📄"
                      title="Tender Assistence"
                      desc="Analyze tender documents to determine the manufacturer and product best aligned with the requirements, formulate clarifications to adjust specs to our products, autofill tender documents with proof of compliance based on the features requested."
                    />
										<FeatureCard
                      icon="🛠️"
                      title="Technical Solution Design"
                      desc="Develop detailed, technical solution proposals for client needs and specify deliverables and technical requirements based on the project configuration."
                    />
                    <FeatureCard
                      icon="🎤"
                      title="Sales Pitch Builder"
                      desc="Create customer-specific sales pitches based on your project's unique requirements."
                    />
										<FeatureCard
                      icon="💡"
                      title="Quotation Assistance"
                      desc=" Generate product configurations and quotations based on specific customer needs."
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
          </section>
        </div>
      </main>
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
    <div className="flex flex-col items-center text-center gap-2 bg-white/10 border border-white/20 rounded-xl p-4 shadow hover:scale-[1.03] hover:border-emerald-400 transition-all duration-200 min-h-[120px]">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-emerald-200 text-base">{title}</span>
      <span className="text-neutral-200 text-sm">{desc}</span>
    </div>
  )
}
