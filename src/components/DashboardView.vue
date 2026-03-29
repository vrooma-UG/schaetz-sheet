<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(
  props.project.tasks,
  props.project.roles,
  props.project.taskTypes,
))

function fmtPT(val) {
  return Number(val || 0).toFixed(2)
}

function fmtCost(val) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val || 0)
}

function factorInfo(factor) {
  if (factor === null || factor === undefined) return null
  if (factor <= 0.25) return { label: 'Gut geschätzt', color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.5)  return { label: 'Akzeptabel',    color: '#65a30d', bg: '#ecfccb' }
  if (factor <= 1.0)  return { label: 'Kritisch',      color: '#d97706', bg: '#fef3c7' }
  return                      { label: 'Gefährlich',   color: '#dc2626', bg: '#fee2e2' }
}

// ── Bar chart helpers ────────────────────────────────────────────────────────
const BAR_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#d97706',
  '#dc2626', '#db2777', '#059669', '#6366f1', '#f97316',
]

function barChartData(obj) {
  const entries = Object.entries(obj).filter(([, v]) => v > 0)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return entries.map(([label, value], i) => ({
    label,
    value,
    pct: (value / max) * 100,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }))
}

const effortByPackage = computed(() => barChartData(agg.value.effortPerPackage))
const effortByType    = computed(() => barChartData(agg.value.effortPerType))
const costsByRole     = computed(() => barChartData(agg.value.costsPerRole))
const costsByType     = computed(() => barChartData(agg.value.costsPerType))

// ── Donut chart for effort split ─────────────────────────────────────────────
const DONUT_R = 60
const DONUT_CX = 80
const DONUT_CY = 80
const STROKE = 24

function donutSlices(values) {
  const total = values.reduce((s, v) => s + v.value, 0)
  if (!total) return []
  const circumference = 2 * Math.PI * DONUT_R
  let offset = 0
  return values.map((v, i) => {
    const dash = (v.value / total) * circumference
    const slice = { ...v, dash, gap: circumference - dash, offset, pct: ((v.value / total) * 100).toFixed(1) }
    offset += dash
    return slice
  })
}

const effortSplitSlices = computed(() => {
  const mandatory = agg.value.totals.ohneOptional.mittel
  const optional  = agg.value.totals.nurOptional.mittel
  return donutSlices([
    { label: 'Pflicht', value: mandatory, color: '#2563eb' },
    { label: 'Optional', value: optional, color: '#7c3aed' },
  ])
})
</script>

