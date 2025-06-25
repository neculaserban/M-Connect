import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10 minutes

// Google Sheets config for feature descriptions
const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
const DESC_RANGE = 'Sheet3!A1:B1000' // A: Feature Name, B: Description

type FeatureDesc = {
  name: string
  description: string
}

function useFeatureDescriptions() {
  const [descs, setDescs] = useState<FeatureDesc[]>([])
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
        // Assume first row is header: [Feature, Description]
        const descs: FeatureDesc[] = []
        for (let i = 1; i < values.length; ++i) {
          const [name, description] = values[i]
          if (name && description) descs.push({ name: name.trim(), description: description.trim() })
        }
        setDescs(descs)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchDescs()
  }, [])

  return { descs, loading, error }
}

// All features in the UI, grouped by section
const FEATURE_GROUPS = [
  {
    title: 'M-Connect Solution Design',
    features: [
      'CMS Server',
      'CMS WorkStation',
      'CMS ViewStation',
      'CMS All-in-One',
      'Integrated eGateway',
      'Integrated MobileServer',
      'Integrated MLDAP (LDAP 2000 users)',
      'Upgrade of existing CMS',
    ],
  },
  {
    title: 'Type of Equipment',
    features: [
      'Support for Mindray Pumps (Hybrid CS)',
      'Support for Mindray Spot Check Devices',
      'Support for Mindray Mechanical Ventilators',
      'Support for Mindray Anesthesia Machines',
      'Support for Mindray Ultrasound Machines',
      'Support Video Cameras (RTSP Stream)',
    ],
  },
  {
    title: 'Clinical Features',
    features: [
      '24h ECG summary',
      'AF Summary',
      'Ventricular Arrhythmia Summary',
      'Oxygenation Summary',
      'Continuous NIBP analysis',
      'History 12 ECG Glasgow Analysis',
      'HRV Summary',
      'Early Warning Score',
    ],
  },
  {
    title: 'Operational',
    features: [
      'Support CMS Viewer',
      'HIS Sync Patient',
      'M-IoT Data Output and RM',
      'McAfee Solidcore - security whitelist solution',
    ],
  },
  {
    title: 'Integrated eGateway',
    features: [
      'ADT + Result + Doc + ALM',
      'ADT + Result + Doc + ALM + FD',
      'ADT + Result + Doc + ALM + Order',
      'ADT + Result + Doc + ALM + FD + Order',
    ],
  },
  {
    title: 'Standalone eGateway',
    features: [
      'Support ADT',
      'Support Results',
      'Support Alarms',
      'Support Docs (reports) Sharing',
      'High Resolution Waveform',
      'Doctor Order Synchronization',
      'History Data Forward',
    ],
  },
  {
    title: 'Standalone MobileViewer Server',
    features: [
      'Mobile Viewer Server - 64 beds',
      'Mobile Viewer Server - 200 beds',
      'Mobile Viewer Server - 600 beds',
      'Mobile Viewer Server - 1200 beds',
    ],
  },
  {
    title: 'Standalone AlarmGUARD Server',
    features: [
      'AlarmGUARD Server - 8 beds',
      'AlarmGUARD Server - 16 beds',
      'AlarmGUARD Server - 32 beds',
      'AlarmGUARD Server - 64 beds',
      'AlarmGUARD Server - 128 beds',
      'AlarmGUARD Server - 400 beds',
      'AlarmGUARD Server - 600 beds',
      'AlarmGUARD Server - 1200 beds',
    ],
  },
  {
    title: 'WebViewer Server',
    features: [
      'Web Server - 16 clients',
      'Web Server - 64 clients',
      'Web Server - 128 clients',
    ],
  },
  {
    title: 'WorkStation',
    features: [
      'WorkStation - 8 Beds',
      'WorkStation - 16 Beds',
      'WorkStation - 32 Beds',
      'WorkStation - 64 Beds',
    ],
  },
  {
    title: 'ViewStation',
    features: [
      'ViewStation - 8 Beds',
      'ViewStation - 16 Beds',
      'ViewStation - 32 Beds',
      'ViewStation - 64 Beds',
    ],
  },
  {
    title: 'Special Configs',
    features: [
      'WorkStation Lite - 8 beds',
      'Redundant CentralStation - Cluster',
      'Pumps only CentralStation',
      'CentralStation Server - 4 beds',
      'CentralStation Server - 1 beds (for DSA)',
      'text test',
    ],
  },
]

export default function SpecConf() {
  const navigate = useNavigate()
  const [autoLoggedOut, setAutoLoggedOut] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_KEY)
  })

  // Track selected features
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showSpecs, setShowSpecs] = useState(false)

  // Fetch feature descriptions
  const { descs, loading: descLoading, error: descError } = useFeatureDescriptions()

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
  const selectedDescs = descs.filter(d => selected.has(d.name))

  // Refresh handler: reset selection, close table, scroll to top
  const handleRefresh = () => {
    setSelected(new Set())
    setShowSpecs(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            {FEATURE_GROUPS.map(group => (
              <div key={group.title} className="flex flex-col gap-2">
                <div className="font-bold text-emerald-300 text-xs mb-1">{group.title}</div>
                {group.features.map(label => (
                  <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                    <input
                      type="checkbox"
                      className="accent-emerald-500"
                      checked={selected.has(label)}
                      onChange={() => handleToggle(label)}
                    />
                    <span className="break-words">{label}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Specs Button */}
        <div className="flex justify-center mt-6 mb-2">
          <button
            className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow border border-emerald-700 transition disabled:opacity-60"
            onClick={() => setShowSpecs(true)}
            disabled={selected.size === 0 || descLoading}
          >
            {descLoading ? 'Loading...' : 'Generate Specs'}
          </button>
        </div>

        {/* Error */}
        {descError && (
          <div className="text-red-400 text-center text-sm mb-2">{descError}</div>
        )}

        {/* Specs Table */}
        {showSpecs && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Project Specifications Based on Selection</h2>
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
                      <td className="px-4 py-2 text-neutral-200 text-xs">{d.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-1 rounded bg-white/10 border border-white/20 text-neutral-300 hover:bg-emerald-500 hover:text-white transition text-xs"
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
