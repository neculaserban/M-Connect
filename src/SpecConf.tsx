import React from 'react'
import { useNavigate } from 'react-router-dom'

const LOGIN_KEY = 'mconnect_logged_in_user'

export default function SpecConf() {
  const navigate = useNavigate()
  const loggedInUser = localStorage.getItem(LOGIN_KEY)

  const handleLogout = () => {
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
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center px-4 py-2 z-20 relative">
        {/* Left: Back Button */}
        <button
          className="px-4 py-2 rounded bg-emerald-500 border border-emerald-600 text-white font-semibold hover:bg-emerald-600 transition text-xs shadow"
          onClick={() => navigate('/')}
        >
          &larr; Back to Comparison Matrix
        </button>
        {/* Right: Logged in as and Logout */}
        {loggedInUser && (
          <div className="flex items-center">
            <span className="text-neutral-200 text-xs mr-2">
              Logged in as <b>{loggedInUser}</b>
            </span>
            <button
              className="text-xs px-3 py-1 rounded bg-white/10 border border-white/20 text-neutral-300 hover:bg-emerald-500 hover:text-white transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 pt-16 backdrop-blur-md relative z-10 mt-4">
        {/* M-Connect Solution Design */}
        <div className="border border-white/20 rounded-xl bg-white/5 mb-6">
          <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-extrabold text-lg px-4 py-2 rounded-t-xl tracking-tight border-b border-white/10">
            M-Connect Solution Design
          </div>
          <div className="flex flex-wrap gap-8 px-4 py-4">
            <div className="flex flex-col gap-2 min-w-[220px]">
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                CMS Server
              </label>
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                CMS All-in-One
              </label>
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                Upgrade of existing CMS
              </label>
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                Hardware delivered by Mindray
              </label>
            </div>
            <div className="flex flex-col gap-2 min-w-[220px]">
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                Number of WorkStations:
                <input type="text" className="border border-white/20 rounded px-2 py-1 w-20 bg-white/10 text-neutral-100 text-xs" />
              </label>
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                Number of ViewStations:
                <input type="text" className="border border-white/20 rounded px-2 py-1 w-20 bg-white/10 text-neutral-100 text-xs" />
              </label>
              <label className="flex items-center gap-2 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                Integrated Servers:
                <span />
              </label>
              <label className="flex items-center gap-2 ml-4 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                Integrated eGateway
              </label>
              <label className="flex items-center gap-2 ml-4 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                Integrated MobileServer
              </label>
              <label className="flex items-center gap-2 ml-4 text-neutral-200 text-sm font-medium whitespace-normal break-words">
                <input type="checkbox" className="accent-emerald-500" />
                Integrated MLDAP (LDAP 2000 users)
              </label>
            </div>
          </div>
        </div>

        {/* Clinical & Technical Configuration Options */}
        <div className="border border-white/20 rounded-xl bg-white/5">
          <div className="bg-gradient-to-r from-emerald-400/20 to-violet-400/20 text-neutral-100 font-extrabold text-lg px-4 py-2 rounded-t-xl tracking-tight border-b border-white/10">
            Clinical &amp; Technical Configuration Options
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 py-6">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {/* Type of Equipment */}
              <div className="border border-white/20 rounded-xl bg-blue-900/30 px-2">
                <div className="bg-blue-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Type of Equipment
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'Support for Mindray Pumps (Hybrid CS)',
                    'Support for Mindray Spot Check Devices',
                    'Support for Mindray Mechanical Ventilators',
                    'Support for Mindray Anesthesia Machines',
                    'Support for Mindray Ultrasound Machines',
                    'Support Video Cameras (RTSP Stream)',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Clinical Features */}
              <div className="border border-white/20 rounded-xl bg-blue-900/30 px-2">
                <div className="bg-blue-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Clinical Features
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    '24h ECG summary',
                    'AF Summary',
                    'Ventricular Arrhythmia Summary',
                    'Oxygenation Summary',
                    'Continuous NIBP analysis',
                    'History 12 ECG Glasgow Analysis',
                    'HRV Summary',
                    'Early Warning Score',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Operational */}
              <div className="border border-white/20 rounded-xl bg-blue-900/30 px-2">
                <div className="bg-blue-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Operational
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'Support CMS Viewer',
                    'HIS Sync Patient',
                    'M-IoT Data Output and RM',
                    'McAfee Solidcore - security whitelist solution',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Integrated eGateway */}
            <div className="flex flex-col gap-4">
              <div className="border border-white/20 rounded-xl bg-green-900/30 px-2">
                <div className="bg-green-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Integrated eGateway
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'ADT + Result + Doc + ALM',
                    'ADT + Result + Doc + ALM + FD',
                    'ADT + Result + Doc + ALM + Order',
                    'ADT + Result + Doc + ALM + FD + Order',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Standalone eGateway */}
              <div className="border border-white/20 rounded-xl bg-green-900/30 px-2">
                <div className="bg-green-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Standalone eGateway
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'Support ADT',
                    'Support Results',
                    'Support Alarms',
                    'Support Docs (reports) Sharing',
                    'High Resolution Waveform',
                    'Doctor Order Synchronization',
                    'History Data Forward',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Standalone MobileViewer Server & AlarmGUARD Server & WebViewer Server */}
            <div className="flex flex-col gap-4">
              {/* Standalone MobileViewer Server */}
              <div className="border border-white/20 rounded-xl bg-orange-900/30 px-2">
                <div className="bg-orange-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Standalone MobileViewer Server
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'Mobile Viewer Server - 64 beds',
                    'Mobile Viewer Server - 200 beds',
                    'Mobile Viewer Server - 600 beds',
                    'Mobile Viewer Server - 1200 beds',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Standalone AlarmGUARD Server */}
              <div className="border border-white/20 rounded-xl bg-orange-900/30 px-2">
                <div className="bg-orange-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Standalone AlarmGUARD Server
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'AlarmGUARD Server - 8 beds',
                    'AlarmGUARD Server - 16 beds',
                    'AlarmGUARD Server - 32 beds',
                    'AlarmGUARD Server - 64 beds',
                    'AlarmGUARD Server - 128 beds',
                    'AlarmGUARD Server - 400 beds',
                    'AlarmGUARD Server - 600 beds',
                    'AlarmGUARD Server - 1200 beds',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* WebViewer Server */}
              <div className="border border-white/20 rounded-xl bg-orange-900/30 px-2">
                <div className="bg-orange-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  WebViewer Server
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'Web Server - 16 clients',
                    'Web Server - 64 clients',
                    'Web Server - 128 clients',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* WorkStation, ViewStation, Special Configs */}
            <div className="flex flex-col gap-4">
              {/* WorkStation */}
              <div className="border border-white/20 rounded-xl bg-yellow-900/30 px-2">
                <div className="bg-yellow-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  WorkStation
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'WorkStation - 8 Beds',
                    'WorkStation - 16 Beds',
                    'WorkStation - 32 Beds',
                    'WorkStation - 64 Beds',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* ViewStation */}
              <div className="border border-white/20 rounded-xl bg-yellow-900/30 px-2">
                <div className="bg-yellow-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  ViewStation
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'ViewStation - 8 Beds',
                    'ViewStation - 16 Beds',
                    'ViewStation - 32 Beds',
                    'ViewStation - 64 Beds',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Special Configs */}
              <div className="border border-white/20 rounded-xl bg-yellow-900/30 px-2">
                <div className="bg-yellow-800/60 text-neutral-100 px-2 py-1 rounded-t-xl text-xs tracking-wide border-b border-white/10">
                  Special Configs
                </div>
                <div className="flex flex-col gap-1 px-1 py-2">
                  {[
                    'WorkStation Lite - 8 beds',
                    'Redundant CentralStation - Cluster',
                    'Pumps only CentralStation',
                    'CentralStation Server - 4 beds',
                    'CentralStation Server - 1 beds (for DSA)',
                  ].map(label => (
                    <label key={label} className="flex items-center gap-2 text-neutral-200 text-xs font-medium whitespace-normal break-words overflow-hidden">
                      <input type="checkbox" className="accent-emerald-500" />
                      <span className="break-words">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
