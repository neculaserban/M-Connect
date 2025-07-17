import type { Product } from './products'

const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
const RANGE = 'Sheet6!A1:ZZ1000'

// Helper: Transpose a 2D array
function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex] ?? ''))
}

export type FeatureRow = {
  section: string
  feature: string
}

export type ProductsAndFeatures = {
  products: Product[]
  featureRows: FeatureRow[]
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

    // New structure: [Section, Feature, Product1, Product2, ...]
    const headerRow = values[0]
    const featureRows = values.slice(1)

    // Build featureRows: [{section, feature}]
    const featureRowObjs: FeatureRow[] = featureRows
      .map(row => ({
        section: row[0]?.trim() || '',
        feature: row[1]?.trim() || '',
      }))
      .filter(r => r.feature) // Only keep rows with a feature name

    // Transpose to get products as columns
    const transposed = transpose(values)
    // transposed[0] = ["Section", ...]
    // transposed[1] = ["Feature", ...]
    // transposed[2+] = [ProductName, ...featureValues]
    const products: Product[] = []

    for (let col = 2; col < transposed.length; ++col) {
      const colData = transposed[col]
      const name = colData[0] || `Product ${col - 1}`
      const description = ''
      const image = ''
      const features: Record<string, string> = {}
      for (let row = 1; row < colData.length; ++row) {
        const featureName = featureRows[row - 1]?.[1] || ''
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

    return { products, featureRows: featureRowObjs }
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
