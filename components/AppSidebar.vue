<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <NuxtLink to="/" class="logo" @click="closeSidebar">
        <span class="logo-icon">📚</span>
        <span class="logo-text">Learn to Read SA</span>
      </NuxtLink>
      <button
        class="sidebar-close"
        @click="closeSidebar"
        aria-label="Close navigation"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink to="/" class="nav-item" @click="closeSidebar">
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>{{ $t('nav.home') }}</span>
      </NuxtLink>

      <NuxtLink to="/learn" class="nav-item" @click="closeSidebar">
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span>{{ $t('nav.learn') }}</span>
      </NuxtLink>

      <NuxtLink to="/lessons" class="nav-item" @click="closeSidebar">
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>{{ $t('nav.lessons') }}</span>
      </NuxtLink>

      <NuxtLink to="/news" class="nav-item" @click="closeSidebar">
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
        </svg>
        <span>{{ $t('nav.news') }}</span>
      </NuxtLink>

      <NuxtLink to="/about" class="nav-item" @click="closeSidebar">
        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>{{ $t('nav.about') }}</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <LanguageSelector />
    </div>
  </aside>

  <div
    class="sidebar-overlay"
    :class="{ 'overlay-visible': isOpen }"
    @click="closeSidebar"
  ></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const closeSidebar = () => {
  emit('close')
}

// Close sidebar on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeSidebar()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--bg-tertiary);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-color);
}

.sidebar-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.sidebar-close:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.nav-item.router-link-active .nav-icon {
  stroke: var(--text-on-primary);
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--bg-tertiary);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
}

.overlay-visible {
  opacity: 1;
  visibility: visible;
}
</style>
