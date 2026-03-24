const STORAGE_KEY = 'grape_recent_searches'
const MAX_ITEMS = 10

export interface RecentSearchItem {
  id: string
  type: 'profile' | 'creator' | 'enterprise'
  username?: string
  name?: string
  avatar?: string
  verified?: boolean
  bio?: string
  /** Profil Supabase (créateur / entreprise) pour filtrage affichage */
  role?: string
}

export function getRecentSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(item: RecentSearchItem): void {
  const current = getRecentSearches().filter((s) => s.id !== item.id)
  const updated = [item, ...current].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function removeRecentSearch(id: string): void {
  const updated = getRecentSearches().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearRecentSearches(): void {
  localStorage.removeItem(STORAGE_KEY)
}
