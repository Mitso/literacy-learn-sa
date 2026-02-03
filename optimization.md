# Speech Synthesis Optimization Plan

## Current State (Updated)

### Architecture Overview

The application now uses a **dual-mode architecture** with Azure Speech SDK as primary and REST API as fallback:

| Aspect | SDK Mode (Primary) | Word-by-Word Mode (Fallback) |
|--------|-------------------|------------------------------|
| **API Calls** | 1 token + 1 synthesis per sentence | 1 token (cached) + 1 synthesis per word |
| **Highlighting** | Real-time via `wordBoundary` events | Sequential after each word speaks |
| **Prosody** | Natural sentence intonation | Robotic word-by-word |
| **Caching** | Token cached 9 min | Token + audio per word cached |
| **Fallback** | Word-by-word mode | Native Web Speech API |

### File Locations

| Component | File | Purpose |
|-----------|------|---------|
| SDK Service | `composables/useSpeechSdkService.ts` | Client-side SDK with word boundaries |
| Speech Service | `composables/useSpeechService.ts` | Word-by-word fallback with pre-caching |
| Reading Display | `components/ReadingDisplay.vue` | Dual-mode UI and controls |
| Token API | `server/api/speech/token.get.ts` | Auth token for client SDK |
| Token Utility | `server/utils/azureToken.ts` | Shared token caching |
| Synthesize API | `server/api/speech/synthesize.post.ts` | Azure TTS proxy (fallback) |
| Status API | `server/api/speech/status.get.ts` | Azure availability check |
| Voices API | `server/api/speech/voices.get.ts` | Available voices list |

---

## Identified Issues

### Critical Cost Leaks

1. **No Azure Token Caching**
   - Each synthesis request fetches a new token
   - Tokens are valid for ~10 minutes but discarded immediately
   - Doubles API call volume unnecessarily

2. **Session-Scoped Cache Only**
   - Cache cleared on component unmount
   - Page navigation loses all cached audio
   - Same words re-synthesized on every page visit

3. **No Cache Invalidation on Voice Change**
   - Switching voices doesn't clear cache
   - Stale audio from previous voice may play
   - Memory bloat from multiple voice caches

4. **No Cross-User Caching**
   - Common words ("the", "and", "is") synthesized per-user
   - No server-side deduplication

### Memory Management Issues

1. **Orphaned Blob URLs**
   - Text changes don't always revoke cached blob URLs
   - Long sessions accumulate unreleased memory

2. **Unbounded Cache Growth**
   - No LRU eviction policy
   - No maximum cache size limit

3. **PendingFetches Map Cleanup**
   - Failed requests removed, but Map can grow indefinitely

---

## Current Architecture (Implemented)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ReadingDisplay.vue                                              │
│    ├─ Dual-mode: SDK (primary) or word-by-word (fallback)       │
│    ├─ Real-time word highlighting via wordBoundary events       │
│    └─ Automatic fallback on SDK failure                         │
│                                                                  │
│  useSpeechSdkService.ts (PRIMARY)                               │
│    ├─ Azure Speech SDK with fromAuthorizationToken()            │
│    ├─ wordBoundary events → currentWordIndex updates            │
│    ├─ speak(), stop(), pause(), resume() methods                │
│    └─ Token fetched from /api/speech/token                      │
│                                                                  │
│  useSpeechService.ts (FALLBACK)                                 │
│    ├─ L1 Cache: In-memory Map (session-scoped, per-voice)       │
│    ├─ Pre-synthesis: 10 words ahead, batches of 5               │
│    └─ Fallback: Native Web Speech API                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  /api/speech/token (SDK mode)                                   │
│    └─ Returns auth token for client-side SDK                    │
│                                                                  │
│  /api/speech/synthesize (fallback mode)                         │
│    └─ Server-side synthesis for word-by-word                    │
│                                                                  │
│  server/utils/azureToken.ts (SHARED)                            │
│    └─ Token Cache: 9-minute TTL, 1-minute buffer                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AZURE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Token endpoint (cached server-side, 1 call per 9 min)          │
│  Speech SDK (1 call per sentence in SDK mode)                   │
│  TTS REST API (1 call per word in fallback mode)                │
└─────────────────────────────────────────────────────────────────┘
```

## Proposed Enhancements (Future)

---

## Implementation Priorities

### P0: Azure Token Caching (Critical)
**Effort:** 1-2 hours | **Savings:** 50% API calls

```typescript
// server/api/speech/synthesize.post.ts

let cachedToken: { token: string; expiry: number } | null = null

const getAzureToken = async (config: RuntimeConfig): Promise<string> => {
  // Return cached token if still valid (with 1-minute buffer)
  if (cachedToken && Date.now() < cachedToken.expiry - 60000) {
    return cachedToken.token
  }

  const tokenUrl = `https://${config.azureSpeechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': config.azureSpeechKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`)
  }

  const token = await response.text()

  cachedToken = {
    token,
    expiry: Date.now() + 9 * 60 * 1000 // 9 minutes (tokens valid for 10)
  }

  return token
}
```

### P1: Server-Side Word Cache
**Effort:** 3-4 hours | **Savings:** 60-80% for common words

```typescript
// Simple in-memory cache (upgrade to Redis for production)
const wordCache = new Map<string, string>() // {voice}:{word} → base64

const getCacheKey = (voice: string, word: string) =>
  `${voice}:${word.toLowerCase().trim()}`

