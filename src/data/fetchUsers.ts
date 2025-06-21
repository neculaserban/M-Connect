const SHEET_ID = '1dhFmdv0UnDNYY1bVnjN8O8T4IMWSPDtUqGvgaC7b65s'
const API_KEY = 'AIzaSyCwGp5jB-QIq6EcY-yDF1kYrXkhVmKy0_k'
const RANGE = 'Sheet2!A1:Z100' // Username in A, Password in B

export type User = {
  username: string
  password: string
}

export async function fetchUsers(): Promise<User[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch users')
  const data = await res.json()
  const values: string[][] = data.values
  if (!values || values.length < 2) return []
  // Assume first row is header: ["username", "password"]
  return values.slice(1).map(row => ({
    username: row[0] || '',
    password: row[1] || '',
  }))
}
