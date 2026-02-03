# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

## Architecture Overview

This is a **Nuxt 3 + Vue 3** literacy learning platform designed to help South Africans learn to read with voice-guided, word-by-word highlighting.

### Core Technologies
- **Nuxt 4.2** with Vue 3 Composition API
- **Pinia** for state management
- **@nuxtjs/i18n** for internationalization (8 languages)
- **@vueuse/nuxt** for Vue composables
- **Azure Speech SDK** for sentence-based synthesis with real-time word highlighting
- **Web Speech API** as fallback for text-to-speech

### Key Architectural Patterns

**Speech Services (Dual-Mode Architecture)**

The application uses a tiered speech synthesis approach:

1. **SDK Mode (Primary)** - `composables/useSpeechSdkService.ts`
   - Uses Azure Speech SDK for sentence-based synthesis
   - Real-time `wordBoundary` events for synchronized highlighting
   - Single API call per sentence (vs per word)
   - Natural prosody and intonation
   - Auth tokens fetched from `/api/speech/token`

2. **Word-by-Word Mode (Fallback)** - `composables/useSpeechService.ts`
   - REST API calls per word via `/api/speech/synthesize`
   - Pre-synthesis caching (10 words ahead, batches of 5)
   - Falls back to native Web Speech API if Azure unavailable

**Server-Side Token Management** - `server/utils/azureToken.ts`
- Shared token caching (9-minute TTL, 1-minute buffer)
- Used by both `/api/speech/token` and `/api/speech/synthesize`
- Keeps API keys secure server-side

**Reading System (`components/ReadingDisplay.vue`)**
- Dual-mode: SDK for sentences, word-by-word as fallback
- Real-time word highlighting via SDK `wordBoundary` events
- Emits events: `wordChange`, `complete`, `start`, `pause`
- Props: `text`, `showPointer`, `autoStart`
- Speed controlled via 1-5 scale (pause between words)

**Content Store (`stores/content.ts`)**
- Pinia store managing articles, lessons, and news sources
- Content categorized by:
  - **Region**: `south-africa`, `southern-africa`, `africa`
  - **Category**: `education`, `politics`, `health`, `technology`, `culture`, `economy`
  - **Reading Level**: `beginner`, `intermediate`, `advanced`
- Currently uses sample data; designed for future CMS/API integration

**Internationalization**
- 8 locales in `locales/`: en, zu (isiZulu), xh (isiXhosa), af (Afrikaans), st (Sesotho), tn (Setswana), sw (Kiswahili), ha (Hausa)
- Strategy: `prefix_except_default` (English is default, others get URL prefix)
- All UI strings use `$t()` helper

**Type Definitions (`types/index.ts`)**
- `ReadingSettings`: User preferences for reading experience
- `UserProgress`: Track lessons completed, words learned
- `LiteracyStats`: Country-level literacy data
- `REGIONS`, `TOPIC_CATEGORIES`, `LITERACY_STATISTICS`: Static reference data

### Page Structure
- `/` - Home with demo reading area
- `/learn` - Practice reading with lessons or custom text
- `/lessons` - Browse lessons by difficulty level
- `/lessons/[id]` - Individual lesson with reading display
- `/news` - Regional news comparison (3-column layout)
- `/articles/[id]` - Article with read/practice mode toggle
- `/about` - Literacy crisis statistics and mission

### CSS Architecture
- Global styles in `assets/css/main.css`
- CSS custom properties for theming (supports dark mode via `prefers-color-scheme`)
- Large font sizes by default (`--font-size-reading: 2.5rem`)
- Generous line height for readability (`--line-height-reading: 2.5`)

### Composables
- `composables/useContentStore.ts` - Wrapper for Pinia content store
- `composables/useSpeechSdkService.ts` - Azure Speech SDK with word boundary events
- `composables/useSpeechService.ts` - Word-by-word synthesis with pre-caching

### API Endpoints
- `GET /api/speech/token` - Fetch auth token for client-side SDK
- `POST /api/speech/synthesize` - Server-side word synthesis (fallback mode)
- `GET /api/speech/status` - Check Azure availability
- `GET /api/speech/voices` - List available voices
