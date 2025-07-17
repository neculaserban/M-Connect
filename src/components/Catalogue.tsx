import { Product } from '../data/products'
import { CheckCircle, Circle } from 'lucide-react'
import React from 'react'

type Props = {
  onSelect: (product: Product) => void
  selected: Product[]
  products?: Product[] // Make optional for safety
}

export default function Catalogue({ onSelect, selected, products }: Props) {
  // Defensive: If products is not loaded, show loading/empty state
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="relative py-4 px-1">
        <div className="relative z-10 text-center text-neutral-300 py-8">
          <span className="text-lg">No products available.</span>
        </div>
      </section>
    )
  }

  // Toggle selection: add if not selected, remove if selected
  const handleToggle = (product: Product) => {
    onSelect(product)
  }

  // Split products into two rows: 4 in first, rest in second
  const firstRow = products.slice(0, 4)
  const secondRow = products.slice(4)

  return (
    <section className="relative py-4 px-1">
      <div className="relative z-10">
        <h2 className="text-2xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
          M-Connect Comparison Matrix
        </h2>
        <div className="text-xs text-neutral-300 text-center mb-4 font-medium tracking-wide">
          Disclaimer: Competition details are subject to change and may not reflect the most current information.
        </div>
        <div className="flex flex-col gap-3 items-center max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 backdrop-blur-md">
          {[firstRow, secondRow].map((row, rowIdx) => (
            <ul
              key={rowIdx}
              className="flex flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch w-full"
            >
              {row.map((product) => {
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
                    onClick={() => handleToggle(product)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') handleToggle(product)
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
          ))}
        </div>
        <div className="mt-3 text-center text-xs text-neutral-300 font-semibold tracking-wide">
          Select products to compare
        </div>
      </div>
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
    </section>
  )
}
