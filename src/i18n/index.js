import { ref, computed } from 'vue'
import de from '../locales/de.js'
import en from '../locales/en.js'
import fr from '../locales/fr.js'
import it from '../locales/it.js'
import es from '../locales/es.js'

const LOCALES = { de, en, fr, it, es }

const STORAGE_KEY = 'mise-en-place-lang'

export const SUPPORTED_LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

function detectLang() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LOCALES[stored]) return stored
  const browser = navigator.language?.slice(0, 2)
  if (browser && LOCALES[browser]) return browser
  return 'de'
}

export const currentLang = ref(detectLang())

export const messages = computed(() => LOCALES[currentLang.value] || de)

export function setLang(code) {
  if (!LOCALES[code]) return
  currentLang.value = code
  localStorage.setItem(STORAGE_KEY, code)
}

export function t(key) {
  const keys = key.split('.')
  let val = messages.value
  for (const k of keys) {
    val = val?.[k]
    if (val === undefined) break
  }
  if (val === undefined) {
    let fb = de
    for (const k of keys) fb = fb?.[k]
    return fb ?? key
  }
  return val
}