<template>
  <div class="dashboard">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">schedule</span>
        <div>
          <p class="kpi-label">Gesamtaufwand (Mittel)</p>
          <p class="kpi-value">{{ fmtPT(agg.totalEffort) }} PT</p>
        </div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">euro</span>
        <div>
          <p class="kpi-label">Gesamtkosten</p>
          <p class="kpi-value">{{ fmtCost(agg.totalCosts) }}</p>
        </div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">task_alt</span>
        <div>
          <p class="kpi-label">Aufgaben gesamt</p>
          <p class="kpi-value">{{ project.tasks.length }}</p>
        </div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">trending_up</span>
        <div>
          <p class="kpi-label">Ø Schätzfaktor</p>
          <p
            class="kpi-value"
            :style="factorInfo(agg.avgFactor) ? { color: factorInfo(agg.avgFactor).color } : {}"
          >
            <template v-if="agg.avgFactor !== null">
              {{ agg.avgFactor.toFixed(2) }}
              <span
                class="factor-badge"
                :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color, marginLeft: '6px' }"
              >{{ factorInfo(agg.avgFactor).label }}</span>
            </template>
            <template v-else>—</template>
          </p>
        </div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">lock</span>
        <div>
          <p class="kpi-label">Pflichtaufwand (Mittel)</p>
          <p class="kpi-value">{{ fmtPT(agg.totals.ohneOptional.mittel) }} PT</p>
        </div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon material-symbols-outlined">add_circle</span>
        <div>
          <p class="kpi-label">Optionaler Aufwand</p>
          <p class="kpi-value">{{ fmtPT(agg.optionalEffort) }} PT</p>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="charts-grid">
      <!-- Effort by Package -->
      <div class="chart-card">
        <h3 class="chart-title">Aufwand je Paket (PT)</h3>
        <div v-if="effortByPackage.length" class="bar-chart">
          <div v-for="item in effortByPackage" :key="item.label" class="bar-row">
            <span class="bar-label" :title="item.label">{{ item.label || '(kein Paket)' }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
            </div>
            <span class="bar-value">{{ fmtPT(item.value) }}</span>
          </div>
        </div>
        <p v-else class="chart-empty">Keine Daten</p>
      </div>

      <!-- Effort by Type -->
      <div class="chart-card">
        <h3 class="chart-title">Aufwand je Typ (PT)</h3>
        <div v-if="effortByType.length" class="bar-chart">
          <div v-for="item in effortByType" :key="item.label" class="bar-row">
            <span class="bar-label" :title="item.label">{{ item.label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
            </div>
            <span class="bar-value">{{ fmtPT(item.value) }}</span>
          </div>
        </div>
        <p v-else class="chart-empty">Keine Daten</p>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="charts-grid">
      <!-- Costs by Role -->
      <div class="chart-card">
        <h3 class="chart-title">Kosten je Rolle (€)</h3>
        <div v-if="costsByRole.length" class="bar-chart">
          <div v-for="item in costsByRole" :key="item.label" class="bar-row">
            <span class="bar-label" :title="item.label">{{ item.label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
            </div>
            <span class="bar-value">{{ fmtCost(item.value) }}</span>
          </div>
        </div>
        <p v-else class="chart-empty">Keine Daten</p>
      </div>

      <!-- Costs by Type -->
      <div class="chart-card">
        <h3 class="chart-title">Kosten je Typ (€)</h3>
        <div v-if="costsByType.length" class="bar-chart">
          <div v-for="item in costsByType" :key="item.label" class="bar-row">
            <span class="bar-label" :title="item.label">{{ item.label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
            </div>
            <span class="bar-value">{{ fmtCost(item.value) }}</span>
          </div>
        </div>
        <p v-else class="chart-empty">Keine Daten</p>
      </div>
    </div>

    <!-- Effort Split Donut + Summary -->
    <div class="charts-grid">
      <div class="chart-card donut-card">
        <h3 class="chart-title">Pflicht vs. Optional</h3>
        <div class="donut-wrap">
          <svg :width="DONUT_CX * 2" :height="DONUT_CY * 2" style="overflow:visible">
            <circle
              :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
              fill="none" stroke="var(--outline-variant)" :stroke-width="STROKE"
            />
            <circle
              v-for="(s, i) in effortSplitSlices" :key="i"
              :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
              fill="none"
              :stroke="s.color"
              :stroke-width="STROKE"
              :stroke-dasharray="`${s.dash} ${s.gap}`"
              :stroke-dashoffset="-s.offset"
              stroke-linecap="butt"
              style="transform:rotate(-90deg);transform-origin:50% 50%"
            />
            <text :x="DONUT_CX" :y="DONUT_CY - 6" text-anchor="middle" font-size="13" font-weight="700" fill="var(--on-surface)">{{ fmtPT(agg.totalEffort) }}</text>
            <text :x="DONUT_CX" :y="DONUT_CY + 12" text-anchor="middle" font-size="10" fill="var(--on-surface-variant)">PT gesamt</text>
          </svg>
          <div class="donut-legend">
            <div v-for="s in effortSplitSlices" :key="s.label" class="legend-item">
              <span class="legend-dot" :style="{ background: s.color }"></span>
              <span>{{ s.label }}</span>
              <span class="legend-pct">{{ s.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Schätzfaktor Summary -->
      <div class="chart-card">
        <h3 class="chart-title">Schätzfaktor Überblick</h3>
        <div class="factor-summary">
          <div class="factor-row">
            <span>Gesamt</span>
            <span
              v-if="agg.avgFactor !== null"
              class="factor-badge"
              :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }"
            >{{ agg.avgFactor.toFixed(2) }} — {{ factorInfo(agg.avgFactor).label }}</span>
            <span v-else style="color:var(--outline)">—</span>
          </div>
          <div class="factor-row">
            <span>Pflichtaufgaben</span>
            <span
              v-if="agg.avgFactorMandatory !== null"
              class="factor-badge"
              :style="{ background: factorInfo(agg.avgFactorMandatory).bg, color: factorInfo(agg.avgFactorMandatory).color }"
            >{{ agg.avgFactorMandatory.toFixed(2) }} — {{ factorInfo(agg.avgFactorMandatory).label }}</span>
            <span v-else style="color:var(--outline)">—</span>
          </div>
          <div class="factor-row">
            <span>Optionale Aufgaben</span>
            <span
              v-if="agg.avgFactorOptional !== null"
              class="factor-badge"
              :style="{ background: factorInfo(agg.avgFactorOptional).bg, color: factorInfo(agg.avgFactorOptional).color }"
            >{{ agg.avgFactorOptional.toFixed(2) }} — {{ factorInfo(agg.avgFactorOptional).label }}</span>
            <span v-else style="color:var(--outline)">—</span>
          </div>
          <div class="factor-legend" style="margin-top:16px;">
            <p class="legend-title">Legende</p>
            <div class="factor-row"><span class="factor-badge" style="background:#dcfce7;color:#16a34a;">≤ 0.25 — Gut geschätzt</span></div>
            <div class="factor-row"><span class="factor-badge" style="background:#ecfccb;color:#65a30d;">≤ 0.50 — Akzeptabel</span></div>
            <div class="factor-row"><span class="factor-badge" style="background:#fef3c7;color:#d97706;">≤ 1.00 — Kritisch</span></div>
            <div class="factor-row"><span class="factor-badge" style="background:#fee2e2;color:#dc2626;">&gt; 1.00 — Gefährlich</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.kpi-icon {
  font-size: 28px;
  color: var(--primary);
  background: var(--primary-container);
  border-radius: 10px;
  padding: 8px;
  flex-shrink: 0;
}

.kpi-label {
  font-size: 11px;
  color: var(--on-surface-variant);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .charts-grid { grid-template-columns: 1fr; }
}

.chart-card {
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 16px;
  padding: 20px;
}

.chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 16px;
}

.chart-empty {
  font-size: 12px;
  color: var(--outline);
  text-align: center;
  padding: 20px 0;
}

/* Bar chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 120px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 14px;
  background: var(--surface-container);
  border-radius: 7px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.4s ease;
}

.bar-value {
  width: 80px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  color: var(--on-surface);
}

/* Donut */
.donut-card { display: flex; flex-direction: column; }

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-pct {
  font-weight: 600;
  color: var(--on-surface);
  margin-left: auto;
}

/* Factor summary */
.factor-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.factor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: var(--on-surface-variant);
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 8px;
}
</style>
