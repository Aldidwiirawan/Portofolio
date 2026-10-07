import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useEducations
 * Provides read access for public.educations table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @returns {{
 *   educations: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useEducations() {
  const [educations, setEducations] = useState([])
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

    async function loadEducations() {
      try {
        const { data, error: queryError } = await supabase
          .from('educations')
          .select(
            'id, institution, degree, field_of_study, start_year, end_year, is_current, description, sort_order, created_at'
          )
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('start_year', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data educations dari database.')
        }

        setEducations(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data educations.'
          )
          setEducations([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEducations()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    educations,
    isLoading,
    error,
    refetch,
  }
}
