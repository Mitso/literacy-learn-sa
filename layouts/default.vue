<template>
  <div class="app-layout">
    <AppSidebar :isOpen="isSidebarOpen" @close="closeSidebar" />

    <header class="top-bar">
      <button
        class="menu-toggle"
        @click="toggleSidebar"
        :aria-expanded="isSidebarOpen"
        aria-label="Toggle navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <NuxtLink to="/" class="top-bar-logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">Learn to Read SA</span>
      </NuxtLink>

      <div class="top-bar-spacer"></div>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  closeSidebar()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  gap: 0.5rem;
  z-index: 100;
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.menu-toggle:hover {
  background-color: var(--bg-secondary);
}

.top-bar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.25rem;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.top-bar-spacer {
  flex: 1;
}

.main-content {
  flex: 1;
  padding-top: 44px;
}
</style>
