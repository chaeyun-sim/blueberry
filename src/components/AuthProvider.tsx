import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthStateChange } from '@/api/auth'

interface AuthContextValue {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setLoading(false)
    })

    const { data: { subscription } } = onAuthStateChange((s) => {
      setSession(s)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
