import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import ko from './locales/ko.json'
import en from './locales/en.json'

const resources = {
  zh: { translation: zh },
  ko: { translation: ko },
  en: { translation: en }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n