<script setup>
import { computed } from 'vue'
import { createRisk } from '../models/index.js'

const props = defineProps({ project: Object })

function addRisk() {
  if (!props.project.risks) props.project.risks = []
  props.project.risks.push(createRisk('Neues Risiko'))
}

function removeRisk(id) {
  const idx = props.project.risks.findIndex(r => r.id === id)
  if (idx !== -1) props.project.risks.splice(idx, 1)
}

const CATEGORIES = [
  { value: 'technical',       label: 'Technisch' },
  { value: 'organizational',  label: 'Organisatorisch' },
  { value: 'external',        label: 'Extern' },
  { value: 'financial',       label: 'Finanziell' },
]

const STATUSES = [
  { value: 'open',       label: 'Offen' },
  { value: 'mitigated',  label: 'Mitigiert' },
  { value: 'closed',     label: 'Geschlossen' },
]

// Eintrittswahrscheinlichkeit levels
const PROBABILITY_LEVELS = [
  { value: 'low',    label: 'Niedrig', pct: 20,  color: '#16a34a', bg: '#dcfce7' },
  { value: 'medium', label: 'Mittel',  pct: 50,  color: '#d97706', bg: '#fef3c7' },
  { value: 'high',   label: 'Hoch',   pct: 80,  color: '#dc2626', bg: '#fee2e2' },
]

// Auswirkung levels (in PT)
const IMPACT_LEVELS = [
  { value: 'low',    label: 'Niedrig', pt: 2,   color: '#16a34a', bg: '#dcfce7' },
  { value: 'medium', label: 'Mittel',  pt: 5,   color: '#d97706', bg: '#fef3c7' },
  { value: 'high',   label: 'Hoch',   pt: 10,  color: '#dc2626', bg: '#fee2e2' },
]

function probInfo(val) {
  return PROBABILITY_LEVELS.find(l => l.value === val) ?? PROBABILITY_LEVELS[0]
}

function impactInfo(val) {
  return IMPACT_LEVELS.find(l => l.value === val) ?? IMPACT_LEVELS[0]
}

function fmtPT(val) {
  return Number(val || 0).toFixed(2)
}

// Expected buffer = (probability % / 100) * impact PT
const risks = computed(() => {
  if (!props.project.risks) return []
  return props.project.risks.map(r => {
    const prob = probInfo(r.probability)
    const imp  = impactInfo(r.impact)
    return {
      ...r,
      expectedImpact: ((prob.pct / 100) * imp.pt).toFixed(2),
    }
  })
})

const totalExpectedImpact = computed(() =>
  risks.value.reduce((s, r) => s + Number(r.expectedImpact), 0)
)

const openRisks = computed(() => risks.value.filter(r => r.status === 'open').length)
</script>

<template>
  <div class="risk-manager">
    <!-- Summary bar -->
    <div class="risk-summary">
      <div class="risk-kpi">
        <span class="material-symbols-outlined" style="color:#dc2626;">warning</span>
        <div>
          <p class="risk-kpi-label">Offene Risiken</p>
          <p class="risk-kpi-value">{{ openRisks }}</p>
        </div>
      </div>
      <div class="risk-kpi">
        <span class="material-symbols-outlined" style="color:#d97706;">exposure</span>
        <div>
          <p class="risk-kpi-label">Erwarteter Puffer (PT)</p>
          <p class="risk-kpi-value">{{ fmtPT(totalExpectedImpact) }} PT</p>
        </div>
      </div>
      <div class="risk-kpi" style="margin-left:auto;">
        <button class="btn-primary" style="border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;" @click="addRisk">
          <span class="material-symbols-outlined" style="font-size:16px;">add</span>
          Risiko
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Beschreibung</th>
              <th>Kategorie</th>
              <th>Eintrittswahrscheinlichkeit</th>
              <th>Auswirkung</th>
              <th>Erwarteter Puffer (PT)</th>
              <th>Status</th>
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
                <div class="level-cell">
                  <select v-model="project.risks.find(r => r.id === risk.id).probability">
                    <option v-for="l in PROBABILITY_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
                  </select>
                  <span
                    class="factor-badge"
                    :style="{ background: probInfo(risk.probability).bg, color: probInfo(risk.probability).color }"
                  >{{ probInfo(risk.probability).pct }}%</span>
                </div>
              </td>
              <td>
                <div class="level-cell">
                  <select v-model="project.risks.find(r => r.id === risk.id).impact">
                    <option v-for="l in IMPACT_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
                  </select>
                  <span
                    class="factor-badge"
                    :style="{ background: impactInfo(risk.impact).bg, color: impactInfo(risk.impact).color }"
                  >{{ impactInfo(risk.impact).pt }} PT</span>
                </div>
              </td>
              <td class="calc bold">{{ risk.expectedImpact }}</td>
              <td>
                <select v-model="project.risks.find(r => r.id === risk.id).status">
                  <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </td>
              <td>
                <button class="danger" @click="removeRisk(risk.id)" style="padding:4px 6px;">
                  <span class="material-symbols-outlined" style="font-size:15px;">close</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!risks.length" style="padding:40px;text-align:center;color:var(--outline);">
        <span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.4;">warning</span>
        Keine Risiken erfasst. Klicke auf „Risiko" um zu beginnen.
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

.level-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
