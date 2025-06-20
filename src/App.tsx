import React, { useState } from 'react'
import Catalogue from './components/Catalogue'
import Compare from './components/Compare'

type Product = {
  id: string
  name: string
  image?: string
  features: Record<string, string>
  description: string
}

function App() {
  const [selected, setSelected] = useState<Product[]>([])

  // Toggle selection: add if not selected, remove if selected
  const handleSelect = (product: Product) => {
    setSelected((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id)
      }
      if (prev.length >= 7) return prev
      return [...prev, product]
    })
  }

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id))
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
      <main className="flex-1 w-full relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <Catalogue onSelect={handleSelect} selected={selected} />
          <Compare products={selected} onRemove={handleRemove} />
        </div>
      </main>
      <footer className="py-6 text-center text-neutral-300 text-xs border-t border-white/10 bg-white/5 backdrop-blur-md font-semibold tracking-wide relative z-10">
        Notice: This app is currently in beta testing. Please do not share it or its content outside of the EU SDA team until we receive approval for go-to-market.
      </footer>
    </div>
  )
}

export default App
