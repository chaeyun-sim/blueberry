import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  isGuest: boolean
  enterGuestMode: () => void
  exitGuestMode: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  isGuest: false,
  enterGuestMode: () => {},
  exitGuestMode: () => {},
})