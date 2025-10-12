import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'zh' | 'ko' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (language: Language) => set({ language })
    }),
    {
      name: 'language-storage'
    }
  )
)