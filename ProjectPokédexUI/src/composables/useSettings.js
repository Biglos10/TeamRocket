import { ref, watch } from 'vue'

const STORAGE_KEY = 'pokedex.settings'

const defaults = {
  autoSpeakAnswers: false,
  autoSpeakBio:     false,
  rate:             1.05,
  pitch:            1.15,
  voiceURI:         '',
  model:            'gemini-2.5-flash',
}

function load() {
  if (typeof localStorage === 'undefined') return { ...defaults }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

const stored = load()
const autoSpeakAnswers = ref(stored.autoSpeakAnswers)
const autoSpeakBio     = ref(stored.autoSpeakBio)
const rate             = ref(stored.rate)
const pitch            = ref(stored.pitch)
const voiceURI         = ref(stored.voiceURI)
const model            = ref(stored.model)

const voices = ref([])

function refreshVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  voices.value = window.speechSynthesis.getVoices() ?? []
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
}

watch([autoSpeakAnswers, autoSpeakBio, rate, pitch, voiceURI, model], () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      autoSpeakAnswers: autoSpeakAnswers.value,
      autoSpeakBio:     autoSpeakBio.value,
      rate:             rate.value,
      pitch:            pitch.value,
      voiceURI:         voiceURI.value,
      model:            model.value,
    }))
  } catch (err) {
    console.error('[settings] persist', err)
  }
})

export function useSettings() {
  return { autoSpeakAnswers, autoSpeakBio, rate, pitch, voiceURI, voices, model }
}
