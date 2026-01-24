/**
 * Get Available Azure Voices Endpoint
 *
 * Returns list of available voices for the Azure Speech Service
 */

interface VoiceInfo {
  name: string
  displayName: string
  language: string
  languageCode: string
  gender: 'Female' | 'Male'
  voiceType: 'Neural'
}

// All available South African and African voices
const AVAILABLE_VOICES: VoiceInfo[] = [
  // South African English
  {
    name: 'en-ZA-LeahNeural',
    displayName: 'Leah (South African)',
    language: 'English (South Africa)',
    languageCode: 'en-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'en-ZA-LukeNeural',
    displayName: 'Luke (South African)',
    language: 'English (South Africa)',
    languageCode: 'en-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // isiZulu
  {
    name: 'zu-ZA-ThandoNeural',
    displayName: 'Thando (Zulu)',
    language: 'isiZulu',
    languageCode: 'zu-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'zu-ZA-ThembaNeural',
    displayName: 'Themba (Zulu)',
    language: 'isiZulu',
    languageCode: 'zu-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // isiXhosa
  {
    name: 'xh-ZA-ThandoNeural',
    displayName: 'Thando (Xhosa)',
    language: 'isiXhosa',
    languageCode: 'xh-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'xh-ZA-ThembaNeural',
    displayName: 'Themba (Xhosa)',
    language: 'isiXhosa',
    languageCode: 'xh-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // Afrikaans
  {
    name: 'af-ZA-AdriNeural',
    displayName: 'Adri (Afrikaans)',
    language: 'Afrikaans',
    languageCode: 'af-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'af-ZA-WillemNeural',
    displayName: 'Willem (Afrikaans)',
    language: 'Afrikaans',
    languageCode: 'af-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // Sesotho
  {
    name: 'st-ZA-ThandoNeural',
    displayName: 'Thando (Sesotho)',
    language: 'Sesotho',
    languageCode: 'st-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'st-ZA-ThembaNeural',
    displayName: 'Themba (Sesotho)',
    language: 'Sesotho',
    languageCode: 'st-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // Setswana
  {
    name: 'tn-ZA-ThandoNeural',
    displayName: 'Thando (Setswana)',
    language: 'Setswana',
    languageCode: 'tn-ZA',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'tn-ZA-ThembaNeural',
    displayName: 'Themba (Setswana)',
    language: 'Setswana',
    languageCode: 'tn-ZA',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // Kiswahili
  {
    name: 'sw-KE-ZuriNeural',
    displayName: 'Zuri (Swahili)',
    language: 'Kiswahili',
    languageCode: 'sw-KE',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'sw-KE-RafikiNeural',
    displayName: 'Rafiki (Swahili)',
    language: 'Kiswahili',
    languageCode: 'sw-KE',
    gender: 'Male',
    voiceType: 'Neural'
  },

  // Additional English voices as fallback
  {
    name: 'en-GB-SoniaNeural',
    displayName: 'Sonia (British)',
    language: 'English (UK)',
    languageCode: 'en-GB',
    gender: 'Female',
    voiceType: 'Neural'
  },
  {
    name: 'en-US-JennyNeural',
    displayName: 'Jenny (American)',
    language: 'English (US)',
    languageCode: 'en-US',
    gender: 'Female',
    voiceType: 'Neural'
  },
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const language = query.language as string | undefined

  let voices = AVAILABLE_VOICES

  // Filter by language if specified
  if (language) {
    const langLower = language.toLowerCase()
    voices = voices.filter(v =>
      v.languageCode.toLowerCase().startsWith(langLower) ||
      v.language.toLowerCase().includes(langLower)
    )
  }

  return {
    voices,
    total: voices.length
  }
})
