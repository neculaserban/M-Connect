import { useEffect, useRef } from 'react'

export function useAutoLogout({
  isLoggedIn,
  onLogout,
  timeoutMs = 10* 60 * 1000,// 10 minutes
  onAutoLoggedOut,
}: {
  isLoggedIn: boolean
  onLogout: () => void
  timeoutMs?: number
  onAutoLoggedOut?: () => void
}) {
  const logoutTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return

    const resetTimer = () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      logoutTimer.current = setTimeout(() => {
        onLogout()
        if (onAutoLoggedOut) onAutoLoggedOut()
      }, timeoutMs)
    }

    // Listen to user activity
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart']
    events.forEach(event =>
      window.addEventListener(event, resetTimer, { passive: true })
    )
    resetTimer()

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      )
    }
    // eslint-disable-next-line
  }, [isLoggedIn, onLogout, timeoutMs, onAutoLoggedOut])
}
