import { ref } from 'vue'
import { gemini, ROTOM_MODEL, ROTOM_SYSTEM_INSTRUCTION } from '../lib/gemini'
import { useAppState } from './useAppState'

const lastQuery    = ref('')
const lastResponse = ref('')
const isLoading    = ref(false)
const errorMessage = ref('')

export function useRotom() {
  const { setScreen } = useAppState()

  async function ask(query) {
    const trimmed = query?.trim()
    if (!trimmed || isLoading.value) return

    lastQuery.value    = trimmed
    lastResponse.value = ''
    errorMessage.value = ''
    isLoading.value    = true
    setScreen('rotom')

    try {
      const stream = await gemini.models.generateContentStream({
        model: ROTOM_MODEL,
        contents: trimmed,
        config: {
          systemInstruction: ROTOM_SYSTEM_INSTRUCTION,
        },
      })

      for await (const chunk of stream) {
        if (chunk.text) lastResponse.value += chunk.text
      }
    } catch (err) {
      errorMessage.value = err?.message || 'Rotom is offline.'
    } finally {
      isLoading.value = false
    }
  }

  return { lastQuery, lastResponse, isLoading, errorMessage, ask }
}
