<script setup>
import { t } from '../i18n/index.js'
defineEmits(['close'])
</script>

<template>
  <div class="help-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" aria-labelledby="help-title">
    <div class="help-modal">
      <!-- Header -->
      <div class="help-header">
        <div class="help-header-left">
          <span class="material-symbols-outlined" style="font-size:24px;color:var(--primary);">help</span>
          <h2 id="help-title">{{ t('help.title') }}</h2>
        </div>
        <button class="help-close" @click="$emit('close')" :aria-label="t('help.closeLabel')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="help-body">
        <!-- Intro -->
        <p class="help-intro">{{ t('help.intro') }}</p>

        <!-- Workflow overview -->
        <div class="help-steps">
          <div class="help-step">
            <span class="help-step-number">1</span>
            <div>
              <strong>{{ t('help.step1Title') }}</strong>
              <p>{{ t('help.step1Desc') }}</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">2</span>
            <div>
              <strong>{{ t('help.step2Title') }}</strong>
              <p>{{ t('help.step2Desc') }}</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">3</span>
            <div>
              <strong>{{ t('help.step3Title') }}</strong>
              <p>{{ t('help.step3Desc') }}</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">4</span>
            <div>
              <strong>{{ t('help.step4Title') }}</strong>
              <p>{{ t('help.step4Desc') }}</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">5</span>
            <div>
              <strong>{{ t('help.step5Title') }}</strong>
              <p>{{ t('help.step5Desc') }}</p>
            </div>
          </div>
        </div>

        <div class="help-sections">
          <!-- Projects -->
          <details class="help-section" open>
            <summary class="help-section-title">
              <span class="material-symbols-outlined">folder_open</span>
              {{ t('help.secProjects') }}
            </summary>
            <div class="help-section-body">
              <ul>
                <li v-html="t('help.projLi1')"></li>
                <li v-html="t('help.projLi2')"></li>
                <li v-html="t('help.projLi3')"></li>
                <li v-html="t('help.projLi4')"></li>
                <li v-html="t('help.projLi5')"></li>
              </ul>
            </div>
          </details>

          <!-- Estimation -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">calculate</span>
              {{ t('help.secEstimation') }}
            </summary>
            <div class="help-section-body">
              <ul>
                <li v-html="t('help.estLi1')"></li>
                <li v-html="t('help.estLi2')"></li>
                <li v-html="t('help.estLi3')"></li>
                <li v-html="t('help.estLi4')"></li>
                <li v-html="t('help.estLi5')"></li>
                <li v-html="t('help.estLi6')"></li>
              </ul>
            </div>
          </details>

          <!-- Resources -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">groups</span>
              {{ t('help.secResources') }}
            </summary>
            <div class="help-section-body">
              <p><strong>{{ t('help.resRoles') }}</strong></p>
              <ul>
                <li v-html="t('help.resRolesLi1')"></li>
                <li v-html="t('help.resRolesLi2')"></li>
              </ul>
              <p style="margin-top:8px;"><strong>{{ t('help.resTaskTypes') }}</strong></p>
              <ul>
                <li v-html="t('help.resTaskTypesLi1')"></li>
                <li v-html="t('help.resTaskTypesLi2')"></li>
              </ul>
            </div>
          </details>

          <!-- Dashboard -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">dashboard</span>
              {{ t('help.secDashboard') }}
            </summary>
            <div class="help-section-body">
              <ul>
                <li v-html="t('help.dashLi1')"></li>
                <li v-html="t('help.dashLi2')"></li>
                <li v-html="t('help.dashLi3')"></li>
              </ul>
            </div>
          </details>

          <!-- Risks -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">warning</span>
              {{ t('help.secRisks') }}
            </summary>
            <div class="help-section-body">
              <ul>
                <li v-html="t('help.riskLi1')"></li>
                <li v-html="t('help.riskLi2')"></li>
                <li v-html="t('help.riskLi3')"></li>
              </ul>
            </div>
          </details>

          <!-- Import / Export -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">sync_alt</span>
              {{ t('help.secImportExport') }}
            </summary>
            <div class="help-section-body">
              <ul>
                <li v-html="t('help.ieLi1')"></li>
                <li v-html="t('help.ieLi2')"></li>
                <li v-html="t('help.ieLi3')"></li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      <!-- Footer -->
      <div class="help-footer">
        <button class="btn-primary" style="border-radius:10px;" @click="$emit('close')">
          {{ t('help.understood') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.help-modal {
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Header ── */
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--outline-variant);
  flex-shrink: 0;
}

.help-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-header-left h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.help-close {
  background: transparent;
  border: none;
  padding: 4px;
  color: var(--on-surface-variant);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
  display: flex;
  align-items: center;
}

.help-close:hover { background: var(--surface-container-high); }

/* ── Body ── */
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-intro {
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  background: var(--surface-container);
  border-radius: 12px;
  padding: 14px 16px;
}

/* ── Workflow Steps ── */
.help-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.help-step-number {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.help-step strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
  margin-bottom: 2px;
}

.help-step p {
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.5;
}

/* ── Accordion Sections ── */
.help-sections {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.help-section {
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  overflow: hidden;
}

.help-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  cursor: pointer;
  list-style: none;
  background: var(--surface-container-low);
  transition: background 0.15s;
  user-select: none;
}

.help-section-title::-webkit-details-marker { display: none; }

.help-section-title:hover {
  background: var(--surface-container);
}

.help-section-title .material-symbols-outlined {
  font-size: 18px;
  color: var(--primary);
}

details[open] .help-section-title {
  background: var(--surface-container);
  border-bottom: 1px solid var(--outline-variant);
}

.help-section-body {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.help-section-body ul {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.help-section-body li { list-style: disc; }

.help-section-body strong { color: var(--on-surface); }

.help-section-body code {
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 12px;
}

/* ── Footer ── */
.help-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--outline-variant);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
