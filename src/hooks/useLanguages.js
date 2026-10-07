import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useLanguages
 * Provides read access for public.languages table.
 *
 * @returns {{
 *   languages: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useLanguages() {
  const [languages, setLanguages] = useState([])
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

    async function loadLanguages() {
      try {
        const { data, error: queryError } = await supabase
          .from('languages')
          .select('id, language_name, proficiency_level, created_at')
          .order('created_at', { ascending: true })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data bahasa dari database.')
        }

        setLanguages(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data bahasa.'
          )
          setLanguages([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLanguages()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    languages,
    isLoading,
    error,
    refetch,
  }
}
