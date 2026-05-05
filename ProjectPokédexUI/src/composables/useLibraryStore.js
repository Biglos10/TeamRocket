import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAppState } from './useAppState.js'

// ── Card catalogue ────────────────────────────────────────────────────────────
// tag: 'owned' | 'unowned' | null (null = undiscovered)
const cards = ref([
  {
    id: 1,
    name: "Lance's Charizard V",
    setNumber: 'SWSH133',
    image: 'https://images.pokemontcg.io/swshp/SWSH133_hires.png',
    tag: 'owned',
  },
  {
    id: 2,
    name: 'Sylveon V',
    setNumber: '184/203',
    image: 'https://images.pokemontcg.io/swsh7/184_hires.png',
    tag: 'unowned',
  },
  {
    id: 3,
    name: '???',
    setNumber: null,
    image: null,
    tag: null,   // undiscovered — renders as silhouette
  },
])

// ── Scan history ──────────────────────────────────────────────────────────────
// Populated from Supabase — starts empty, loaded after login
const scans = ref([])

export function useLibraryStore() {
  const { currentUser } = useAppState()

  // ── Fetch scans for the logged-in user ──────────────────────────────────
  async function loadScans() {
    if (!currentUser.value?.id) return
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[LibraryStore] loadScans', error)
      return
    }

    scans.value = (data ?? []).map(row => ({
      id:         row.id,
      name:       row.card_id ?? 'Unknown',
      image:      row.image_url,
      tag:        row.tag,
      capturedAt: new Date(row.created_at),
    }))
  }

  // activeFilter is 'owned'|'unowned'|null in both modes.
  // In scans mode the labels read Known/Unknown but the slot values stay the same.
  function filteredCards(activeFilter) {
    if (!activeFilter) return cards.value
    return cards.value.filter(c => c.tag === activeFilter)
  }

  // 'owned' slot → known scans,  'unowned' slot → unknown scans
  function filteredScans(activeFilter) {
    if (!activeFilter) return scans.value
    const tagMap = { owned: 'known', unowned: 'unknown' }
    return scans.value.filter(s => s.tag === tagMap[activeFilter])
  }

  return { cards, scans, filteredCards, filteredScans, loadScans }
}
