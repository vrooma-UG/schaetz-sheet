<script setup>
import { computed } from 'vue'
import { createRisk } from '../models/index.js'
import { t } from '../i18n/index.js'

const props = defineProps({ project: Object })

function addRisk() {
  if (!props.project.risks) props.project.risks = []
  props.project.risks.push(createRisk(t('risks.defaultName')))
}

function removeRisk(id) {
  const idx = props.project.risks.findIndex(r => r.id === id)
  if (idx !== -1) props.project.risks.splice(idx, 1)
}

const CATEGORIES = computed(() => [
  { value: 'technical',       label: t('risks.catTechnical') },
  { value: 'organizational',  label: t('risks.catOrganizational') },
  { value: 'external',        label: t('risks.catExternal') },
  { value: 'financial',       label: t('risks.catFinancial') },
])

const STATUSES = computed(() => [
  { value: 'open',       label: t('risks.statusOpen') },
  { value: 'mitigated',  label: t('risks.statusMitigated') },
  { value: 'closed',     label: t('risks.statusClosed') },
])

const PROBABILITY_LEVELS = computed(() => [
  { value: 'low',    label: t('risks.probLow') },
  { value: 'medium', label: t('risks.probMedium') },
  { value: 'high',   label: t('risks.probHigh') },
])

const IMPACT_LEVELS = computed(() => [
  { value: 'low',    label: t('risks.impactLow') },
  { value: 'medium', label: t('risks.impactMedium') },
  { value: 'high',   label: t('risks.impactHigh') },
])

const risks = computed(() => {
  if (!props.project.risks) return []
  return props.project.risks
})

const openRisks = computed(() => risks.value.filter(r => r.status === 'open').length)
</script>

<template>
  <div class="risk-manager">
    <!-- Summary bar -->
    <div class="risk-summary">
      <div class="risk-kpi">
        <span class="material-symbols-outlined" style="color:#dc2626;">warning</span>
        <div>
          <p class="risk-kpi-label">{{ t('risks.title') }}</p>
          <p class="risk-kpi-value">{{ openRisks }}</p>
        </div>
      </div>
      <div style="margin-left:auto;">
        <button @click="addRisk" :aria-label="t('risks.addRisk')">
          <span class="material-symbols-outlined" style="font-size:15px;">add</span>
          {{ t('risks.addRisk') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ t('risks.colName') }}</th>
              <th>{{ t('risks.colDescription') }}</th>
              <th>{{ t('risks.colCategory') }}</th>
              <th>{{ t('risks.colProbability') }}</th>
              <th>{{ t('risks.colImpact') }}</th>
              <th>{{ t('risks.colStatus') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="risk in risks" :key="risk.id">
              <td>
                <input v-model="project.risks.find(r => r.id === risk.id).name" style="min-width:160px" />
              </td>
              <td>
                <textarea
                  v-model="project.risks.find(r => r.id === risk.id).description"
                  rows="2"
                  style="min-width:200px"
                />
              </td>
              <td>
                <select v-model="project.risks.find(r => r.id === risk.id).category">
                  <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </td>
              <td>
                <select v-model="project.risks.find(r => r.id === risk.id).probability">
                  <option v-for="l in PROBABILITY_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
              </td>
              <td>
                <select v-model="project.risks.find(r => r.id === risk.id).impact">
                  <option v-for="l in IMPACT_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
              </td>
              <td>
                <select v-model="project.risks.find(r => r.id === risk.id).status">
                  <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </td>
              <td>
                <button class="danger" @click="removeRisk(risk.id)" style="padding:4px 6px;">
                  <span class="material-symbols-outlined" style="font-size:15px;">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!risks.length" style="padding:40px;text-align:center;color:var(--outline);">
        <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.4;">warning</span>
        {{ t('risks.empty') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.risk-manager {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.risk-kpi {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  padding: 14px 18px;
}

.risk-kpi .material-symbols-outlined { font-size: 24px; }

.risk-kpi-label {
  font-size: 11px;
  color: var(--on-surface-variant);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
}
</style>
