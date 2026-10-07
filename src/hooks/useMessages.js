import { useCallback, useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom Hook: useMessages
 * Provides access to public.messages table for authenticated admin.
 * Encapsulates data fetching, loading state, error handling, unread counting, and refetch capabilities.
 *
 * @returns {{
 *   messages: Array<Object>,
 *   unreadCount: number,
 *   isLoading: boolean,
 *   error: string | null,
 *   refetch: () => void
 * }}
 */
export function useMessages() {
  const [messages, setMessages] = useState([])
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

    async function loadMessages() {
      try {
        const { data, error: queryError } = await supabase
          .from('messages')
          .select('id, name, email, subject, message, is_read, created_at')
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (queryError) {
          throw new Error(queryError.message || 'Gagal memuat pesan masuk dari database.')
        }

        setMessages(data ?? [])
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan sistem saat mengambil pesan.'
          )
          setMessages([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.is_read).length,
    [messages]
  )

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    refetch,
  }
}
