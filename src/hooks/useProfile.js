import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useProfile
 * Provides read access for public.profiles table.
 * Fetches the primary portfolio profile record.
 *
 * @returns {{
 *   profile: Object | null,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data profil dari database.')
        }

        setProfile(data ?? null)
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data profil.'
          )
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    profile,
    isLoading,
    error,
    refetch,
  }
}
