import React, { useState } from 'react'
import type { User } from '../data/fetchUsers'

type Props = {
  users: User[]
  onLogin: (username: string) => void
}

export default function LoginForm({ users, onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const user = users.find(
        u => u.username === username && u.password === password
      )
      if (user) {
        onLogin(user.username)
      } else {
        setError('Invalid username or password')
      }
      setLoading(false)
    }, 200)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xs mx-auto mt-16 bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 flex flex-col gap-4 backdrop-blur-md"
    >
      <h2 className="text-lg font-bold text-center text-neutral-100 mb-2">
        Login to Access Comparison
      </h2>
      <input
        className="px-3 py-2 rounded bg-white/20 text-neutral-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        className="px-3 py-2 rounded bg-white/20 text-neutral-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <button
        type="submit"
        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded transition"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && (
        <div className="text-red-400 text-xs text-center">{error}</div>
      )}
    </form>
  )
}
