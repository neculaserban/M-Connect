import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'
import NavDropdown from './components/NavDropdown'
import LoginForm from './components/LoginForm'
import { fetchUsers, User } from './data/fetchUsers'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

const PAGES = [
  {
    key: 'specconf',
    label: 'Specification Generator',
    path: '/specconf',
    icon: '📝',
    desc: 'Generate project specs from selected features.',
  },
	{
    key: 'competitive',
    label: 'M-Connect Matrix',
    path: '/competitive',
    icon: '🖥️🖧🖥️',
    desc: 'Compare Mindray M-Connect and competitor products side by side.',
  },
  {
    key: 'vseriespm',
    label: 'V-Series PM Matrix',
    path: '/vseriespm',
    icon: '🫀🫁',
    desc: 'Compare flagship vital signs patient monitors (V-Series).',
  },
    {
    key: 'valueprop',
    label: 'Value Proposition',
    path: '/valueprop',
    icon: '🤝',
    desc: 'Explore key value propositions for Mindray solutions.',
  },
	{
    key: 'tlaivd',
    label: 'TLA IVD Matrix',
    path: '/tlaivd',
    icon: '🧪',
    desc: 'Compare TLA IVD products and features.',
  },
  {
    key: 'chatbot',
    label: 'ChatBot (soon)',
    path: '/chatbot',
    icon: '🤖',
    desc: 'AI-powered sales assistant (coming soon).',
  },
	{
    key: 'compatibility',
    label: 'Compatibility Matrix',
    path: '/comparison-matrix',
    icon: '🔗',
    desc: 'Check device, software, and revision compatibility.',
  },
]

