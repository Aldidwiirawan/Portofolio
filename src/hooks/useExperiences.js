import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useExperiences
 * Provides read access for public.experiences table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @returns {{
 *   experiences: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useExperiences() {
  const [experiences, setExperiences] = useState([])
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

    async function loadExperiences() {
      try {
        const { data, error: queryError } = await supabase
          .from('experiences')
          .select(
            'id, company, role, location, start_date, end_date, is_current, description, sort_order, created_at'
          )
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('start_date', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data experiences dari database.')
        }

        setExperiences(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data experiences.'
          )
          setExperiences([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExperiences()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    experiences,
    isLoading,
    error,
    refetch,
  }
}
