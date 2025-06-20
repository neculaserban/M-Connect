import type { Product } from './products'

const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
// IMPORTANT: The tab name must match exactly as in your Google Sheet (default is "Sheet1")
const RANGE = 'Sheet1!A1:ZZ1000' // Update this if your tab name is different

// Helper: Transpose a 2D array
function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex] ?? ''))
}

export type ProductsAndFeatures = {
  products: Product[]
  featureKeys: string[]
}

export async function fetchProducts(): Promise<ProductsAndFeatures> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      let errorMsg = `Failed to fetch products (HTTP ${res.status})`
      try {
        const errJson = await res.json()
        if (errJson && errJson.error && errJson.error.message) {
          errorMsg += `: ${errJson.error.message}`
        }
      } catch {}
      throw new Error(errorMsg)
    }
    const data = await res.json()
    const values: string[][] = data.values

    if (!values || values.length < 2) {
      throw new Error('No data found in Google Sheet')
    }

    // The first row is the header: ["Feature", "ProductA", "ProductB", ...]
    // The first column is the feature name, rest are product values
    const headerRow = values[0]
    const featureRows = values.slice(1)

    // Get all feature names (first column, skipping empty)
    const featureKeys = featureRows.map(row => row[0]).filter(Boolean)

    // Transpose to get products as columns
    const transposed = transpose(values)
    // transposed[0] is the header: ["Feature", ...feature names]
    // Each product column: [ProductName, ...featureValues]
    const products: Product[] = []

    for (let col = 1; col < transposed.length; ++col) {
      const colData = transposed[col]
      const name = colData[0] || `Product ${col}`
      const description = ''
      const image = ''
      const features: Record<string, string> = {}
      for (let row = 1; row < colData.length; ++row) {
        const featureName = featureRows[row - 1]?.[0] || ''
        const value = colData[row] || ''
        if (featureName) features[featureName] = value
      }
      products.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description,
        image,
        features,
      })
    }

    return { products, featureKeys }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('fetchProducts error:', err)
    throw new Error(
      typeof err?.message === 'string'
        ? err.message
        : 'Unknown error fetching products'
    )
  }
}
