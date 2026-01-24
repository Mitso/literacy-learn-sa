<template>
  <div class="about-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header text-center mb-xl">
        <h1 class="page-title">{{ $t('about.title') }}</h1>
      </header>

      <!-- Mission Section -->
      <section class="mission-section mb-xl">
        <div class="content-card">
          <h2 class="section-title">{{ $t('about.mission.title') }}</h2>
          <p class="section-text large-text">{{ $t('about.mission.text') }}</p>
        </div>
      </section>

      <!-- Literacy Crisis Section -->
      <section class="crisis-section mb-xl">
        <div class="content-card crisis-card">
          <h2 class="section-title">{{ $t('about.crisis.title') }}</h2>
          <p class="section-text">{{ $t('about.crisis.text') }}</p>

          <!-- Statistics -->
          <div class="crisis-stats">
            <div class="crisis-stat">
              <div class="stat-value">78%</div>
              <div class="stat-desc">of Grade 4 learners cannot read for meaning</div>
            </div>
            <div class="crisis-stat">
              <div class="stat-value">#1</div>
              <div class="stat-desc">Worst performing country in PIRLS assessment</div>
            </div>
            <div class="crisis-stat">
              <div class="stat-value">4/10</div>
              <div class="stat-desc">Adults have low literacy skills</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Why This Happens Section -->
      <section class="causes-section mb-xl">
        <h2 class="section-title text-center mb-lg">{{ $t('about.causes.title') }}</h2>
        <div class="causes-grid">
          <div class="cause-card">
            <div class="cause-icon">💰</div>
            <h3 class="cause-title">Poverty</h3>
            <p class="cause-text">{{ $t('about.causes.poverty') }}</p>
          </div>
          <div class="cause-card">
            <div class="cause-icon">📚</div>
            <h3 class="cause-title">Resources</h3>
            <p class="cause-text">{{ $t('about.causes.resources') }}</p>
          </div>
          <div class="cause-card">
            <div class="cause-icon">🗣️</div>
            <h3 class="cause-title">Language</h3>
            <p class="cause-text">{{ $t('about.causes.language') }}</p>
          </div>
          <div class="cause-card">
            <div class="cause-icon">👶</div>
            <h3 class="cause-title">Early Exposure</h3>
            <p class="cause-text">{{ $t('about.causes.early') }}</p>
          </div>
        </div>
      </section>

      <!-- Detailed Statistics -->
      <section class="stats-detail-section mb-xl bg-secondary py-xl">
        <div class="container">
          <h2 class="section-title text-center mb-lg">Literacy Statistics Comparison</h2>
          <p class="section-subtitle text-center mb-xl">
            Comparing literacy rates across South Africa, Southern Africa, and the continent
          </p>

          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Adult Literacy Rate</th>
                  <th>Children Reading with Understanding</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in literacyStats" :key="stat.country" :class="{ highlight: stat.country === 'South Africa' }">
                  <td>{{ stat.country }}</td>
                  <td>{{ stat.literacyRate }}%</td>
                  <td>{{ stat.childLiteracyRate }}%</td>
                  <td>{{ stat.year }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="stats-note mt-lg">
            <p><strong>Note:</strong> South Africa's adult literacy rate appears high (87%), but this masks the crisis. While adults may recognize letters, only 22% of Grade 4 children can read with comprehension - the worst in international assessments.</p>
          </div>
        </div>
      </section>

      <!-- Research and Sources -->
      <section class="research-section mb-xl">
        <h2 class="section-title text-center mb-lg">Research and Sources</h2>
        <div class="sources-list">
          <div class="source-item">
            <h4>PIRLS 2021 (Progress in International Reading Literacy Study)</h4>
            <p>International assessment showing South Africa ranked last among 57 countries for Grade 4 reading comprehension.</p>
          </div>
          <div class="source-item">
            <h4>UNESCO Institute for Statistics</h4>
            <p>Provides literacy data for countries across Africa and globally.</p>
          </div>
          <div class="source-item">
            <h4>Department of Basic Education (South Africa)</h4>
            <p>National assessments and policy documents on literacy education.</p>
          </div>
          <div class="source-item">
            <h4>National Income Dynamics Study (NIDS)</h4>
            <p>Longitudinal study tracking South African households and educational outcomes.</p>
          </div>
        </div>
      </section>

      <!-- How We Help Section -->
      <section class="solution-section mb-xl">
        <div class="content-card solution-card">
          <h2 class="section-title">{{ $t('about.solution.title') }}</h2>
          <p class="section-text">{{ $t('about.solution.text') }}</p>

          <div class="solution-features">
            <div class="solution-feature">
              <h4>Word-by-Word Highlighting</h4>
              <p>Each word is highlighted as you read, with a pointer showing direction. This helps learners connect written words with their sounds.</p>
            </div>
            <div class="solution-feature">
              <h4>Voice Reading</h4>
              <p>Text-to-speech technology reads each word aloud, helping learners hear correct pronunciation while seeing the word.</p>
            </div>
            <div class="solution-feature">
              <h4>Adjustable Speed</h4>
              <p>Learners can slow down or speed up reading pace to match their comfort level, making learning less stressful.</p>
            </div>
            <div class="solution-feature">
              <h4>Multiple Languages</h4>
              <p>Content in isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, and more - allowing learners to start in their home language.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section text-center py-xl">
        <h2 class="cta-title">Ready to Start Learning?</h2>
        <p class="cta-text">
          Every person who learns to read can help teach others. Join us in building a more literate South Africa.
        </p>
        <NuxtLink to="/learn" class="btn btn-primary btn-lg">
          Start Learning Now
        </NuxtLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LITERACY_STATISTICS } from '~/types'

const literacyStats = LITERACY_STATISTICS
</script>

<style scoped>
.about-page {
  padding: var(--spacing-xl) 0;
}

.page-header {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.page-title {
  font-size: var(--font-size-2xl);
  color: var(--primary-color);
}

.content-card {
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-xl);
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.section-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
}

.section-text.large-text {
  font-size: var(--font-size-lg);
}

.section-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.crisis-card {
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  border-left: 6px solid var(--accent-red);
}

.crisis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.crisis-stat {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--accent-red);
  margin-bottom: var(--spacing-xs);
}

.stat-desc {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.causes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.cause-card {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.cause-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.cause-title {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
}

.cause-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.stats-table-wrapper {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-size: var(--font-size-sm);
}

.stats-table th,
.stats-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--bg-tertiary);
}

.stats-table th {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  font-weight: 500;
}

.stats-table tr.highlight {
  background-color: #fff3cd;
  font-weight: 500;
}

.stats-table tr.highlight td {
  color: var(--accent-red);
}

.stats-note {
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.source-item {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.source-item h4 {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.source-item p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

.solution-card {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-left: 6px solid var(--accent-green);
}

.solution-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.solution-feature {
  padding: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
}

.solution-feature h4 {
  font-size: var(--font-size-sm);
  color: var(--accent-green);
  margin-bottom: var(--spacing-xs);
}

.solution-feature p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

.cta-section {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-on-primary);
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl) 0;
}

.cta-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-on-primary);
}

.cta-text {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto var(--spacing-lg);
}

.cta-section .btn-primary {
  background-color: var(--secondary-color);
}

.cta-section .btn-primary:hover {
  background-color: var(--secondary-light);
}
</style>
