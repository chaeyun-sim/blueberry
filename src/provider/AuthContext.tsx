import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react';

interface AuthContextValue {
  session: Session | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
})

export const useAuth = () => {
  return useContext(AuthContext)
}