// In synthesize handler:
const cacheKey = getCacheKey(voice, text)
if (wordCache.has(cacheKey)) {
  return { success: true, audioBase64: wordCache.get(cacheKey), ... }
}

// After synthesis:
if (!text.includes(' ')) { // Only cache single words
  wordCache.set(cacheKey, audioBase64)
}
```

### P2: Fix Cache Invalidation on Voice Change
**Effort:** 1 hour | **Savings:** Prevents stale audio bugs

```typescript
// composables/useSpeechService.ts

// Change cache key to include voice
const getCacheKey = (word: string, voice: string) =>
  `${voice}:${word.trim().toLowerCase()}`

// Or: Clear cache when voice changes
watch(() => selectedVoice.value, () => {
  clearCache()
})
```

### P3: IndexedDB Client Cache (Cross-Session)
**Effort:** 2-3 hours | **Savings:** 30-50% for returning users

```typescript
// composables/useAudioCache.ts

const DB_NAME = 'speech-cache'
const STORE_NAME = 'audio'

export const useAudioCache = () => {
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore(STORE_NAME)
      }
    })
  }

  const get = async (key: string): Promise<string | null> => {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  const set = async (key: string, value: string): Promise<void> => {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(value, key)
      tx.oncomplete = () => resolve()
    })
  }

  return { get, set }
}
```

### P4: Batch Synthesis Endpoint
**Effort:** 4-6 hours | **Savings:** 70% fewer round-trips

```typescript
// server/api/speech/synthesize-batch.post.ts

interface BatchRequest {
  words: string[]
  language: string
  voice: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BatchRequest>(event)
  const { words, language, voice } = body

  // Limit batch size
  const limitedWords = words.slice(0, 20)

  // Synthesize in parallel (with concurrency limit)
  const results = await Promise.all(
    limitedWords.map(word => synthesizeWord(word, language, voice))
  )

  return {
    success: true,
    audio: results.map((audio, i) => ({
      word: limitedWords[i],
      audioBase64: audio
    }))
  }
})
```

### P5: Pre-Generate Lesson Audio (Offline)
**Effort:** 4-8 hours | **Savings:** 100% for static lessons

- Build script to synthesize all lesson content
- Store as static MP3 files
- Serve from CDN
- Fall back to real-time synthesis for custom text

---

## Cost Projections

### Current vs Optimized

| Scenario | Current Cost | With Optimizations | Savings |
|----------|--------------|-------------------|---------|
| 100 users, light use | $0.35/mo | $0.08/mo | 77% |
| 1,000 users, medium use | $25/mo | $5/mo | 80% |
| 10,000 users, heavy use | $350/mo | $40/mo | 89% |

### API Call Reduction

| Optimization | Reduction |
|--------------|-----------|
| Token caching | 50% |
| Server word cache | 60-80% |
| Client IndexedDB cache | 30-50% |
| Batch synthesis | 70% |
| **Combined** | **85-95%** |

---

## Implementation Checklist

- [x] **P0: Token Caching** ✅ COMPLETED
  - [x] Created `server/utils/azureToken.ts` with shared caching
  - [x] 9-minute TTL with 1-minute buffer
  - [x] Used by both `/api/speech/token` and `/api/speech/synthesize`

- [ ] **P1: Server Word Cache**
  - [ ] Add in-memory cache Map
  - [ ] Implement cache key with voice/language
  - [ ] Add cache hit/miss logging
  - [ ] Consider Redis for production

- [x] **P2: Voice Change Cache Invalidation** ✅ COMPLETED
  - [x] Added watcher for selectedVoice changes in useSpeechService.ts
  - [x] Only clears cache on Azure-to-Azure voice switches
  - [x] Added `isUrlCached()` to prevent revoking cached blob URLs

- [ ] **P3: IndexedDB Cache**
  - [ ] Create useAudioCache composable
  - [ ] Integrate with useSpeechService
  - [ ] Add cache size limits (LRU eviction)
  - [ ] Handle quota exceeded errors

- [ ] **P4: Batch Endpoint**
  - [ ] Create synthesize-batch.post.ts
  - [ ] Update client to use batch for pre-fetch
  - [ ] Add concurrency limiting

- [ ] **P5: Static Lesson Audio**
  - [ ] Create build script for lesson synthesis
  - [ ] Set up CDN storage
  - [ ] Implement fallback logic

- [x] **P6: Azure Speech SDK Integration** ✅ COMPLETED (NEW)
  - [x] Install `microsoft-cognitiveservices-speech-sdk`
  - [x] Create `/api/speech/token` endpoint
  - [x] Create `useSpeechSdkService.ts` composable
  - [x] Implement `wordBoundary` event handling
  - [x] Update ReadingDisplay for dual-mode synthesis
  - [x] Automatic fallback to word-by-word on SDK failure

---

## Monitoring Recommendations

1. **Add metrics for:**
   - Cache hit/miss ratio
   - API calls per session
   - Token refresh frequency
   - Average synthesis latency

2. **Set alerts for:**
   - Cache miss rate > 50%
   - API errors > 5%
   - Latency > 3 seconds

3. **Dashboard:**
   - Daily API call volume
   - Cost trends
   - User session patterns

---

## References

- [Azure Speech Service Pricing](https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/)
- [Azure TTS REST API](https://docs.microsoft.com/azure/cognitive-services/speech-service/rest-text-to-speech)
- [IndexedDB API](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)
