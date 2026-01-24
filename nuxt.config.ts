// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Learn to Read SA - Literacy Learning Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'A literacy learning platform designed to help South Africans learn to read with voice-guided, word-by-word highlighting in multiple languages.'
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zu', name: 'isiZulu', file: 'zu.json' },
      { code: 'xh', name: 'isiXhosa', file: 'xh.json' },
      { code: 'af', name: 'Afrikaans', file: 'af.json' },
      { code: 'st', name: 'Sesotho', file: 'st.json' },
      { code: 'tn', name: 'Setswana', file: 'tn.json' },
      { code: 'sw', name: 'Kiswahili', file: 'sw.json' }, // Popular African language
      { code: 'ha', name: 'Hausa', file: 'ha.json' }, // Popular African language
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    }
  },

  runtimeConfig: {
    // Azure Speech Service credentials (server-side only)
    azureSpeechKey: process.env.AZURE_SPEECH_KEY || '',
    azureSpeechRegion: process.env.AZURE_SPEECH_REGION || 'southafricanorth',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    }
  },
})
