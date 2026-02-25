import { supabase } from '@/lib/supabase'

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthStateChange(
  callback: (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => void,
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
