import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10 minutes

// Google Sheets config for feature descriptions
const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
const DESC_RANGE = 'Sheet3!A1:ZZ1000' // Fetch all columns

type FeatureDesc = {
  section: string
  name: string
  descriptions: { [lang: string]: string }
}

type GroupedFeatures = {
  [section: string]: FeatureDesc[]
}

type LanguageOption = {
  key: string
  label: string
}

function useFeatureDescriptions() {
  const [grouped, setGrouped] = useState<GroupedFeatures>({})
  const [allDescs, setAllDescs] = useState<FeatureDesc[]>([])
  const [languages, setLanguages] = useState<LanguageOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDescs() {
      setLoading(true)
      setError(null)
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${DESC_RANGE}?key=${API_KEY}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch feature descriptions')
        const data = await res.json()
        const values: string[][] = data.values
        if (!values || values.length < 2) throw new Error('No data found in Sheet3')
        // Header: [Section, Feature Name, Description English, Description Romanian, ...]
        const header = values[0]
        // Find language columns (start from index 2)
        const langCols: { idx: number, key: string, label: string }[] = []
        for (let i = 2; i < header.length; ++i) {
          const col = header[i]
          // Try to extract language code from header, fallback to column name
          let key = col.match(/\(([^)]+)\)/)?.[1]?.trim().toLowerCase() || col.trim().toLowerCase()
          let label = col.replace(/^Description\s*/i, '').replace(/[\(\)]/g, '').trim()
          if (!label) label = key.toUpperCase()
          langCols.push({ idx: i, key, label })
        }
        // Build language options for selector
        const languageOptions: LanguageOption[] = langCols.map(l => ({
          key: l.key,
          label: l.label.charAt(0).toUpperCase() + l.label.slice(1)
        }))
        // Parse features
        const descs: FeatureDesc[] = []
        for (let i = 1; i < values.length; ++i) {
          const row = values[i]
          const section = row[0]?.trim() || ''
          const name = row[1]?.trim() || ''
          if (!section || !name) continue
          const descriptions: { [lang: string]: string } = {}
          for (const lang of langCols) {
            descriptions[lang.key] = row[lang.idx]?.trim() || ''
          }
          descs.push({ section, name, descriptions })
        }
        // Group by section
        const grouped: GroupedFeatures = {}
        for (const d of descs) {
          if (!grouped[d.section]) grouped[d.section] = []
          grouped[d.section].push(d)
        }
        setGrouped(grouped)
        setAllDescs(descs)
        setLanguages(languageOptions)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchDescs()
  }, [])

  return { grouped, allDescs, languages, loading, error }
}

