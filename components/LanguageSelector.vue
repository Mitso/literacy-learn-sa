<template>
  <div class="language-selector-wrapper">
    <button
      class="language-toggle"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="current-lang">{{ currentLanguageName }}</span>
      <svg class="dropdown-icon" :class="{ 'icon-open': isOpen }" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="language-dropdown" role="listbox">
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          class="language-option"
          :class="{ 'active': locale.code === currentLocale }"
          @click="switchLanguage(locale.code)"
          role="option"
          :aria-selected="locale.code === currentLocale"
        >
          <span class="lang-name">{{ locale.name }}</span>
          <span class="lang-native">{{ getNativeName(locale.code) }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const isOpen = ref(false)

const availableLocales = computed(() => locales.value)

const currentLocale = computed(() => locale.value)

const currentLanguageName = computed(() => {
  const current = locales.value.find((l: any) => l.code === locale.value)
  return current?.name || 'English'
})

const nativeNames: Record<string, string> = {
  en: 'English',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  af: 'Afrikaans',
  st: 'Sesotho',
  tn: 'Setswana',
  sw: 'Kiswahili',
  ha: 'Hausa'
}

const getNativeName = (code: string): string => {
  return nativeNames[code] || code
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const switchLanguage = async (code: string) => {
  await setLocale(code)
  isOpen.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-selector-wrapper')) {
    isOpen.value = false
  }
}
</script>

<style scoped>
.language-selector-wrapper {
  position: relative;
}

.language-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-secondary);
  border: 2px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.language-toggle:hover {
  border-color: var(--primary-color);
}

.dropdown-icon {
  transition: transform var(--transition-fast);
}

.dropdown-icon.icon-open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  min-width: 200px;
  background-color: var(--bg-primary);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 50;
}

.language-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  text-align: left;
}

.language-option:hover {
  background-color: var(--bg-secondary);
}

.language-option.active {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.lang-name {
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.lang-native {
  font-size: 0.875rem;
  opacity: 0.7;
}

.language-option.active .lang-native {
  opacity: 0.9;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
