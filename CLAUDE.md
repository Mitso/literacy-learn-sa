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
- **Web Speech API** for text-to-speech

### Key Architectural Patterns

**Reading System (`components/ReadingDisplay.vue`)**
- Central component handling word-by-word reading with highlighting
- Uses Web Speech API for voice synthesis
- Emits events: `wordChange`, `complete`, `start`, `pause`
- Props: `text`, `showPointer`, `autoStart`
- Speed controlled via 1-5 scale (2000ms to 300ms per word)

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
