import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode,useCallback, useEffect, useState } from 'react'

import { getSession, logout,onAuthStateChange } from '@/api/auth'

import { AuthContext } from './AuthContext'

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
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

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;