import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useProjects
 * Provides read-only data access for public.projects table.
 * Encapsulates data fetching, loading state, error handling, and refetch capabilities.
 *
 * @returns {{
 *   projects: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useProjects() {
  const [projects, setProjects] = useState([])
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

    async function loadProjects() {
      try {
        const { data, error: queryError } = await supabase
          .from('projects')
          .select(
            'id, title, slug, description, content, thumbnail_url, demo_url, github_url, tech_stack, is_featured, sort_order, created_at, updated_at'
          )
          .order('is_featured', { ascending: false })
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data projects dari database.')
        }

        setProjects(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data projects.'
          )
          setProjects([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    projects,
    isLoading,
    error,
    refetch,
  }
}
