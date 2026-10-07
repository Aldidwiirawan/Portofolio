/**
 * Utility functions for Supabase Storage operations
 */

/**
 * Extracts relative storage path (e.g. 'projects/uuid.webp') from a Supabase public URL
 * @param {string|null|undefined} url
 * @returns {string | null}
 */
export function extractStoragePath(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const marker = '/portfolio-assets/'
    const index = url.indexOf(marker)
    if (index !== -1) {
      const pathWithQuery = url.substring(index + marker.length)
      const cleanPath = pathWithQuery.split('?')[0].split('#')[0]
      if (cleanPath.startsWith('projects/')) {
        return cleanPath
      }
    }
  } catch {
    return null
  }
  return null
}
