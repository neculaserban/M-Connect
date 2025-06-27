import { Product } from '../data/products'
import { X } from 'lucide-react'
import React, { useRef, useEffect, useState, useMemo } from 'react'
import type { FeatureRow } from '../data/fetchProducts'

type Props = {
  products: Product[]
  onRemove: (id: string) => void
  featureRows: FeatureRow[]
}

export default function Compare({ products, onRemove, featureRows }: Props) {
  const matrixRef = useRef<HTMLDivElement>(null)

  // Get all unique sections (including empty string, but filter it out for filter UI)
  const allSections = useMemo(() => {
    const set = new Set<string>()
    featureRows.forEach(row => {
      if (row.section) set.add(row.section)
    })
    return Array.from(set)
  }, [featureRows])

  // By default, all sections are selected
  const [selectedSections, setSelectedSections] = useState<string[]>(allSections)

  // If new sections appear, auto-select them
  useEffect(() => {
    setSelectedSections(prev => {
      // Add any new sections to the selection
      const newSections = allSections.filter(s => !prev.includes(s))
      if (newSections.length === 0) return prev
      return [...prev, ...newSections]
    })
  }, [allSections])

  // Filtered feature rows
  const filteredRows = featureRows.filter(row =>
    row.section && selectedSections.includes(row.section)
  )

  useEffect(() => {
    const el = matrixRef.current
    if (!el) return

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
    }
    // Prevent selection via selectstart
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
    }

    el.addEventListener('contextmenu', handleContextMenu)
    el.addEventListener('copy', handleCopy)
    el.addEventListener('selectstart', handleSelectStart)

    return () => {
      el.removeEventListener('contextmenu', handleContextMenu)
      el.removeEventListener('copy', handleCopy)
      el.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])

  if (products.length < 2) return null

  // Section filter UI
  const allSelected = selectedSections.length === allSections.length
  const handleToggleAll = () => {
    if (allSelected) setSelectedSections([])
    else setSelectedSections(allSections)
  }

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => {
      if (prev.includes(section)) {
        // Remove section
        return prev.filter(s => s !== section)
      } else {
        // Add section
        return [...prev, section]
      }
    })
  }

  // Group features by section, preserving order
  let lastSection = ''
  return (
    <section className="py-8 px-2 sm:px-4">
      <h2 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
        Compare Products
      </h2>
      {/* Section Filter */}
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-center">
        <span className="text-xs font-semibold text-neutral-300 mr-2">Filter Sections:</span>
        <button
          className={`px-2 py-1 rounded text-xs font-bold border transition
            ${allSelected
              ? 'bg-white/10 text-neutral-300 border-white/20 hover:bg-emerald-400 hover:text-white'
              : 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600'}
          `}
          onClick={handleToggleAll}
          type="button"
        >
          {allSelected ? 'Remove all' : 'Select all'}
        </button>
        {allSections.map(section => (
          <label
            key={section}
            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs font-semibold border transition
              ${selectedSections.includes(section)
                ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300'
                : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-emerald-400/10 hover:text-emerald-300'}
            `}
            style={{ userSelect: 'none' }}
          >
            <input
              type="checkbox"
              checked={selectedSections.includes(section)}
              onChange={() => handleSectionToggle(section)}
              className="accent-emerald-500"
              style={{ marginRight: 4 }}
            />
            {section}
          </label>
        ))}
      </div>
      <div
        ref={matrixRef}
        className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md compare-matrix-no-select"
        tabIndex={-1}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        aria-label="Comparison matrix (copying and selection disabled)"
      >
        <table className="min-w-full border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="text-left text-neutral-200 font-bold px-3 py-2 text-xs bg-white/10 rounded-l-xl">
                Feature
              </th>
              {products.map((p) => (
                <th key={p.id} className="text-center text-neutral-100 font-bold px-3 py-2 text-xs bg-white/10 relative">
                  <span>{p.name}</span>
                  <button
                    className="absolute top-1 right-1 text-neutral-400 hover:text-emerald-400 transition"
                    onClick={() => onRemove(p.id)}
                    aria-label={`Remove ${p.name}`}
                    tabIndex={0}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const showSection = row.section && row.section !== lastSection
              const sectionRow = showSection ? (
                <tr key={`section-${row.section}-${idx}`}>
                  <td
                    colSpan={products.length + 1}
                    className="bg-gradient-to-r from-emerald-400/10 via-white/10 to-violet-400/10 text-center text-transparent bg-clip-text font-extrabold uppercase px-3 py-3 text-base border-t border-emerald-400/30"
                    style={{
                      letterSpacing: '0.04em',
                      borderTopWidth: idx === 0 ? 0 : '1px',
                      fontWeight: 900,
                      backgroundImage: 'linear-gradient(90deg, #34d399 0%, #a78bfa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {row.section}
                  </td>
                </tr>
              ) : null
              if (showSection) lastSection = row.section
              return (
                <React.Fragment key={row.feature}>
                  {sectionRow}
                  <tr className="hover:bg-emerald-400/10 transition">
                    <td className="px-3 py-2 font-semibold text-neutral-200 text-xs bg-white/5">{row.feature}</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-3 py-2 text-center text-neutral-100 text-xs bg-white/5">
                        {p.features[row.feature] || <span className="text-neutral-500">—</span>}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .compare-matrix-no-select, .compare-matrix-no-select * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          pointer-events: auto;
        }
      `}</style>
    </section>
  )
}
