import type { Ref } from 'vue'

// keeps a ref in sync with localStorage, so its value survives a refresh
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const data = ref<T>(initial) as Ref<T>

  // localStorage only exists in the browser, and Nuxt renders on the server
  // first — so the saved value is read after the page has mounted
  onMounted(() => {
    try {
      const saved = localStorage.getItem(key)
      if (!saved) return

      const parsed = JSON.parse(saved)
      // only trust it if it is the same shape we started with, otherwise a
      // stray value like "hello" would replace an array and break the caller
      if (Array.isArray(parsed) === Array.isArray(initial)) data.value = parsed
    } catch {
      localStorage.removeItem(key) // unreadable, so throw it away
    }
  })

  watch(data, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage can be full, or switched off in private mode.
      // failing to save is not worth crashing the page over.
    }
  }, { deep: true })

  return data
}
