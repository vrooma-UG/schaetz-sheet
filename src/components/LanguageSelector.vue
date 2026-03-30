<script setup>
import { SUPPORTED_LANGUAGES, currentLang, setLang } from '../i18n/index.js'
</script>

<template>
  <div class="lang-selector">
    <span class="lang-selector-label">
      <span class="material-symbols-outlined" style="font-size:15px;">language</span>
    </span>
    <div class="lang-options">
      <button
        v-for="lang in SUPPORTED_LANGUAGES"
        :key="lang.code"
        :class="['lang-btn', { active: currentLang === lang.code }]"
        @click="setLang(lang.code)"
        :title="lang.label"
      >
        {{ lang.flag }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--surface-container);
  border-radius: 12px;
  border: 1px solid var(--outline-variant);
}

.lang-selector-label {
  display: flex;
  align-items: center;
  color: var(--on-surface-variant);
}

.lang-options {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.lang-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 2px 4px;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.lang-btn:hover {
  background: var(--surface-container-high);
}

.lang-btn.active {
  background: var(--surface-container-highest);
  border-color: var(--outline-variant);
}
</style>
