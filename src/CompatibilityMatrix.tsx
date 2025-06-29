import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'
import NavDropdown from './components/NavDropdown'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'

// Move Devices \ CMS to first position
const NAMED_RANGES = [
  { name: 'CMSPRODUCT', display: 'Devices \\ CMS' },
  { name: 'CMSEGW', display: 'eGW \\ CMS' },
  { name: 'EGWPRODUCT', display: 'Devices \\ eGW' },
  { name: 'N1PM', display: 'N1 \\ PM' }
]

async function fetchNamedRange(namedRange: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(namedRange)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch range: ${namedRange}`)
  const data = await res.json()
  return data.values || []
}

// TBC now uses the same color as the first column (grey)
function getCellColor(value: string) {
  if (value.toLowerCase().includes('yes')) return 'bg-green-200/80 text-green-900 font-bold'
  if (value.toLowerCase().includes('tbc')) return 'bg-neutral-800 text-neutral-100 font-bold'
  if (value.toLowerCase().includes('no') || value.toLowerCase().includes('eos')) return 'bg-red-200/80 text-red-700 font-bold'
  if (value.toLowerCase().includes('sup backfilling')) return 'bg-yellow-100 text-yellow-800 font-bold'
  return 'bg-neutral-800 text-neutral-100'
}

function isSectionRow(row: string[]): boolean {
  if (!row[0]) return false
  return row.slice(1).every(cell => !cell || /^\s*$/.test(cell))
}

export default function CompatibilityMatrix() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })
  const [tables, setTables] = useState<{ name: string, display: string, data: string[][] }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

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

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all(
      NAMED_RANGES.map(async ({ name, display }) => {
        try {
          const data = await fetchNamedRange(name)
          return { name, display, data }
        } catch (e: any) {
          return { name, display, data: [], error: e.message }
        }
      })
    )
      .then(results => setTables(results))
      .catch(e => setError(e.message || 'Failed to fetch tables'))
      .finally(() => setLoading(false))
  }, [])

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
      {/* Main Content - identical paddings and widths as other unified pages */}
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <section className="relative py-4 px-1">
            <div className="relative z-10 flex flex-col items-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                Compatibility Matrix
              </h2>
              <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
                <span className="inline-block bg-gradient-to-r from-emerald-400/20 to-violet-400/20 px-3 py-1 rounded-lg font-semibold text-emerald-200 mb-2">
                  🔍 Check devices, software and revision compatibility.
                </span>
                <br />
                Instantly view compatibility between Mindray and third-party devices and systems.
              </div>
              <div className="flex flex-col gap-3 items-center max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 backdrop-blur-md">
                {/* Table selector buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {tables.map((table, idx) => (
                    <button
                      key={table.name}
                      className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition border shadow
                        ${activeTab === idx
                          ? 'bg-gradient-to-r from-emerald-400 to-violet-400 text-white border-emerald-500 scale-105 shadow-lg'
                          : 'bg-neutral-800 text-emerald-300 border-white/30 hover:bg-emerald-900 hover:text-white'}
                      `}
                      style={{
                        minWidth: 120,
                        letterSpacing: '0.03em',
                        outline: activeTab === idx ? '2px solid #a78bfa' : undefined,
                      }}
                      onClick={() => setActiveTab(idx)}
                    >
                      {table.display}
                    </button>
                  ))}
                </div>
                {loading && (
                  <div className="flex flex-col items-center gap-2 my-8">
                    <img
                      src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"
                      alt="Loading bar"
                      className="w-32 h-8 object-contain"
                      style={{ filter: 'drop-shadow(0 0 8px #34d399)' }}
                    />
                    <div className="text-neutral-400 text-sm font-semibold">Loading tables...</div>
                  </div>
                )}
                {error && (
                  <div className="text-red-400 text-center text-sm mb-2">{error}</div>
                )}
                {!loading && !error && tables[activeTab] && (
                  <div className="w-full mb-8">
                    <div className="overflow-x-auto w-full compat-matrix-scroll">
                      <table className="min-w-max border-separate border-spacing-y-1 border border-white/20 rounded-2xl shadow-2xl bg-neutral-900/80 text-[11px] sm:text-xs">
                        <thead>
                          <tr>
                            {tables[activeTab].data[0]?.map((col, idx) => (
                              <th
                                key={col + idx}
                                className={`px-2 py-2 font-extrabold text-center border-b border-white/30 uppercase
                                  ${idx === 0
                                    ? 'sticky left-0 bg-neutral-800 text-emerald-200 z-10'
                                    : 'bg-neutral-800 text-emerald-200'
                                  }`}
                                style={{
                                  minWidth: idx === 0 ? 90 : 60,
                                  maxWidth: idx === 0 ? 180 : 120,
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  letterSpacing: '0.01em',
                                  borderTopLeftRadius: idx === 0 ? '16px' : undefined,
                                  borderTopRightRadius: idx === tables[activeTab].data[0].length - 1 ? '16px' : undefined,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tables[activeTab].data.slice(1).map((row, ridx) =>
                            isSectionRow(row) ? (
                              <tr key={'section-' + ridx}>
                                <td
                                  colSpan={tables[activeTab].data[0]?.length || 1}
                                  className="bg-gradient-to-r from-emerald-400/10 via-white/10 to-violet-400/10 text-center font-extrabold uppercase px-2 py-2 text-base text-emerald-300"
                                  style={{
                                    letterSpacing: '0.04em',
                                    fontWeight: 900,
                                    fontSize: '11px'
                                  }}
                                >
                                  {row[0]}
                                </td>
                              </tr>
                            ) : (
                              <tr key={ridx} className="hover:bg-emerald-400/5 transition">
                                {row.map((val, cidx) => (
                                  <td
                                    key={cidx}
                                    className={`px-2 py-1 text-center border-r border-white/10 ${cidx === 0
                                      ? 'font-bold text-emerald-200 border-r border-white/20 bg-neutral-800 sticky left-0 z-10'
                                      : getCellColor(val)
                                    }`}
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: cidx === 0 ? 700 : 500,
                                      letterSpacing: cidx === 0 ? '0.01em' : undefined,
                                      maxWidth: 120,
                                      minWidth: 40,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <style>{`
                .compat-matrix-scroll::-webkit-scrollbar {
                  height: 8px;
                  width: 8px;
                  background: transparent;
                }
                .compat-matrix-scroll::-webkit-scrollbar-thumb {
                  background: linear-gradient(90deg, #34d399 0%, #a78bfa 100%);
                  border-radius: 8px;
                }
                .compat-matrix-scroll::-webkit-scrollbar-track {
                  background: rgba(24,24,27,0.2);
                  border-radius: 8px;
                }
                .compat-matrix-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: #34d399 #23272a;
                }
              `}</style>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
