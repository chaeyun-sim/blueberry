import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthStateChange, logout } from '@/api/auth'
import { useQueryClient } from '@tanstack/react-query'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  isGuest: boolean
  enterGuestMode: () => void
  exitGuestMode: () => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  isGuest: false,
  enterGuestMode: () => {},
  exitGuestMode: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem('guest_mode') === 'true')
  const queryClient = useQueryClient()

  useEffect(() => {
    getSession()
      .then((s) => setSession(s))
      .finally(() => setLoading(false))

    const { data: { subscription } } = onAuthStateChange((s) => {
      setSession(s)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const enterGuestMode = useCallback(() => {
    sessionStorage.setItem('guest_mode', 'true')
    setIsGuest(true)
    queryClient.clear()
  }, [queryClient])

  const exitGuestMode = useCallback(async () => {
    sessionStorage.removeItem('guest_mode')
    setIsGuest(false)
    queryClient.clear()
    await logout().catch(() => {})
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ session, loading, isGuest, enterGuestMode, exitGuestMode }}>
      {children}
    </AuthContext.Provider>
  )
}
