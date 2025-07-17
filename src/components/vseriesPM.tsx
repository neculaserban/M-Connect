import { Product } from '../data/products'
import { useEffect, useState } from 'react'
import { fetchProductsFromSheet, FeatureRow } from '../data/fetchProductsGeneric'
import Compare from './Compare'
import { useNavigate } from 'react-router-dom'
import NavDropdown from './NavDropdown'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { Analytics } from '@vercel/analytics/react'
import { CheckCircle, Circle } from 'lucide-react'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

export default function VSeriesPMPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [featureRows, setFeatureRows] = useState<FeatureRow[]>([])
  const [selected, setSelected] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProductsFromSheet('Sheet6')
      .then(({ products, featureRows }) => {
        setProducts(products)
        setFeatureRows(featureRows)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Auto logoff logic
  useAutoLogout({
    isLoggedIn: !!loggedInUser,
    onLogout: () => {
      setLoggedInUser(null)
      setSelected([])
      localStorage.removeItem(LOGIN_KEY)
      navigate('/', { replace: true })
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

  const handleLogout = () => {
    setLoggedInUser(null)
    setSelected([])
    localStorage.removeItem(LOGIN_KEY)
    navigate('/', { replace: true })
  }

  if (!loggedInUser) {
    navigate('/', { replace: true })
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-neutral-200">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 text-lg">
        <div>
          <b>Error:</b> {error}
        </div>
        <div className="mt-2 text-xs text-neutral-400">
          Please check your data
        </div>
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
      {autoLoggedOut && (
        <div className="mb-4 text-center text-red-400 text-sm font-semibold bg-white/10 border border-red-400/30 rounded-lg py-2 px-4 shadow">
          You have been automatically logged off due to inactivity.
        </div>
      )}
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          <section className="relative py-4 px-1">
            <h2 className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
              V-Series PM Comparison Matrix
            </h2>
            <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
              Explore and compare flagship vital signs patient monitors from main manufacturers.
            </div>
            <div className="mb-8">
              <div className="max-w-5xl mx-auto">
                {/* Removed "Select products to compare" text */}
                <div className="flex flex-col gap-3 items-center">
                  <div>
                    <ul className="flex flex-row flex-wrap gap-3 justify-center">
                      {products.map((product) => {
                        const isSelected = selected.some((p) => p.id === product.id)
                        return (
                          <li
                            key={product.id}
                            className={`
                              group
                              flex flex-col items-center justify-between
                              w-[110px] sm:w-[130px] md:w-[150px]
                              min-h-[110px] sm:min-h-[130px] md:min-h-[150px]
                              px-2 py-2 sm:px-3 sm:py-3
                              rounded-xl border-2 shadow-lg
                              cursor-pointer select-none
                              transition-all duration-300
                              bg-gradient-to-br
                              ${isSelected
                                ? 'border-emerald-400 from-emerald-400/20 to-violet-400/20 scale-105 shadow-emerald-400/30 animate-battlecard'
                                : 'border-white/20 from-white/10 to-white/5 hover:border-emerald-400 hover:from-emerald-400/10 hover:to-violet-400/10'}
                            `}
                            onClick={() => handleSelect(product)}
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleSelect(product)
                            }}
                            aria-pressed={isSelected}
                          >
                            <span className="mb-1">
                              {isSelected ? (
                                <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_6px_#34d399]" />
                              ) : (
                                <Circle className="w-6 h-6 text-neutral-400" />
                              )}
                            </span>
                            <div className="font-bold text-neutral-100 text-xs sm:text-sm text-center w-full whitespace-normal leading-tight">
                              {product.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-neutral-300 text-center w-full font-medium whitespace-normal leading-tight mt-1">
                              {product.description}
                            </div>
                            {isSelected && (
                              <span className="mt-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                Selected
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <Compare products={selected} onRemove={handleRemove} featureRows={featureRows} />
          </section>
        </div>
      </main>
      <footer className="py-6 text-center text-neutral-300 text-xs border-t border-white/10 bg-white/5 backdrop-blur-md font-semibold tracking-wide relative z-10">
        Notice: This app is currently in beta testing. Please do not share it or its content outside of the EU SDA team.
      </footer>
      <Analytics />
      <style>
        {`
        @keyframes battlecard-pop {
          0% { box-shadow: 0 0 0 0 #34d39944, 0 0 0 0 #a78bfa44; }
          60% { box-shadow: 0 0 16px 8px #34d39944, 0 0 32px 16px #a78bfa44; }
          100% { box-shadow: 0 0 0 0 #34d39900, 0 0 0 0 #a78bfa00; }
        }
        .animate-battlecard {
          animation: battlecard-pop 0.5s cubic-bezier(.4,2,.6,1) 1;
        }
        `}
      </style>
    </div>
  )
}
