import { Navigate } from 'react-router-dom'
import { useAuth } from '@/provider/AuthProvider'
import { PropsWithChildren } from 'react';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { session, loading, isGuest } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session && !isGuest) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
