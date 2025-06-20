import { Product } from '../data/products'
import { X } from 'lucide-react'

type Props = {
  products: Product[]
  onRemove: (id: string) => void
  featureKeys: string[]
}

export default function Compare({ products, onRemove, featureKeys }: Props) {
  if (products.length < 2) return null

  // Use the full featureKeys list from the sheet for rows
  return (
    <section className="py-8 px-2 sm:px-4">
      <h2 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 tracking-tight text-center drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
        Compare Products
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
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
            {featureKeys.map((key) => (
              <tr key={key} className="hover:bg-emerald-400/10 transition">
                <td className="px-3 py-2 font-semibold text-neutral-200 text-xs bg-white/5">{key}</td>
                {products.map((p) => (
                  <td key={p.id} className="px-3 py-2 text-center text-neutral-100 text-xs bg-white/5">
                    {p.features[key] || <span className="text-neutral-500">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