export default function SpecConf() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })

  // Track selected features (by name)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showSpecs, setShowSpecs] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string>('en')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch grouped feature descriptions and languages
  const { grouped, allDescs, languages, loading: descLoading, error: descError } = useFeatureDescriptions()

  // Set default language to English if available
  useEffect(() => {
    if (languages.length > 0) {
      const en = languages.find(l => l.key === 'en' || l.label.toLowerCase().includes('english'))
      setSelectedLang(en?.key || languages[0].key)
    }
  }, [languages])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

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

  // Checkbox toggle
  const handleToggle = (feature: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(feature)) next.delete(feature)
      else next.add(feature)
      return next
    })
  }

  // Get selected feature descriptions
  const selectedDescs = allDescs.filter(d => selected.has(d.name))

  // Refresh handler: reset selection, close table, scroll to top
  const handleRefresh = () => {
    setSelected(new Set())
    setShowSpecs(false)
    setCopySuccess(false)
    setCopyError(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Copy as 4-column table: Caracterisitici | Da | Nu | Observatii
  const handleCopyDescriptions = async () => {
    if (!selectedDescs.length) return
    // Use tab-separated for best pasting into Excel/Word/Google Sheets
    const header = 'Caracterisitici\tDa\tNu\tObservatii'
    const rows = selectedDescs.map(d => {
      // Fallback to English if selectedLang is missing
      const desc = d.descriptions[selectedLang] || d.descriptions['en'] || ''
      return `${desc}\t\t\t`
    })
    const text = [header, ...rows].join('\n')
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // fallback for insecure context or unsupported browsers
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopySuccess(true)
      setCopyError(false)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      setCopySuccess(false)
      setCopyError(true)
      setTimeout(() => setCopyError(false), 2000)
    }
  }

  // Handle language select from dropdown and generate specs
  const handleLangAndGenerate = (lang: string) => {
    setSelectedLang(lang)
    setShowSpecs(true)
    setDropdownOpen(false)
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
        {/* Feature selection UI */}
        <div className="border border-white/20 rounded-xl bg-white/5 mb-6">
          <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-extrabold text-lg px-4 py-2 rounded-t-xl tracking-tight border-b border-white/10">
            M-Connect Specs Builder
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-6">
            {Object.entries(grouped).map(([section, features]) => (
              <div
                key={section}
                className="border border-white/20 rounded-xl bg-white/10 shadow flex flex-col mb-4"
                style={{ minWidth: 0 }}
              >
                <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-bold text-base px-4 py-2 rounded-t-xl border-b border-white/10">
                  {section}
                </div>
                <div className="flex flex-col gap-2 px-4 py-4">
                  {features.map(d => (
                    <label key={d.name} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input
                        type="checkbox"
                        className="accent-emerald-500"
                        checked={selected.has(d.name)}
                        onChange={() => handleToggle(d.name)}
                      />
                      <span className="break-words">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Specs Button with Language Dropdown */}
        <div className="flex justify-center mt-6 mb-2">
          <div className="relative" ref={dropdownRef}>
            <button
              className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow border border-emerald-700 transition disabled:opacity-60 flex items-center gap-2"
              onClick={() => setDropdownOpen(v => !v)}
              disabled={selected.size === 0 || descLoading || languages.length === 0}
              type="button"
            >
              {descLoading ? 'Loading...' : 'Generate Specs'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div
                className="absolute left-0 right-0 mt-2 z-30 rounded-xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md"
                style={{
                  minWidth: '180px',
                  fontFamily: 'inherit',
                }}
              >
                {languages.map(lang => (
                  <button
                    key={lang.key}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-emerald-100 hover:text-emerald-700 rounded transition"
                    style={{
                      fontFamily: 'inherit',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleLangAndGenerate(lang.key)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {descError && (
          <div className="text-red-400 text-center text-sm mb-2">{descError}</div>
        )}

        {/* Specs Table */}
        {showSpecs && (
          <div className="border border-white/20 rounded-xl bg-white/5 shadow-xl mt-8">
            <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-extrabold text-lg px-4 py-2 rounded-t-xl tracking-tight border-b border-white/10">
              Project Specifications Based on Selection
            </div>
            <div className="p-4">
              {selectedDescs.length === 0 ? (
                <div className="text-neutral-300 text-sm">No descriptions found for selected features.</div>
              ) : (
                <table className="min-w-full border border-white/20 rounded-xl bg-white/10 shadow-lg">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-2 text-emerald-300 text-xs font-bold">Configuration</th>
                      <th className="text-left px-4 py-2 text-emerald-300 text-xs font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDescs.map(d => (
                      <tr key={d.name} className="border-t border-white/10">
                        <td className="px-4 py-2 text-neutral-100 text-xs font-semibold">{d.name}</td>
                        <td className="px-4 py-2 text-neutral-200 text-xs">
                          {d.descriptions[selectedLang] || d.descriptions['en'] || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="px-4 py-1 rounded bg-white/10 border border-white/20 text-neutral-300 hover:bg-emerald-500 hover:text-white transition text-xs"
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
                <button
                  className="px-4 py-1 rounded bg-emerald-500 border border-emerald-700 text-white hover:bg-emerald-600 transition text-xs font-semibold"
                  onClick={handleCopyDescriptions}
                  type="button"
                >
                  Copy Descriptions
                </button>
              </div>
              {(copySuccess || copyError) && (
                <div className={`mt-3 text-center text-xs font-semibold transition-all duration-300 ${
                  copySuccess
                    ? 'text-emerald-400 bg-white/10 border border-emerald-400/30 rounded-lg py-2 px-4 shadow'
                    : 'text-red-400 bg-white/10 border border-red-400/30 rounded-lg py-2 px-4 shadow'
                }`}>
                  {copySuccess
                    ? 'Descriptions copied as a table! You can now paste them into any document.'
                    : 'Failed to copy. Please try again or check your browser permissions.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .specconf-dropdown {
          font-family: inherit;
        }
        .specconf-dropdown button:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}
