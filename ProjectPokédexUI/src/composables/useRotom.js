import { ref, watch } from 'vue'
import { gemini, ROTOM_SYSTEM_INSTRUCTION } from '../lib/gemini'
import { useAppState } from './useAppState'
import { useSettings } from './useSettings'

const lastQuery    = ref('')
const lastResponse = ref('')
const isLoading    = ref(false)
const errorMessage = ref('')
const isSpeaking   = ref(false)

const { scannedCard, cardMeta } = useAppState()
const { autoSpeakAnswers, autoSpeakBio, rate, pitch, voiceURI, voices, model } = useSettings()

function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  isSpeaking.value = false
}

function speak(textOverride) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const text = (textOverride ?? lastResponse.value).trim()
  if (!text) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate  = rate.value
  utterance.pitch = pitch.value
  if (voiceURI.value) {
    const v = voices.value.find(v => v.voiceURI === voiceURI.value)
    if (v) utterance.voice = v
  }
  utterance.onend   = () => { isSpeaking.value = false }
  utterance.onerror = () => { isSpeaking.value = false }

  isSpeaking.value = true
  window.speechSynthesis.speak(utterance)
}

function toggleSpeak() {
  if (isSpeaking.value) stopSpeaking()
  else speak()
}

async function streamGemini(prompt) {
  const stream = await gemini.models.generateContentStream({
    model: model.value,
    contents: prompt,
    config: { systemInstruction: ROTOM_SYSTEM_INSTRUCTION },
  })
  for await (const chunk of stream) {
    if (chunk.text) lastResponse.value += chunk.text
  }
}

async function ask(query) {
  const trimmed = query?.trim()
  if (!trimmed || isLoading.value) return

  stopSpeaking()
  lastQuery.value    = trimmed
  lastResponse.value = ''
  errorMessage.value = ''
  isLoading.value    = true

  try {
    await streamGemini(trimmed)
    if (autoSpeakAnswers.value) speak()
  } catch (err) {
    errorMessage.value = err?.message || 'Rotom is offline.'
  } finally {
    isLoading.value = false
  }
}

async function describePokemon(name) {
  if (!name || isLoading.value) return

  stopSpeaking()
  lastQuery.value    = `Pokédex: ${name}`
  lastResponse.value = ''
  errorMessage.value = ''
  isLoading.value    = true

  const prompt = `Give a Pokédex entry for ${name}. Speak about the Pokémon species itself, not the trading card variant. Keep it under 60 words. Plain prose only — this will be read aloud.`

  try {
    await streamGemini(prompt)
    speak()
  } catch (err) {
    errorMessage.value = err?.message || 'Rotom is offline.'
  } finally {
    isLoading.value = false
  }
}

// Rotom face button: describes the current card if one is loaded,
// otherwise replays the last response. Click again to stop speech.
function rotomPress() {
  if (isLoading.value) return
  if (isSpeaking.value) { stopSpeaking(); return }

  const name = cardMeta.value?.card_name || scannedCard.value?.name
  if (name) describePokemon(name)
  else if (lastResponse.value) speak()
}

// Auto-speak the Pokédex bio when a card is fully identified, if enabled.
watch(() => cardMeta.value?.card_name, (name) => {
  if (name && autoSpeakBio.value && !isLoading.value) {
    describePokemon(name)
  }
})

export function useRotom() {
  return {
    lastQuery, lastResponse, isLoading, errorMessage,
    isSpeaking, speak, stopSpeaking, toggleSpeak,
    ask, describePokemon, rotomPress,
  }
}
