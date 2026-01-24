# Onboarding Guide: Learn to Read SA

Welcome to the Learn to Read SA project! This guide will help you get up to speed with the codebase and start contributing.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Key Components](#key-components)
6. [State Management](#state-management)
7. [Internationalization](#internationalization)
8. [Styling Guide](#styling-guide)
9. [Adding New Content](#adding-new-content)
10. [Common Tasks](#common-tasks)

---

## Project Overview

### What is Learn to Read SA?

Learn to Read SA is a literacy learning platform designed to help South Africans (and broader African audiences) learn to read. The platform focuses on:

- **Word-by-word reading** with visual highlighting and an animated pointer
- **Text-to-speech** that reads each word aloud as it's highlighted
- **Adjustable reading speed** from very slow (for beginners) to fast
- **Multi-language support** for South African and African languages
- **Regional news content** comparing South Africa, Southern Africa, and the rest of Africa

### The Literacy Crisis Context

South Africa faces a significant literacy crisis:
- **78% of Grade 4 learners** cannot read for meaning (PIRLS 2021)
- This makes SA one of the worst-performing countries in international literacy assessments
- The platform aims to provide free, accessible tools to address this crisis

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd literacy-learn-sa

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run generate` | Generate static site |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
literacy-learn-sa/
├── assets/
│   └── css/
│       └── main.css          # Global styles and CSS variables
├── components/
│   ├── AppHeader.vue         # Site header with navigation
│   ├── AppFooter.vue         # Site footer
│   ├── ArticleCard.vue       # News/article card component
│   ├── LanguageSelector.vue  # Language switcher dropdown
│   └── ReadingDisplay.vue    # Core reading component (most important!)
├── composables/
│   └── useContentStore.ts    # Pinia store wrapper
├── layouts/
│   └── default.vue           # Main layout with header/footer
├── locales/
│   ├── en.json               # English translations
│   ├── zu.json               # isiZulu translations
│   ├── xh.json               # isiXhosa translations
│   ├── af.json               # Afrikaans translations
│   ├── st.json               # Sesotho translations
│   ├── tn.json               # Setswana translations
│   ├── sw.json               # Kiswahili translations
│   └── ha.json               # Hausa translations
├── pages/
│   ├── index.vue             # Home page
│   ├── learn.vue             # Practice reading page
│   ├── lessons.vue           # Lessons listing
│   ├── lessons/[id].vue      # Individual lesson
│   ├── news.vue              # Regional news comparison
│   ├── articles/[id].vue     # Individual article
│   └── about.vue             # About page with literacy stats
├── stores/
│   └── content.ts            # Pinia store for content management
├── types/
│   └── index.ts              # TypeScript interfaces and constants
├── nuxt.config.ts            # Nuxt configuration
└── package.json
```

---

## Core Concepts

### 1. The Reading Experience

The platform's core feature is guided reading with three visual cues:

1. **Active Word Highlighting**: The current word has a yellow background and scales up slightly
2. **Underline Indicator**: A colored underline shows reading direction
3. **Animated Pointer**: A red triangular pointer bounces below the current word
4. **Completed Words**: Already-read words turn green with an underline

### 2. Content Hierarchy

Content is organized in three dimensions:

**By Region:**
- `south-africa` - South African specific content
- `southern-africa` - SADC region (Botswana, Zimbabwe, Namibia, etc.)
- `africa` - Pan-African content

**By Category:**
- `education`, `politics`, `health`, `technology`, `culture`, `economy`

**By Reading Level:**
- `beginner` - Simple words, short sentences
- `intermediate` - Longer texts, more vocabulary
- `advanced` - Complex content

### 3. Speed Levels

Reading speed is controlled on a 1-5 scale:

| Level | Name | Milliseconds per word |
|-------|------|----------------------|
| 1 | Very Slow | 2000ms |
| 2 | Slow | 1200ms |
| 3 | Normal | 800ms |
| 4 | Fast | 500ms |
| 5 | Very Fast | 300ms |

Default is level 2 (Slow) - appropriate for learners.

---

## Key Components

### ReadingDisplay.vue

This is the **most important component** in the application. It handles:

- Splitting text into words
- Managing reading state (playing, paused, stopped)
- Word highlighting and pointer positioning
- Text-to-speech synthesis
- Progress tracking

**Props:**
```typescript
interface Props {
  text: string           // The text to read
  showPointer?: boolean  // Show animated pointer (default: true)
  autoStart?: boolean    // Start reading automatically (default: false)
}
```

**Events:**
```typescript
emit('wordChange', index: number, word: string)  // When active word changes
emit('complete')                                  // When reading finishes
emit('start')                                     // When reading starts
emit('pause')                                     // When reading pauses
```

**Usage:**
```vue
<ReadingDisplay
  :text="lessonContent"
  :show-pointer="true"
  @word-change="onWordChange"
  @complete="onComplete"
/>
```

### LanguageSelector.vue

Dropdown for switching between 8 supported languages. Uses `@nuxtjs/i18n` under the hood.

### ArticleCard.vue

Displays article previews with:
- Topic tag (color-coded by category)
- Region indicator
- Reading level badge
- Links to read or practice reading

---

## State Management

### Content Store (`stores/content.ts`)

The Pinia store manages all content:

```typescript
// State
articles: Article[]
lessons: Lesson[]
newsSources: NewsSource[]
currentArticle: Article | null
currentLesson: Lesson | null
isLoading: boolean
error: string | null

// Key Getters
getArticlesByRegion(region)
getArticlesByCategory(category)
getLessonsByLevel(level)
beginnerLessons
southAfricanArticles
```

**Using the store:**
```vue
<script setup>
const contentStore = useContentStore()

onMounted(() => {
  contentStore.initializeContent()
})

const lessons = computed(() => contentStore.beginnerLessons)
</script>
```

### Data Types (`types/index.ts`)

Key interfaces:

```typescript
interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: 'education' | 'politics' | 'health' | 'technology' | 'culture' | 'economy'
  region: 'south-africa' | 'southern-africa' | 'africa'
  readingLevel: 'beginner' | 'intermediate' | 'advanced'
  translations?: Record<string, { title: string; content: string; excerpt: string }>
}

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  level: 'beginner' | 'intermediate' | 'advanced'
  order: number
  category: string
  translations?: Record<string, {...}>
}
```

---

## Internationalization

### Supported Languages

| Code | Language | Region |
|------|----------|--------|
| `en` | English | Default |
| `zu` | isiZulu | South Africa |
| `xh` | isiXhosa | South Africa |
| `af` | Afrikaans | South Africa |
| `st` | Sesotho | South Africa |
| `tn` | Setswana | South Africa/Botswana |
| `sw` | Kiswahili | East Africa |
| `ha` | Hausa | West Africa |

### Using Translations

In templates:
```vue
<template>
  <h1>{{ $t('home.hero.title') }}</h1>
  <p>{{ $t('about.mission.text') }}</p>
</template>
```

In script:
```vue
<script setup>
const { t, locale } = useI18n()

const greeting = computed(() => t('common.welcome'))
</script>
```

### Adding a New Translation Key

1. Add the key to `locales/en.json` first
2. Add translations to all other locale files
3. Use the key with `$t('key.path')`

### URL Strategy

- English: `/learn`, `/lessons`, `/news`
- Other languages: `/zu/learn`, `/xh/lessons`, `/af/news`

---

## Styling Guide

### CSS Variables

The project uses CSS custom properties for consistent theming. Key variables in `assets/css/main.css`:

**Colors:**
```css
--primary-color: #1a5f7a;
--secondary-color: #f7941d;
--accent-green: #28a745;
--accent-red: #dc3545;
--highlight-word: #ffeb3b;
--pointer-color: #dc3545;
```

**Typography (extra large for literacy):**
```css
--font-size-reading: 2.5rem;
--line-height-reading: 2.5;
--font-size-base: 1.5rem;
```

**Spacing:**
```css
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;
--spacing-xl: 3rem;
```

### Component Styling

Use scoped styles in Vue components:

```vue
<style scoped>
.my-component {
  padding: var(--spacing-lg);
  font-size: var(--font-size-base);
  background-color: var(--bg-secondary);
}
</style>
```

### Dark Mode

The app supports dark mode via `prefers-color-scheme`. Variables automatically adjust:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a2e;
    --text-primary: #f0f0f0;
    /* etc. */
  }
}
```

### Accessibility Considerations

- All interactive elements have `:focus-visible` styles
- Reduced motion support via `prefers-reduced-motion`
- Large touch targets (minimum 60px for icon buttons)
- High contrast colors
- ARIA labels on controls

---

## Adding New Content

### Adding a New Lesson

In `stores/content.ts`, add to the `getSampleLessons()` function:

```typescript
{
  id: 'lesson-6',
  title: 'Your Lesson Title',
  description: 'Brief description of the lesson.',
  content: `Your lesson content here.

  Use simple words.

  Short sentences work best.

  Each paragraph becomes easier to read.`,
  level: 'beginner',  // or 'intermediate', 'advanced'
  order: 6,
  category: 'phonics',
  language: 'en',
  translations: {
    zu: {
      title: 'Isihloko Sesifundo Sakho',
      description: 'Incazelo emfushane.',
      content: 'Okuqukethwe kwesifundo...',
    }
  }
}
```

### Adding a New Article

In `stores/content.ts`, add to the `getSampleArticles()` function:

```typescript
{
  id: '6',
  title: 'Your Article Title',
  content: `Article content with multiple paragraphs.

  Keep sentences simple for beginner content.

  Include relevant information about the topic.`,
  excerpt: 'A brief summary for the card preview.',
  category: 'education',
  region: 'south-africa',
  language: 'en',
  author: 'Author Name',
  publishedAt: '2024-02-01',
  readingLevel: 'beginner',
}
```

### Adding a New Language

1. Create new locale file: `locales/xx.json`
2. Copy structure from `locales/en.json`
3. Translate all strings
4. Add to `nuxt.config.ts`:

```typescript
i18n: {
  locales: [
    // ... existing locales
    { code: 'xx', name: 'Language Name', file: 'xx.json' },
  ],
}
```

5. Add native name to `LanguageSelector.vue`:

```typescript
const nativeNames: Record<string, string> = {
  // ... existing
  xx: 'Native Name',
}
```

---

## Common Tasks

### Running the Development Server

```bash
npm run dev
```

### Adding a New Page

Create a new file in `pages/`:

```vue
<!-- pages/my-page.vue -->
<template>
  <div class="my-page">
    <div class="container">
      <h1>{{ $t('myPage.title') }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page logic here
</script>

<style scoped>
.my-page {
  padding: var(--spacing-xl) 0;
}
</style>
```

### Creating a New Component

```vue
<!-- components/MyComponent.vue -->
<template>
  <div class="my-component">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})
</script>

<style scoped>
.my-component {
  /* styles */
}
</style>
```

Components are auto-imported by Nuxt.

### Setting Up Azure Speech Service

The platform uses Microsoft Azure Speech Service for high-quality text-to-speech with native South African language support, with Web Speech API as fallback.

**Supported Azure Voices:**
| Language | Female Voice | Male Voice |
|----------|--------------|------------|
| English (SA) | en-ZA-LeahNeural | en-ZA-LukeNeural |
| isiZulu | zu-ZA-ThandoNeural | zu-ZA-ThembaNeural |
| isiXhosa | xh-ZA-ThandoNeural | xh-ZA-ThembaNeural |
| Afrikaans | af-ZA-AdriNeural | af-ZA-WillemNeural |
| Sesotho | st-ZA-ThandoNeural | st-ZA-ThembaNeural |
| Setswana | tn-ZA-ThandoNeural | tn-ZA-ThembaNeural |
| Kiswahili | sw-KE-ZuriNeural | sw-KE-RafikiNeural |

**Setup Steps:**

1. **Create Azure Account**: Go to [portal.azure.com](https://portal.azure.com)

2. **Create Speech Resource**:
   - Search for "Speech" in Azure services
   - Click "Create"
   - Select "South Africa North" region for best latency
   - Choose pricing tier (F0 is free: 5 hours/month)

3. **Get API Key**:
   - Go to your Speech resource
   - Click "Keys and Endpoint"
   - Copy "Key 1" or "Key 2"

4. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   AZURE_SPEECH_KEY=your-key-here
   AZURE_SPEECH_REGION=southafricanorth
   ```

5. **Restart Dev Server**: The app will automatically detect Azure and use it as the primary TTS provider.

**Fallback Behavior:**
- If Azure is not configured, the app falls back to the browser's native Web Speech API
- If Azure fails during playback, it automatically switches to native speech
- The UI shows a badge indicating which provider is active (Azure/Native)

### Testing Text-to-Speech

Test in multiple browsers to ensure compatibility:
- Chrome (best native support)
- Safari
- Firefox
- Edge

With Azure configured, all browsers will use Azure voices for consistent quality.

### Building for Production

```bash
# Standard build
npm run build

# Static generation (for hosting on static servers)
npm run generate
```

---

## Need Help?

- Check [CLAUDE.md](../CLAUDE.md) for quick reference
- Review component source code - it's well-commented
- Look at existing pages for patterns to follow

Welcome to the team! Your work will help improve literacy across South Africa and beyond.
