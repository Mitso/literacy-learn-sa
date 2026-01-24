<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">Learn to Read SA</h3>
          <p class="footer-text">
            {{ $t('footer.mission') }}
          </p>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">{{ $t('footer.quickLinks') }}</h4>
          <nav class="footer-nav">
            <NuxtLink to="/learn">{{ $t('nav.learn') }}</NuxtLink>
            <NuxtLink to="/lessons">{{ $t('nav.lessons') }}</NuxtLink>
            <NuxtLink to="/news">{{ $t('nav.news') }}</NuxtLink>
            <NuxtLink to="/about">{{ $t('nav.about') }}</NuxtLink>
          </nav>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">{{ $t('footer.languages') }}</h4>
          <div class="footer-languages">
            <span>English</span>
            <span>isiZulu</span>
            <span>isiXhosa</span>
            <span>Afrikaans</span>
            <span>Sesotho</span>
            <span>Setswana</span>
            <span>Kiswahili</span>
            <span>Hausa</span>
          </div>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">{{ $t('footer.contact') }}</h4>
          <p class="footer-text">
            {{ $t('footer.contactText') }}
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Learn to Read SA. {{ $t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background-color: var(--primary-dark);
  color: var(--text-on-primary);
  padding: var(--spacing-2xl) 0 var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.footer-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--text-on-primary);
}

.footer-subtitle {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-on-primary);
}

.footer-text {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  line-height: var(--line-height-relaxed);
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-nav a {
  color: var(--text-on-primary);
  text-decoration: none;
  font-size: var(--font-size-xs);
  opacity: 0.9;
  transition: opacity var(--transition-fast);
}

.footer-nav a:hover {
  opacity: 1;
  text-decoration: underline;
}

.footer-languages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.footer-languages span {
  font-size: var(--font-size-xs);
  opacity: 0.8;
  padding: var(--spacing-xs);
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-lg);
  text-align: center;
}

.footer-bottom p {
  font-size: var(--font-size-xs);
  opacity: 0.8;
  margin: 0;
}

@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-nav {
    align-items: center;
  }

  .footer-languages {
    justify-content: center;
  }
}
</style>
