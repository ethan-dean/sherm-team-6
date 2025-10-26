// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<null | NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>>['data']['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // initial fetch – wait before rendering protected routing decisions
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user ?? null)
        setLoading(false)
      }
    })

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
