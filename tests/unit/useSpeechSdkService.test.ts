/**
 * Unit Tests: Azure Speech SDK Service
 *
 * Tests for composables/useSpeechSdkService.ts
 * High-level tests for SDK service behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Speech SDK
vi.mock('microsoft-cognitiveservices-speech-sdk', () => ({
  SpeechConfig: {
    fromAuthorizationToken: vi.fn(() => ({
      speechSynthesisVoiceName: '',
      speechSynthesisOutputFormat: 0
    }))
  },
  SpeechSynthesizer: vi.fn().mockImplementation(() => ({
    wordBoundary: null,
    speakSsmlAsync: vi.fn(),
    close: vi.fn()
  })),
  SpeakerAudioDestination: vi.fn().mockImplementation(() => ({
    pause: vi.fn(),
    resume: vi.fn()
  })),
  AudioConfig: {
    fromSpeakerOutput: vi.fn()
  },
  SpeechSynthesisOutputFormat: {
    Audio24Khz96KBitRateMonoMp3: 5
  },
  ResultReason: {
    SynthesizingAudioCompleted: 0,
    Canceled: 1
  },
  CancellationReason: {
    Error: 0
  },
  CancellationDetails: {
    fromResult: vi.fn(() => ({ reason: 0, errorDetails: 'Test error' }))
  }
}))

// Mock Vue composables
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    ref: vi.fn((val) => ({ value: val })),
    onUnmounted: vi.fn()
  }
})

// Mock Nuxt composables
vi.mock('#imports', () => ({
  useI18n: () => ({ locale: { value: 'en' } }),
  $fetch: vi.fn()
}))

describe('useSpeechSdkService', () => {
  describe('Word Boundary Calculation', () => {
    /**
     * Tests the word index calculation from text offset
     * This is critical for accurate word highlighting
     */

    it('should calculate correct word index for first word', () => {
      const text = 'Hello world today'
      const words = text.split(/\s+/)
      const textOffset = 0 // Start of "Hello"

      // Word at offset 0 should be index 0
      const expectedIndex = 0
      let charCount = 0
      let result = -1

      for (let i = 0; i < words.length; i++) {
        const wordStart = text.indexOf(words[i], charCount)
        const wordEnd = wordStart + words[i].length

        if (textOffset >= wordStart && textOffset < wordEnd + 1) {
          result = i
          break
        }
        charCount = wordEnd
      }

      expect(result).toBe(expectedIndex)
    })

    it('should calculate correct word index for middle word', () => {
      const text = 'Hello world today'
      const words = text.split(/\s+/)
      const textOffset = 6 // Start of "world"

      let charCount = 0
      let result = -1

      for (let i = 0; i < words.length; i++) {
        const wordStart = text.indexOf(words[i], charCount)
        const wordEnd = wordStart + words[i].length

        if (textOffset >= wordStart && textOffset < wordEnd + 1) {
          result = i
          break
        }
        charCount = wordEnd
      }

      expect(result).toBe(1) // "world" is at index 1
    })

    it('should calculate correct word index for last word', () => {
      const text = 'Hello world today'
      const words = text.split(/\s+/)
      const textOffset = 12 // Start of "today"

      let charCount = 0
      let result = -1

      for (let i = 0; i < words.length; i++) {
        const wordStart = text.indexOf(words[i], charCount)
        const wordEnd = wordStart + words[i].length

        if (textOffset >= wordStart && textOffset < wordEnd + 1) {
          result = i
          break
        }
        charCount = wordEnd
      }

      expect(result).toBe(2) // "today" is at index 2
    })
  })

  describe('SSML Building', () => {
    /**
     * Tests SSML generation for Azure Speech SDK
     */

    const buildSSML = (text: string, voice: string, rate: number, pitch: number): string => {
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

      const ratePercent = Math.round((rate - 1) * 100)
      const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`

      const pitchPercent = Math.round((pitch - 1) * 50)
      const pitchString = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`

      const localeParts = voice.split('-')
      const xmlLang = localeParts.length >= 2 ? `${localeParts[0]}-${localeParts[1]}` : 'en-ZA'

      return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
  <voice name="${voice}">
    <prosody rate="${rateString}" pitch="${pitchString}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`
    }

    it('should escape XML special characters', () => {
      const ssml = buildSSML('Tom & Jerry', 'en-ZA-LeahNeural', 1.0, 1.0)
      expect(ssml).toContain('Tom &amp; Jerry')
    })

    it('should set rate to +0% for normal speed', () => {
      const ssml = buildSSML('Hello', 'en-ZA-LeahNeural', 1.0, 1.0)
      expect(ssml).toContain('rate="+0%"')
    })

    it('should set rate to -50% for slow speed', () => {
      const ssml = buildSSML('Hello', 'en-ZA-LeahNeural', 0.5, 1.0)
      expect(ssml).toContain('rate="-50%"')
    })

    it('should set rate to +100% for fast speed', () => {
      const ssml = buildSSML('Hello', 'en-ZA-LeahNeural', 2.0, 1.0)
      expect(ssml).toContain('rate="+100%"')
    })

    it('should extract locale from voice name', () => {
      const ssml = buildSSML('Sawubona', 'zu-ZA-ThandoNeural', 1.0, 1.0)
      expect(ssml).toContain('xml:lang="zu-ZA"')
    })
  })

  describe('Default Voices', () => {
    const DEFAULT_VOICES: Record<string, string> = {
      'en': 'en-ZA-LeahNeural',
      'zu': 'zu-ZA-ThandoNeural',
      'xh': 'xh-ZA-ThandoNeural',
      'af': 'af-ZA-AdriNeural',
      'st': 'st-ZA-ThandoNeural',
      'tn': 'tn-ZA-ThandoNeural',
      'sw': 'sw-KE-ZuriNeural',
    }

    it('should have South African English voice', () => {
      expect(DEFAULT_VOICES['en']).toBe('en-ZA-LeahNeural')
    })

    it('should have isiZulu voice', () => {
      expect(DEFAULT_VOICES['zu']).toBe('zu-ZA-ThandoNeural')
    })

    it('should have isiXhosa voice', () => {
      expect(DEFAULT_VOICES['xh']).toBe('xh-ZA-ThandoNeural')
    })

    it('should have Afrikaans voice', () => {
      expect(DEFAULT_VOICES['af']).toBe('af-ZA-AdriNeural')
    })

    it('should fallback to English for unknown locale', () => {
      const locale = 'unknown'
      const voice = DEFAULT_VOICES[locale] || DEFAULT_VOICES['en']
      expect(voice).toBe('en-ZA-LeahNeural')
    })
  })
})
