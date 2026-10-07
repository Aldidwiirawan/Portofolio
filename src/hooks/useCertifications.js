import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useCertifications
 * Provides read access for public.certifications table.
 *
 * @returns {{
 *   certifications: Array<Object>,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useCertifications() {
  const [certifications, setCertifications] = useState([])
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

    async function loadCertifications() {
      try {
        const { data, error: queryError } = await supabase
          .from('certifications')
          .select('id, name, issuer, issue_date, credential_url, created_at')
          .order('issue_date', { ascending: false, nullsLast: true })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat data sertifikasi dari database.')
        }

        setCertifications(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil data sertifikasi.'
          )
          setCertifications([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCertifications()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  return {
    certifications,
    isLoading,
    error,
    refetch,
  }
}
