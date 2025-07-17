import type { Product } from './products'

const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'

export type FeatureRow = {
  section: string
  feature: string
}

export type ProductsAndFeatures = {
  products: Product[]
  featureRows: FeatureRow[]
}

/**
 * Fetches products and features from a given sheet name (e.g., "Sheet1", "Sheet6").
 */
export async function fetchProductsFromSheet(sheet: string): Promise<ProductsAndFeatures> {
  const RANGE = `${sheet}!A1:ZZ1000`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`

  // Helper: Transpose a 2D array
  function transpose<T>(matrix: T[][]): T[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex] ?? ''))
  }

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

    // [Section, Feature, Product1, Product2, ...]
    const featureRows = values.slice(1)
    const featureRowObjs: FeatureRow[] = featureRows
      .map(row => ({
        section: row[0]?.trim() || '',
        feature: row[1]?.trim() || '',
      }))
      .filter(r => r.feature)

    // Transpose to get products as columns
    const transposed = transpose(values)
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
    console.error('fetchProductsFromSheet error:', err)
    throw new Error(
      typeof err?.message === 'string'
        ? err.message
        : 'Unknown error fetching products'
    )
  }
}
