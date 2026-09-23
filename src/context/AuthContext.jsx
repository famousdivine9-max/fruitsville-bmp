import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BUSINESS_SLUG, isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { atLeast } from '../lib/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [business, setBusiness] = useState(null)
  const [settings, setSettings] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [businessLoading, setBusinessLoading] = useState(isSupabaseConfigured)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(
    isSupabaseConfigured ? null : 'Supabase environment variables are missing.',
  )

  const loadSettings = useCallback(async (businessId) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle()
    if (error) throw error
    setSettings(data)
    return data
  }, [])

  // Resolve the current business from the configured slug.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', BUSINESS_SLUG)
          .maybeSingle()
        if (error) throw error
        if (!data) throw new Error(`No business found for slug "${BUSINESS_SLUG}".`)
        if (cancelled) return
        setBusiness(data)
        await loadSettings(data.id)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setBusinessLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadSettings])

  // Track the auth session.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) {
        setProfile(null)
        setAuthLoading(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Load the signed-in user's profile (role + business).
  const userId = session?.user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setAuthLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setProfile(data)
        setAuthLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const role = profile?.role ?? 'customer'
  // A user only has staff powers over the business this site is configured for.
  const belongsToBusiness =
    role === 'super_admin' || (profile && business && profile.business_id === business.id)

  const hasRole = useCallback(
    (minRole) => Boolean(belongsToBusiness && atLeast(role, minRole)),
    [belongsToBusiness, role],
  )

  const value = useMemo(
    () => ({
      business,
      settings,
      session,
      user: session?.user ?? null,
      profile,
      role,
      hasRole,
      loading: businessLoading || authLoading,
      businessLoading,
      error,
      signIn,
      signOut,
      refreshSettings: () => business && loadSettings(business.id),
    }),
    [business, settings, session, profile, role, hasRole, businessLoading, authLoading, error, signIn, signOut, loadSettings],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
