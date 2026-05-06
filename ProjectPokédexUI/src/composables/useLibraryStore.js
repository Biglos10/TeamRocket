import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAppState } from './useAppState.js'

const cards = ref([])
const scans = ref([])

function cardImageUrl(setId, number) {
  if (!setId || !number) return null
  const num = String(number).split('/')[0]
  return `https://images.pokemontcg.io/${setId}/${num}_hires.png`
}

async function fetchCardinfoMap(cardIds) {
  const unique = [...new Set(cardIds.filter(Boolean))]
  if (!unique.length) return new Map()

  const { data, error } = await supabase
    .from('cardinfo')
    .select('id, card_name, number, set_id')
    .in('id', unique)

  if (error) {
    console.error('[LibraryStore] fetchCardinfoMap', error)
    return new Map()
  }
  return new Map((data ?? []).map(i => [i.id, i]))
}

export function useLibraryStore() {
  const { currentUser } = useAppState()

  async function loadLibrary() {
    if (!currentUser.value?.id) {
      cards.value = []
      return
    }

    const { data: rows, error } = await supabase
      .from('library')
      .select('id, card_id, tag, created_at')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[LibraryStore] loadLibrary', error)
      return
    }

    const infoMap = await fetchCardinfoMap((rows ?? []).map(r => r.card_id))

    cards.value = (rows ?? []).map(row => {
      const info = infoMap.get(row.card_id) ?? {}
      return {
        id:        row.id,
        cardId:    row.card_id,
        name:      info.card_name ?? row.card_id,
        setNumber: info.number ?? null,
        image:     cardImageUrl(info.set_id, info.number),
        tag:       row.tag,
      }
    })
  }

  async function loadScans() {
    if (!currentUser.value?.id) {
      scans.value = []
      return
    }

    const { data: rows, error } = await supabase
      .from('scans')
      .select('id, card_id, tag, image_url, created_at')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[LibraryStore] loadScans', error)
      return
    }

    const infoMap = await fetchCardinfoMap((rows ?? []).map(r => r.card_id))

    scans.value = (rows ?? []).map(row => {
      const info = infoMap.get(row.card_id) ?? {}
      return {
        id:         row.id,
        cardId:     row.card_id,
        name:       info.card_name ?? row.card_id ?? 'Unknown',
        image:      row.image_url,
        tag:        row.tag,
        capturedAt: new Date(row.created_at),
      }
    })
  }

  function filteredCards(activeFilter) {
    if (!activeFilter) return cards.value
    return cards.value.filter(c => c.tag === activeFilter)
  }

  // Scans use 'known'/'unknown' tags; the filter UI uses owned/unowned slots.
  function filteredScans(activeFilter) {
    if (!activeFilter) return scans.value
    const tagMap = { owned: 'known', unowned: 'unknown' }
    return scans.value.filter(s => s.tag === tagMap[activeFilter])
  }

  return { cards, scans, filteredCards, filteredScans, loadLibrary, loadScans }
}
