import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogout } from './hooks/useAutoLogout'

const LOGIN_KEY = 'mconnect_logged_in_user'
const AUTO_LOGOUT_MS = 10 * 60 * 1000

// Table data (static for now, can be made dynamic if needed)
const TABLE = {
  columns: [
    'Product',
    '07.43.00', '07.42.00', '07.39.00', '07.37.00', '07.35.00', '07.33.00', '07.32.00',
    '07.22.00', '07.11.00', '07.07.00', '06.20.00', '06.10.00'
  ],
  rows: [
    // Section: M Series
    { section: 'M Series' },
    { product: 'A5/A7/A9', values: ['Yes (ADD VER)', 'Yes (ADD VER)', 'YES', 'YES', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No'] },
    { product: 'T Series', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'iPM', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'iMEC', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'uMEC', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'VS900', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'TMS', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    // Section: N Series
    { section: 'N Series' },
    { product: 'ePM Series', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'EoS', 'EoS', 'EoS', 'EoS'] },
    { product: 'TM80 I', values: ['YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'YES IF <02.00', 'No', 'No', 'No', 'No'] },
    { product: 'TM80 II', values: ['Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'Yes IF >03.00', 'No', 'No', 'No', 'No'] },
    { product: 'VS8, VS9', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'D3/D6', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'D30/D60/DX', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'mwear', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'SV300/SV600/SV800/SV70', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'SV700/SV900', values: ['YES', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No'] },
    { product: 'TV50/TV80', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'n/e pump', values: ['YES', 'Sup Backfilling', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'I/U pump', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'TEX20', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'M9 / M8', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'TE7', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'Camrea', values: ['YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'YES', 'No', 'No', 'No', 'No'] },
    { product: 'eLink', values: ['TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC', 'TBC'] },
  ]
}

function getCellColor(value: string) {
  if (value.toLowerCase().includes('yes')) return 'bg-green-100 text-green-900'
  if (value.toLowerCase().includes('tbc')) return 'bg-red-600 text-white'
  if (value.toLowerCase().includes('no') || value.toLowerCase().includes('eos')) return 'bg-red-100 text-red-700'
  if (value.toLowerCase().includes('sup backfilling')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-white text-neutral-800'
}

export default function CompatibilityMatrix() {
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
      <div className="w-full max-w-6xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 pt-8 backdrop-blur-md relative z-10 mt-4 flex flex-col items-center overflow-x-auto">
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center mb-2">
            Compatibility Matrix
          </div>
          <div className="text-neutral-300 text-sm text-center max-w-md mb-4">
            <b>Benevision CMS II Revision Compatibility Table</b>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-max border border-white/20 rounded-xl shadow bg-white/80 text-xs sm:text-sm">
              <thead>
                <tr>
                  {TABLE.columns.map((col, idx) => (
                    <th
                      key={col}
                      className={`px-3 py-2 font-bold text-center border-b border-white/30 bg-gradient-to-r from-emerald-200/40 to-violet-200/40 text-neutral-900 ${idx === 0 ? 'sticky left-0 bg-white/90 z-10' : ''}`}
                      style={{ minWidth: idx === 0 ? 120 : 80 }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE.rows.map((row, idx) =>
                  row.section ? (
                    <tr key={row.section + idx}>
                      <td
                        colSpan={TABLE.columns.length}
                        className="bg-gradient-to-r from-emerald-400/20 via-white/40 to-violet-400/20 text-center font-extrabold uppercase px-3 py-2 text-base border-t border-emerald-400/30 text-emerald-700"
                        style={{
                          letterSpacing: '0.04em',
                          fontWeight: 900,
                        }}
                      >
                        {row.section}
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.product + idx}>
                      <td className="px-3 py-2 font-bold text-neutral-800 border-r border-white/20 bg-white sticky left-0 z-10">
                        {row.product}
                      </td>
                      {row.values.map((val, i) => (
                        <td
                          key={i}
                          className={`px-3 py-2 text-center border-r border-white/10 ${getCellColor(val)}`}
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
      </div>
    </div>
  )
}
