import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const INITIAL_GUESTBOOK_MOCKS = [
  {
    id: 'mock-gb-1',
    name: 'Duta Fithra Qolby',
    message: 'Keren banget websitenya bang! Desain dan animasinya sangat modern dan rapi 🔥',
    avatar_color: '#38bdf8',
    is_pinned: true,
    admin_reply: 'Makasih banyak sudah mampir dan ninggalin jejak bang! 🙌 Sukses selalu.',
    admin_reply_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-gb-2',
    name: 'Priscilla Leza',
    message: 'Suka banget sama visual card dan detail portofolionya, keliatan niat banget dibuatnya!',
    avatar_color: '#34d399',
    is_pinned: false,
    admin_reply: 'Terima kasih banyak ya! Senang bisa bermanfaat ✨',
    admin_reply_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

const AVATAR_COLORS = [
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald
  '#818cf8', // Indigo
  '#f472b6', // Pink
  '#fbbf24', // Amber
  '#a78bfa', // Purple
  '#2dd4bf', // Teal
]

/**
 * Hook for managing public guestbook entries
 */
export function useGuestbook() {
  const [entries, setEntries] = useState(INITIAL_GUESTBOOK_MOCKS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadEntries() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('guestbooks')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (fetchErr) {
          // Table might not exist yet before migration is run
          console.warn('Guestbook table not available yet, using fallback data:', fetchErr.message)
          return
        }

        if (data && data.length > 0) {
          setEntries(data)
        }
      } catch (err) {
        if (!isMounted) return
        console.warn('Guestbook fetch error:', err.message)
        setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEntries()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  /**
   * Public submission of a new guestbook note
   */
  const addEntry = async ({ name, message }) => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      throw new Error('Nama dan pesan wajib diisi.')
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    const newRecord = {
      name: trimmedName,
      message: trimmedMessage,
      avatar_color: randomColor,
      is_pinned: false,
      admin_reply: null,
      admin_reply_at: null,
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error: insertErr } = await supabase
        .from('guestbooks')
        .insert([newRecord])
        .select()
        .single()

      if (insertErr) {
        console.warn('Supabase insert failed, storing optimistically in local state:', insertErr.message)
        const mockSaved = {
          ...newRecord,
          id: `local-gb-${Date.now()}`,
        }
        setEntries((prev) => [mockSaved, ...prev])
        return mockSaved
      }

      setEntries((prev) => [data, ...prev])
      return data
    } catch {
      const mockSaved = {
        ...newRecord,
        id: `local-gb-${Date.now()}`,
      }
      setEntries((prev) => [mockSaved, ...prev])
      return mockSaved
    }
  }

  /**
   * Admin reply to an entry
   */
  const replyEntry = async (id, replyText) => {
    try {
      const { data, error: updateErr } = await supabase
        .from('guestbooks')
        .update({
          admin_reply: replyText,
          admin_reply_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateErr) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  admin_reply: replyText,
                  admin_reply_at: new Date().toISOString(),
                }
              : e
          )
        )
        return
      }

      setEntries((prev) => prev.map((e) => (e.id === id ? data : e)))
      return data
    } catch {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                admin_reply: replyText,
                admin_reply_at: new Date().toISOString(),
              }
            : e
        )
      )
    }
  }

  /**
   * Admin delete an entry
   */
  const deleteEntry = async (id) => {
    try {
      const { error: delErr } = await supabase.from('guestbooks').delete().eq('id', id)
      if (delErr) {
        console.warn('Supabase delete error:', delErr.message)
      }
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return {
    entries,
    totalCount: entries.length,
    loading,
    error,
    addEntry,
    replyEntry,
    deleteEntry,
    refresh,
  }
}
