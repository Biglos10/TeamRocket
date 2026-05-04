import { supabase } from '../lib/supabase.js'
import { useAppState } from './useAppState.js'

const API_URL = import.meta.env.VITE_API_URL

// Normalise a value that may be a string, comma-separated string, or array
function toArray(v) {
  if (!v) return []
  if (Array.isArray(v)) return v
  return String(v).split(',').map(s => s.trim()).filter(Boolean)
}

export function useCardScanner() {
  const { scannedCard, cardMeta, cardTrade, scanStatus, setScreen, activeSettings, profileActive, confirmStep, pendingCardId, pendingCard, pendingImageUrl, currentUser } = useAppState()

  // ── Full data fetch: attacks + set + price ────────────────────────────────
  // Called immediately for known cards, or after scan confirmation for new ones
  async function fetchCardData(card) {
    const [
      { data: attacks },
      { data: set },
      { data: price },
    ] = await Promise.all([
      supabase.from('attacks').select('*').eq('card_id', card.id),
      supabase.from('sets').select('*').eq('id', card.set_id).single(),
      supabase.from('tcgplayer').select('*').eq('card_id', card.id).single(),
    ])

    if (attacks) attacks.forEach(a => {
      a.cost = toArray(a.cost)
      a.type = toArray(a.type)
    })

    cardMeta.value  = { ...card, attacks: attacks ?? [], set: set ?? null }
    cardTrade.value = price ?? null
  }

  // ── Phase 1: show card image, decide whether to confirm ───────────────────
  async function _processCard(imageUrl, card) {
    const cardId = card.id

    // Normalise array fields on the cardinfo row
    card.subtypes      = toArray(card.subtypes)
    card.pokemon_types = toArray(card.pokemon_types)
    card.retreat_cost  = toArray(card.retreat_cost)

    // Show the card image immediately
    scannedCard.value = { imageUrl, name: card.card_name }

    // Check if this user already has this card in their library
    const { data: libraryEntry } = await supabase
      .from('library')
      .select('id')
      .eq('card_id', cardId)
      .eq('user_id', currentUser.value?.id)
      .maybeSingle()

    if (libraryEntry) {
      // Known card — fetch all data now, no confirmation needed
      await fetchCardData(card)
      confirmStep.value   = null
      pendingCardId.value = null
      pendingCard.value   = null
      pendingImageUrl.value = null
    } else {
      // New card — hold the card row for phase 2, wait for user confirmation
      // before hitting attacks / sets / tcgplayer
      pendingCard.value     = card
      pendingImageUrl.value = imageUrl
      pendingCardId.value   = cardId
      confirmStep.value     = 'scan'
    }

    // Switch to card viewer with Settings1 lit
    profileActive.value  = false
    activeSettings.value = 1
    setScreen('card-viewer')
    scanStatus.value = 'idle'
  }

  // ── Real scan: POST image to API → query by name ───────────────────────────
  async function scanImage(blob) {
    scanStatus.value = 'scanning'
    try {
      const formData = new FormData()
      formData.append('file', blob, 'capture.png')

      const apiRes = await fetch(API_URL, { method: 'POST', body: formData })
      if (!apiRes.ok) throw new Error(`API ${apiRes.status}`)

      const { URL: imageUrl, FileName: cardName } = await apiRes.json()

      const { data: card, error: cardErr } = await supabase
        .from('cardinfo')
        .select('*')
        .eq('card_name', cardName)
        .single()

      if (cardErr) throw cardErr
      await _processCard(imageUrl, card)

    } catch (err) {
      console.error('[CardScanner]', err)
      scanStatus.value = 'error'
    }
  }

  // ── Mock scan: query by id, skip API entirely ──────────────────────────────
  async function mockScan(cardId) {
    scanStatus.value = 'scanning'
    try {
      const { data: card, error: cardErr } = await supabase
        .from('cardinfo')
        .select('*')
        .eq('id', cardId)
        .single()

      if (cardErr) throw cardErr

      // Placeholder image — replaced by the real URL once the model is live
      const imageUrl = 'https://images.pokemontcg.io/bw6/148_hires.png'
      await _processCard(imageUrl, card)

    } catch (err) {
      console.error('[CardScanner mock]', err)
      scanStatus.value = 'error'
    }
  }

  return { scanImage, mockScan, scanStatus, fetchCardData }
}
