import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useSkills
 * Provides read access for public.skills table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @returns {{
 *   skills: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useSkills() {
  const [skills, setSkills] = useState([])
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

    async function loadSkills() {
      try {
        const { data, error: queryError } = await supabase
          .from('skills')
          .select('id, name, category, proficiency, sort_order, created_at')
          .order('category', { ascending: true })
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data skills dari database.')
        }

        setSkills(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data skills.'
          )
          setSkills([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSkills()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    skills,
    isLoading,
    error,
    refetch,
  }
}