const VISIBLE_CARDS = 5 // Odd number for symmetry

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function NavigationHub() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })
  const [users, setUsers] = useState<User[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const dragDelta = useRef(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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
  }

  const handleLogin = (username: string) => {
    setLoggedInUser(username)
    setAutoLoggedOut(false)
  }

  // Carousel navigation
  const goTo = useCallback((idx: number) => {
    setCarouselIndex(mod(idx, PAGES.length))
  }, [])

  const goLeft = useCallback(() => {
    goTo(carouselIndex - 1)
  }, [carouselIndex, goTo])

  const goRight = useCallback(() => {
    goTo(carouselIndex + 1)
  }, [carouselIndex, goTo])

  // Mouse wheel navigation (only when hovering)
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (!isHovering) return
      if (!carouselRef.current) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        if (e.deltaY > 0) goRight()
        else goLeft()
      }
    }
    window.addEventListener('wheel', handler, { passive: false })
    return () => window.removeEventListener('wheel', handler)
  }, [isHovering, goLeft, goRight])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!carouselRef.current) return
      if (document.activeElement && carouselRef.current.contains(document.activeElement as Node)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goLeft()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goRight()
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(PAGES[carouselIndex].path)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [carouselIndex, goLeft, goRight, navigate])

  // Drag/swipe navigation
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragDelta.current = 0
  }
  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || dragStartX.current === null) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragDelta.current = clientX - dragStartX.current
  }
  const onDragEnd = () => {
    setIsDragging(false)
    if (Math.abs(dragDelta.current) > 40) {
      if (dragDelta.current > 0) goLeft()
      else goRight()
    }
    dragStartX.current = null
    dragDelta.current = 0
  }

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

  // Carousel rendering
  const half = Math.floor(VISIBLE_CARDS / 2)
  const cards = []
  for (let i = -half; i <= half; i++) {
    const idx = mod(carouselIndex + i, PAGES.length)
    const page = PAGES[idx]
    const offset = i
    const isCenter = offset === 0
    const angle = offset * -35
    const scale = isCenter ? 1.15 : 0.85
    const z = isCenter ? 2 : 1
    const opacity = isCenter ? 1 : 0.55
    const blur = isCenter ? 'none' : 'blur(1.5px)'
    const shadow = isCenter
      ? '0 8px 32px 0 rgba(52,211,153,0.18), 0 2px 8px 0 rgba(168,139,250,0.12)'
      : '0 2px 8px 0 rgba(52,211,153,0.08)'
    cards.push(
      <button
        key={page.key}
        className={`carousel-card${isCenter ? ' carousel-card-center' : ''}`}
        style={{
          transform: `translateX(${offset * 60}%) scale(${scale}) rotateY(${angle}deg)`,
          zIndex: z,
          opacity,
          filter: blur,
          boxShadow: shadow,
          transition: isDragging
            ? 'none'
            : 'transform 0.45s cubic-bezier(.4,2,.6,1), opacity 0.3s, filter 0.3s, box-shadow 0.3s',
          // pointerEvents: isDragging ? 'none' : 'auto', // REMOVE this line!
        }}
        tabIndex={isCenter ? 0 : -1}
        aria-label={`Go to ${page.label}`}
        onClick={() => navigate(page.path)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(page.path)
          }
        }}
      >
        <span className="text-4xl mb-2 drop-shadow">{page.icon}</span>
        <span className="w-full break-words text-center font-bold text-neutral-100 text-base mb-2">
          {page.label}
        </span>
        <span className="text-neutral-200 font-medium text-[13px] px-3 py-2 break-words" style={{
          fontSize: '0.95rem',
          lineHeight: '1.35',
        }}>
          {page.desc}
        </span>
      </button>
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
        <NavDropdown />
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
                  🚀 Swipe, scroll or use arrows to select a Sales Tool
                </span>
                <br />
                Boost your sales — everything you need is right at your fingertips.
              </div>
              <div
                className="carousel-outer"
                ref={carouselRef}
                tabIndex={0}
                style={{
                  outline: 'none',
                  width: '100%',
                  maxWidth: 900,
                  margin: '0 auto',
                  minHeight: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  userSelect: isDragging ? 'none' : 'auto',
                  touchAction: 'pan-x',
                }}
                onMouseDown={onDragStart}
                onMouseMove={isDragging ? onDragMove : undefined}
                onMouseUp={onDragEnd}
                onMouseLeave={isDragging ? onDragEnd : undefined}
                onTouchStart={onDragStart}
                onTouchMove={isDragging ? onDragMove : undefined}
                onTouchEnd={onDragEnd}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                aria-label="Main navigation carousel"
              >
                <div className="carousel-inner" style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  height: 320,
                  perspective: 1200,
                  perspectiveOrigin: '50% 50%',
                  gap: 0,
                }}>
                  {cards}
                </div>
                {/* No carousel navigation arrows */}
              </div>
              <div className="mt-8 text-center text-neutral-400 text-sm max-w-lg">
                <span className="inline-block bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow">
                  <b>Tip:</b> Use this hub to quickly access any M-Connect Sales Tool!
                </span>
              </div>
            </div>
            <style>{`
              .carousel-outer {
                position: relative;
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                min-height: 320px;
                outline: none;
              }
              .carousel-inner {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                height: 320px;
                perspective: 1200px;
                perspective-origin: 50% 50%;
                gap: 0;
              }
              .carousel-card {
                background: linear-gradient(135deg, #34d39922 0%, #a78bfa22 100%);
                border: 1.5px solid #fff3;
                border-radius: 1.25rem;
                min-width: 220px;
                max-width: 260px;
                width: 240px;
                height: 300px;
                margin: 0 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-family: inherit;
                cursor: pointer;
                transition: box-shadow 0.3s, border 0.3s, background 0.3s;
                will-change: transform, opacity, filter;
                outline: none;
                user-select: none;
              }
              .carousel-card-center {
                background: linear-gradient(135deg, #34d39944 0%, #a78bfa44 100%);
                border: 2.5px solid #34d399cc;
                box-shadow: 0 8px 32px 0 rgba(52,211,153,0.18), 0 2px 8px 0 rgba(168,139,250,0.12);
                z-index: 2;
              }
              @media (max-width: 700px) {
                .carousel-card, .carousel-card-center {
                  min-width: 160px;
                  max-width: 180px;
                  width: 170px;
                  height: 200px;
                }
                .carousel-inner {
                  height: 200px;
                }
                .carousel-outer {
                  min-height: 200px;
                }
              }
            `}</style>
          </section>
        </div>
      </main>
    </div>
  )
}

export default NavigationHub
