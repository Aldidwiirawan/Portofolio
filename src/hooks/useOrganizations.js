import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useOrganizations
 * Provides read access for public.organizations table.
 *
 * @returns {{
 *   organizations: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useOrganizations() {
  const [organizations, setOrganizations] = useState([])
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

    async function loadOrganizations() {
      try {
        const { data, error: queryError } = await supabase
          .from('organizations')
          .select('id, name, role, start_date, end_date, description, created_at')
          .order('start_date', { ascending: false, nullsLast: true })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data organisasi dari database.')
        }

        setOrganizations(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data organisasi.'
          )
          setOrganizations([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOrganizations()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    organizations,
    isLoading,
    error,
    refetch,
  }
}
