<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <NuxtLink to="/" class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Learn to Read SA</span>
        </NuxtLink>

        <nav class="nav-menu" :class="{ 'nav-open': isMenuOpen }">
          <NuxtLink to="/" class="nav-link" @click="closeMenu">
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink to="/learn" class="nav-link" @click="closeMenu">
            {{ $t('nav.learn') }}
          </NuxtLink>
          <NuxtLink to="/lessons" class="nav-link" @click="closeMenu">
            {{ $t('nav.lessons') }}
          </NuxtLink>
          <NuxtLink to="/news" class="nav-link" @click="closeMenu">
            {{ $t('nav.news') }}
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link" @click="closeMenu">
            {{ $t('nav.about') }}
          </NuxtLink>
        </nav>

        <div class="header-actions">
          <LanguageSelector />
          <button
            class="menu-toggle"
            @click="toggleMenu"
            :aria-expanded="isMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-bar {
  width: 100%;
  height: 3px;
  background-color: var(--text-primary);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

@media (max-width: 992px) {
  .menu-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
    flex-direction: column;
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-md);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
  }

  .nav-menu.nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    font-size: var(--font-size-base);
    padding: var(--spacing-sm) var(--spacing-md);
    width: 100%;
    text-align: center;
  }
}
</style>
