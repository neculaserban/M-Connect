import React, { useState, useEffect } from 'react'
import Catalogue from './components/Catalogue'
import Compare from './components/Compare'
import LoginForm from './components/LoginForm'
import { Product } from './data/products'
import { fetchProductsFromSheet, ProductsAndFeatures, FeatureRow } from './data/fetchProductsGeneric'
import { fetchUsers, User } from './data/fetchUsers'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import SpecConf from './SpecConf'
import ValueProp from './ValueProp'
import CompatibilityMatrix from './CompatibilityMatrix'
import ChatBot from './ChatBot'
import NavigationHub from './NavigationHub'
import { useAutoLogout } from './hooks/useAutoLogout'
import { Analytics } from '@vercel/analytics/react'
import NavDropdown from './components/NavDropdown'
import VSeriesPMPage from './components/vseriesPM'
import TLAIVDPage from './components/TLAIVD'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10 minutes

// Competitive Matrix page logic, now at /competitive
function CompetitiveMatrixApp() {
  const [products, setProducts] = useState<Product[]>([])
  const [featureRows, setFeatureRows] = useState<FeatureRow[]>([])
  const [selected, setSelected] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Login state
  const [users, setUsers] = useState<User[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProductsFromSheet('Sheet1')
      .then(({ products, featureRows }: ProductsAndFeatures) => {
        setProducts(products)
        setFeatureRows(featureRows)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
      setSelected([])
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

  const handleSelect = (product: Product) => {
    setSelected((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id)
      }
      // No cap: allow selecting all products
      return [...prev, product]
    })
  }

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id))
  }

  // After login, always redirect to hub (main page)
  const handleLogin = (username: string) => {
    setLoggedInUser(username)
    setAutoLoggedOut(false)
    navigate('/', { replace: true })
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setSelected([])
    // Do NOT navigate, just show login form in place
  }

  // CRITICAL: If not logged in, redirect to hub (main page) to show the login form there
  if (!loggedInUser) {
    return <Navigate to="/" replace />
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-neutral-200">
        Loading...
      </div>
    )
  }

  if (error || loginError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 text-lg">
        <div>
          <b>Error:</b> {error || loginError}
        </div>
        <div className="mt-2 text-xs text-neutral-400">
          Please check your data
        </div>
      </div>
    )
  }

  // FIX: Use the same top bar structure as ChatBot/etc for perfect alignment
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
      {/* Top bar - match all other pages */}
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
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <Catalogue
            onSelect={handleSelect}
            selected={selected}
            products={products}
          />
          <Compare products={selected} onRemove={handleRemove} featureRows={featureRows} />
        </div>
      </main>
      <footer className="py-6 text-center text-neutral-300 text-xs border-t border-white/10 bg-white/5 backdrop-blur-md font-semibold tracking-wide relative z-10">
        Notice: This app is currently in beta testing. Please do not share it or its content outside of the EU SDA team.
      </footer>
      <Analytics />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* NavigationHub is now the main page */}
        <Route path="/" element={<NavigationHub />} />
        <Route path="/competitive" element={<CompetitiveMatrixApp />} />
        <Route path="/vseriespm" element={<VSeriesPMPage />} />
        <Route path="/tlaivd" element={<TLAIVDPage />} />
        <Route path="/specconf" element={<SpecConf />} />
        <Route path="/valueprop" element={<ValueProp />} />
        <Route path="/comparison-matrix" element={<CompatibilityMatrix />} />
        <Route path="/chatbot" element={<ChatBot />} />
        {/* Redirect any unknown route to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
