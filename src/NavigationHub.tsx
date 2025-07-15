import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'
import NavDropdown from './components/NavDropdown'
import LoginForm from './components/LoginForm'
import { fetchUsers, User } from './data/fetchUsers'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

const PAGES = [
  {
    key: 'competitive',
    label: 'Competitive Matrix',
    path: '/competitive',
    icon: '🆚',
    desc: 'Compare Mindray and competitor products side by side.',
  },
  {
    key: 'compatibility',
    label: 'Compatibility Matrix',
    path: '/comparison-matrix',
    icon: '🔗',
    desc: 'Check device, software, and revision compatibility.',
  },
  {
    key: 'specconf',
    label: 'Specification Generator',
    path: '/specconf',
    icon: '📝',
    desc: 'Generate project specs from selected features.',
  },
  {
    key: 'valueprop',
    label: 'Value Proposition',
    path: '/valueprop',
    icon: '💡',
    desc: 'Explore key value propositions for Mindray solutions.',
  },
  {
    key: 'chatbot',
    label: 'ChatBot (soon)',
    path: '/chatbot',
    icon: '🤖',
    desc: 'AI-powered sales assistant (coming soon).',
  },
]

function NavigationHub() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })
  const [users, setUsers] = useState<User[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const cardsRowRef = useRef<HTMLDivElement>(null)
  const [isHoveringCards, setIsHoveringCards] = useState(false)

  // Fetch users for login
  useEffect(() => {
    setUserLoading(true)
    setLoginError(null)
    fetchUsers()
      .then(setUsers)
      .catch(e => setLoginError(e.message))
      .finally(() => setUserLoading(false))
  }, [])

  // Persist login state to localStorage
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem(LOGIN_KEY, loggedInUser)
    } else {
      localStorage.removeItem(LOGIN_KEY)
    }
  }, [loggedInUser])

  // Auto logoff logic
  useAutoLogout({
    isLoggedIn: !!loggedInUser,
    onLogout: () => {
      setLoggedInUser(null)
      localStorage.removeItem(LOGIN_KEY)
      // Do NOT navigate, just show login form in place
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
    // Do NOT navigate, just show login form in place
  }

  const handleLogin = (username: string) => {
    setLoggedInUser(username)
    setAutoLoggedOut(false)
  }

  // Card click: navigate to page
  const handleCardClick = (path: string) => {
    navigate(path)
  }

  // Mouse wheel horizontal scroll with looping
  useEffect(() => {
    const row = cardsRowRef.current
    if (!row) return

    function onWheel(e: WheelEvent) {
      if (!isHoveringCards) return
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return // ignore horizontal wheel
      e.preventDefault()
      const scrollAmount = e.deltaY
      const maxScroll = row.scrollWidth - row.clientWidth

      // Looping logic
      if (scrollAmount > 0) {
        // Scroll right
        if (Math.abs(row.scrollLeft - maxScroll) < 2) {
          // At end, loop to start
          row.scrollLeft = 0
        } else {
          row.scrollLeft += scrollAmount
        }
      } else {
        // Scroll left
        if (row.scrollLeft <= 0) {
          // At start, loop to end
          row.scrollLeft = maxScroll
        } else {
          row.scrollLeft += scrollAmount
        }
      }
    }

    row.addEventListener('wheel', onWheel, { passive: false })
    return () => row.removeEventListener('wheel', onWheel)
  }, [isHoveringCards])

  // Show login if not logged in
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-neutral-200">
        Loading...
      </div>
    )
  }
  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden">
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
        <LoginForm users={users} onLogin={handleLogin} />
        {loginError && (
          <div className="text-red-400 text-center text-sm mt-4">{loginError}</div>
        )}
        {autoLoggedOut && (
          <div className="mb-4 text-center text-red-400 text-sm font-semibold bg-white/10 border border-red-400/30 rounded-lg py-2 px-4 shadow mt-4">
            You have been automatically logged off due to inactivity.
          </div>
        )}
      </div>
    )
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
        {/* Left: Tools Dropdown */}
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
      {/* Main Content */}
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <section className="relative py-4 px-1">
            <div className="relative z-10 flex flex-col items-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                M-Connect Sales Platform
              </h2>
              <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
                <span className="inline-block bg-gradient-to-r from-emerald-400/20 to-violet-400/20 px-3 py-1 rounded-lg font-semibold text-emerald-200 mb-2">
                  🚀 Tap a Card to Launch a Sales Tool
                </span>
                <br />
                Boost your sales — everything you need is right at your fingertips.
              </div>
              <div className="w-full flex justify-center">
                <div
                  ref={cardsRowRef}
                  className="flex flex-row gap-6 overflow-x-auto py-4 px-2 scrollbar-thin scrollbar-thumb-emerald-400/60 scrollbar-track-white/10"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#34d399 #23272a',
                  }}
                  onMouseEnter={() => setIsHoveringCards(true)}
                  onMouseLeave={() => setIsHoveringCards(false)}
                >
                  {PAGES.map(page => (
                    <div
                      key={page.key}
                      className="group perspective flex-shrink-0"
                      style={{ perspective: '1200px', minWidth: 0 }}
                    >
                      <button
                        className={`relative transition-transform duration-300 transform-style-preserve-3d cursor-pointer focus:outline-none
                          bg-gradient-to-br from-emerald-400/20 to-violet-400/20 border border-white/20 shadow-xl
                          rounded-xl flex flex-col items-center justify-center text-center
                          hover:scale-105 hover:border-emerald-400
                        `}
                        style={{
                          width: 320,
                          minWidth: 240,
                          maxWidth: 340,
                          height: 260,
                          margin: '0 0.5rem',
                          fontFamily: 'inherit',
                        }}
                        onClick={() => handleCardClick(page.path)}
                        tabIndex={0}
                        aria-label={`Go to ${page.label}`}
                      >
                        <span className="text-4xl mb-2 drop-shadow">{page.icon}</span>
                        <span className="w-full break-words text-center font-bold text-neutral-100 text-lg mb-2">
                          {page.label}
                        </span>
                        <span className="text-neutral-200 font-medium text-[13px] px-4 py-2 break-words" style={{
                          fontSize: '0.98rem',
                          lineHeight: '1.35',
                        }}>
                          {page.desc}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 text-center text-neutral-400 text-sm max-w-lg">
                <span className="inline-block bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow">
                  <b>Tip:</b> Use this hub to quickly access all M-Connect Sales Tools!
                </span>
              </div>
            </div>
            <style>{`
              .perspective {
                perspective: 1200px;
              }
              .transform-style-preserve-3d {
                transform-style: preserve-3d;
              }
              /* Custom scrollbar for horizontal row */
              .scrollbar-thin {
                scrollbar-width: thin;
              }
              .scrollbar-thumb-emerald-400\\/60::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #34d399 0%, #a78bfa 100%);
                border-radius: 8px;
              }
              .scrollbar-track-white\\/10::-webkit-scrollbar-track {
                background: rgba(24,24,27,0.15);
                border-radius: 8px;
              }
              .scrollbar-thin::-webkit-scrollbar {
                height: 8px;
                background: transparent;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #34d399 0%, #a78bfa 100%);
                border-radius: 8px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: rgba(24,24,27,0.15);
                border-radius: 8px;
              }
            `}</style>
          </section>
        </div>
      </main>
    </div>
  )
}

export default NavigationHub
