<script setup>
import { computed } from 'vue'
import { calcAggregations, calcTaskMetrics } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(
  props.project.tasks,
  props.project.roles,
  props.project.taskTypes,
))

const enrichedTasks = computed(() =>
  props.project.tasks.map(task => ({
    task,
    ...calcTaskMetrics(task, props.project.roles, props.project.taskTypes),
  }))
)

function fmtPT(val) {
  return Number(val || 0).toFixed(2)
}

function fmtCost(val) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val || 0)
}

function fmtNum(val) {
  if (val === null || val === undefined) return '—'
  return typeof val === 'number' ? val.toFixed(2) : val
}

function factorInfo(factor) {
  if (factor === null || factor === undefined) return null
  if (factor <= 0.3) return { label: 'Sehr Gut',    color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.5) return { label: 'Gut',         color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.8) return { label: 'Akzeptabel',  color: '#65a30d', bg: '#ecfccb' }
  if (factor <= 1.0) return { label: 'Kritisch',    color: '#d97706', bg: '#fef3c7' }
  return                     { label: 'Gefährlich', color: '#dc2626', bg: '#fee2e2' }
}

function formatDate(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function roleName(roleId) {
  return props.project.roles.find(r => r.id === roleId)?.name ?? '—'
}

function typeName(typeId) {
  return props.project.taskTypes.find(t => t.id === typeId)?.name ?? '—'
}

function totalMarkup(type) {
  return (type.pm || 0) + (type.testing || 0) + (type.risk || 0) + (type.docs || 0) + (type.warranty || 0)
}

// ── Bar chart helpers ──────────────────────────────────────────────────────────
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
const effortByRole    = computed(() => barChartData(agg.value.effortPerRole))
const costsByRole     = computed(() => barChartData(agg.value.costsPerRole))
const costsByType     = computed(() => barChartData(agg.value.costsPerType))
const costsByPackage  = computed(() => barChartData(agg.value.costsPerPackage))

// ── Donut chart helpers ────────────────────────────────────────────────────────
const DONUT_R = 60
const DONUT_CX = 80
const DONUT_CY = 80
const STROKE = 24

function donutSlices(values) {
  const total = values.reduce((s, v) => s + v.value, 0)
  if (!total) return []
  const circumference = 2 * Math.PI * DONUT_R
  let offset = 0
  return values.map((v) => {
    const dash = (v.value / total) * circumference
    const slice = { ...v, dash, gap: circumference - dash, offset, pct: ((v.value / total) * 100).toFixed(1) }
    offset += dash
    return slice
  })
}

const effortSplitSlices = computed(() => donutSlices([
  { label: 'Pflicht',   value: agg.value.totals.ohneOptional.mittel, color: '#2563eb' },
  { label: 'Optional',  value: agg.value.totals.nurOptional.mittel,  color: '#7c3aed' },
]))

const effortByTypeSlices = computed(() => {
  const entries = Object.entries(agg.value.effortPerType).filter(([, v]) => v > 0)
  return donutSlices(entries.map(([label, value], i) => ({ label, value, color: BAR_COLORS[i % BAR_COLORS.length] })))
})

const costsByRoleSlices = computed(() => {
  const entries = Object.entries(agg.value.costsPerRole).filter(([, v]) => v > 0)
  return donutSlices(entries.map(([label, value], i) => ({ label, value, color: BAR_COLORS[i % BAR_COLORS.length] })))
})

const risks = computed(() => props.project.risks ?? [])

const CATEGORIES = {
  technical:      'Technisch',
  organizational: 'Organisatorisch',
  external:       'Extern',
  financial:      'Finanziell',
}
const PROB_LABELS = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' }
const IMPACT_LABELS = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' }
const STATUS_LABELS = { open: 'Offen', mitigated: 'Mitigiert', closed: 'Geschlossen' }
const STATUS_COLORS = {
  open:      { color: '#dc2626', bg: '#fee2e2' },
  mitigated: { color: '#d97706', bg: '#fef3c7' },
  closed:    { color: '#16a34a', bg: '#dcfce7' },
}
</script>

<template>
  <div class="pdf-report">

    <!-- ═══ SECTION 1: SCHÄTZUNG ═══════════════════════════════════════════════ -->
    <div class="pdf-section">
      <div class="section-header" style="background:#2563eb;">
        <div class="section-header-inner">
          <span class="section-number">01</span>
          <div>
            <h2 class="section-title">Schätzung</h2>
            <p class="section-subtitle">{{ project.name }}</p>
          </div>
          <span class="section-date">{{ formatDate(project.createdAt) }}</span>
        </div>
      </div>

      <div class="section-body">
        <!-- KPI Summary Row -->
        <div class="kpi-row" style="margin-bottom:28px;">
          <div class="kpi-box" style="border-color:#bfdbfe;background:#eff6ff;">
            <p class="kpi-label">Pflichtaufwand</p>
            <p class="kpi-val" style="color:#2563eb;">{{ fmtPT(agg.totals.ohneOptional.mittel) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.mandatoryCosts) }}</p>
          </div>
          <div class="kpi-box" style="border-color:#ddd6fe;background:#f5f3ff;">
            <p class="kpi-label">Optional Aufwand</p>
            <p class="kpi-val" style="color:#7c3aed;">{{ fmtPT(agg.optionalEffort) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.optionalCosts) }}</p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Aufgaben gesamt</p>
            <p class="kpi-val">{{ project.tasks.length }}</p>
            <p class="kpi-sub">
              <span style="background:#dbeafe;color:#1d4ed8;border-radius:5px;padding:1px 6px;margin-right:4px;font-size:11px;">{{ agg.mandatoryTaskCount }} Pflicht</span>
              <span style="background:#ede9fe;color:#6d28d9;border-radius:5px;padding:1px 6px;font-size:11px;">{{ agg.optionalTaskCount }} Optional</span>
            </p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Gesamtaufwand (Mittel)</p>
            <p class="kpi-val">{{ fmtPT(agg.totalEffort) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.totalCosts) }}</p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Ø Schätzfaktor</p>
            <p class="kpi-val"
              :style="factorInfo(agg.avgFactor) ? { color: factorInfo(agg.avgFactor).color } : {}">
              <template v-if="agg.avgFactor !== null">
                {{ agg.avgFactor.toFixed(2) }}
                <span class="factor-badge"
                  :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }">
                  {{ factorInfo(agg.avgFactor).label }}
                </span>
              </template>
              <template v-else>—</template>
            </p>
          </div>
        </div>

        <!-- Task Table -->
        <h3 class="table-heading">Aufgabenmatrix</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Paket</th>
              <th>Aufgabe</th>
              <th style="min-width:200px;">Beschreibung</th>
              <th>Rolle</th>
              <th>Typ</th>
              <th style="text-align:right;">Opt</th>
              <th style="text-align:right;">Pess</th>
              <th style="text-align:right;">MW</th>
              <th style="text-align:right;">Gesamt PT</th>
              <th style="text-align:right;">Kosten</th>
              <th style="text-align:right;">Faktor</th>
              <th>Optional</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ task, mw, totalEffort, costs, factor } in enrichedTasks" :key="task.id">
              <td>{{ task.package || '—' }}</td>
              <td>{{ task.name || '—' }}</td>
              <td style="white-space:pre-wrap;word-break:break-word;">{{ task.description || '' }}</td>
              <td>{{ roleName(task.roleId) }}</td>
              <td>{{ typeName(task.typeId) }}</td>
              <td style="text-align:right;">{{ fmtNum(task.opt) }}</td>
              <td style="text-align:right;">{{ fmtNum(task.pess) }}</td>
              <td style="text-align:right;">{{ fmtNum(mw) }}</td>
              <td style="text-align:right;font-weight:600;">{{ fmtNum(totalEffort) }}</td>
              <td style="text-align:right;font-weight:600;">{{ fmtCost(costs) }}</td>
              <td style="text-align:right;">
                <template v-if="factor !== null">
                  <span class="factor-badge"
                    :style="{ background: factorInfo(factor).bg, color: factorInfo(factor).color }">
                    {{ factor.toFixed(2) }}
                  </span>
                </template>
                <template v-else>—</template>
              </td>
              <td>
                <span v-if="task.optional" style="background:#ede9fe;color:#6d28d9;border-radius:5px;padding:1px 6px;font-size:11px;">Ja</span>
                <span v-else style="background:#dbeafe;color:#1d4ed8;border-radius:5px;padding:1px 6px;font-size:11px;">Nein</span>
              </td>
            </tr>
            <tr v-if="!project.tasks.length">
              <td colspan="12" style="text-align:center;color:#94a3b8;padding:20px;">Keine Aufgaben erfasst.</td>
            </tr>
          </tbody>
          <tfoot v-if="project.tasks.length">
            <tr style="background:#f1f5f9;font-weight:700;">
              <td colspan="8" style="text-align:right;padding-right:8px;">Summe</td>
              <td style="text-align:right;">{{ fmtNum(agg.totalEffort) }}</td>
              <td style="text-align:right;">{{ fmtCost(agg.totalCosts) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ═══ SECTION 2: DASHBOARD ════════════════════════════════════════════════ -->
    <div class="pdf-section">
      <div class="section-header" style="background:#0891b2;">
        <div class="section-header-inner">
          <span class="section-number">02</span>
          <div>
            <h2 class="section-title">Dashboard</h2>
            <p class="section-subtitle">{{ project.name }}</p>
          </div>
        </div>
      </div>

      <div class="section-body">
        <!-- KPI Cards -->
        <div class="kpi-grid-6">
          <div class="kpi-box" style="border-color:#bfdbfe;background:#eff6ff;">
            <p class="kpi-label">Pflichtaufwand</p>
            <p class="kpi-val" style="color:#2563eb;">{{ fmtPT(agg.totals.ohneOptional.mittel) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.mandatoryCosts) }}</p>
          </div>
          <div class="kpi-box" style="border-color:#ddd6fe;background:#f5f3ff;">
            <p class="kpi-label">Optional Aufwand</p>
            <p class="kpi-val" style="color:#7c3aed;">{{ fmtPT(agg.optionalEffort) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.optionalCosts) }}</p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Aufgaben gesamt</p>
            <p class="kpi-val">{{ project.tasks.length }}</p>
            <p class="kpi-sub">
              <span style="background:#dbeafe;color:#1d4ed8;border-radius:5px;padding:1px 6px;margin-right:3px;font-size:11px;">{{ agg.mandatoryTaskCount }} Pflicht</span>
              <span style="background:#ede9fe;color:#6d28d9;border-radius:5px;padding:1px 6px;font-size:11px;">{{ agg.optionalTaskCount }} Opt.</span>
            </p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Gesamtaufwand</p>
            <p class="kpi-val">{{ fmtPT(agg.totalEffort) }} PT</p>
            <p class="kpi-sub">{{ fmtCost(agg.totalCosts) }}</p>
          </div>
          <div class="kpi-box">
            <p class="kpi-label">Ø Schätzfaktor</p>
            <p class="kpi-val"
              :style="factorInfo(agg.avgFactor) ? { color: factorInfo(agg.avgFactor).color } : {}">
              <template v-if="agg.avgFactor !== null">
                {{ agg.avgFactor.toFixed(2) }}
                <span class="factor-badge"
                  :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }">
                  {{ factorInfo(agg.avgFactor).label }}
                </span>
              </template>
              <template v-else>—</template>
            </p>
          </div>
          <div class="kpi-box" style="border-color:#fecaca;background:#fff1f2;">
            <p class="kpi-label">Offene Risiken</p>
            <p class="kpi-val" style="color:#dc2626;">{{ risks.filter(r => r.status === 'open').length }}</p>
            <p class="kpi-sub">{{ risks.length }} gesamt</p>
          </div>
        </div>

        <!-- Bar Charts Row 1: Effort + Costs by Package -->
        <div class="charts-row">
          <div class="chart-box">
            <h4 class="chart-title">Aufwand je Paket (PT)</h4>
            <div v-if="effortByPackage.length" class="bar-chart">
              <div v-for="item in effortByPackage" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label || '(kein Paket)' }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtPT(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Kosten je Paket (€)</h4>
            <div v-if="costsByPackage.length" class="bar-chart">
              <div v-for="item in costsByPackage" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label || '(kein Paket)' }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtCost(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
        </div>

        <!-- Bar Charts Row 2: by Type -->
        <div class="charts-row">
          <div class="chart-box">
            <h4 class="chart-title">Aufwand je Typ (PT)</h4>
            <div v-if="effortByType.length" class="bar-chart">
              <div v-for="item in effortByType" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtPT(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Kosten je Typ (€)</h4>
            <div v-if="costsByType.length" class="bar-chart">
              <div v-for="item in costsByType" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtCost(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
        </div>

        <!-- Bar Charts Row 3: by Role -->
        <div class="charts-row">
          <div class="chart-box">
            <h4 class="chart-title">Aufwand je Rolle (PT)</h4>
            <div v-if="effortByRole.length" class="bar-chart">
              <div v-for="item in effortByRole" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtPT(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Kosten je Rolle (€)</h4>
            <div v-if="costsByRole.length" class="bar-chart">
              <div v-for="item in costsByRole" :key="item.label" class="bar-row">
                <span class="bar-label">{{ item.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
                <span class="bar-value">{{ fmtCost(item.value) }}</span>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
        </div>

        <!-- Donut Charts Row -->
        <div class="charts-row charts-row--3">
          <!-- Pflicht vs. Optional -->
          <div class="chart-box donut-box">
            <h4 class="chart-title">Pflicht vs. Optional (PT)</h4>
            <div class="donut-wrap">
              <svg :width="DONUT_CX * 2" :height="DONUT_CY * 2" style="overflow:visible;flex-shrink:0;">
                <circle :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" stroke="#cbd5e1" :stroke-width="STROKE" />
                <circle v-for="(s, i) in effortSplitSlices" :key="i"
                  :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" :stroke="s.color" :stroke-width="STROKE"
                  :stroke-dasharray="`${s.dash} ${s.gap}`"
                  :stroke-dashoffset="-s.offset"
                  stroke-linecap="butt"
                  style="transform:rotate(-90deg);transform-origin:50% 50%" />
                <text :x="DONUT_CX" :y="DONUT_CY - 6" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">{{ fmtPT(agg.totalEffort) }}</text>
                <text :x="DONUT_CX" :y="DONUT_CY + 12" text-anchor="middle" font-size="10" fill="#64748b">PT gesamt</text>
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

          <!-- Aufwand je Typ donut -->
          <div class="chart-box donut-box">
            <h4 class="chart-title">Aufwand je Typ (PT)</h4>
            <div class="donut-wrap" v-if="effortByTypeSlices.length">
              <svg :width="DONUT_CX * 2" :height="DONUT_CY * 2" style="overflow:visible;flex-shrink:0;">
                <circle :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" stroke="#cbd5e1" :stroke-width="STROKE" />
                <circle v-for="(s, i) in effortByTypeSlices" :key="i"
                  :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" :stroke="s.color" :stroke-width="STROKE"
                  :stroke-dasharray="`${s.dash} ${s.gap}`"
                  :stroke-dashoffset="-s.offset"
                  stroke-linecap="butt"
                  style="transform:rotate(-90deg);transform-origin:50% 50%" />
                <text :x="DONUT_CX" :y="DONUT_CY - 6" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">{{ fmtPT(agg.totalEffort) }}</text>
                <text :x="DONUT_CX" :y="DONUT_CY + 12" text-anchor="middle" font-size="10" fill="#64748b">PT gesamt</text>
              </svg>
              <div class="donut-legend">
                <div v-for="s in effortByTypeSlices" :key="s.label" class="legend-item">
                  <span class="legend-dot" :style="{ background: s.color }"></span>
                  <span>{{ s.label }}</span>
                  <span class="legend-pct">{{ s.pct }}%</span>
                </div>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>

          <!-- Kosten je Rolle donut -->
          <div class="chart-box donut-box">
            <h4 class="chart-title">Kosten je Rolle (€)</h4>
            <div class="donut-wrap" v-if="costsByRoleSlices.length">
              <svg :width="DONUT_CX * 2" :height="DONUT_CY * 2" style="overflow:visible;flex-shrink:0;">
                <circle :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" stroke="#cbd5e1" :stroke-width="STROKE" />
                <circle v-for="(s, i) in costsByRoleSlices" :key="i"
                  :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" :stroke="s.color" :stroke-width="STROKE"
                  :stroke-dasharray="`${s.dash} ${s.gap}`"
                  :stroke-dashoffset="-s.offset"
                  stroke-linecap="butt"
                  style="transform:rotate(-90deg);transform-origin:50% 50%" />
                <text :x="DONUT_CX" :y="DONUT_CY - 6" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">{{ fmtCost(agg.totalCosts) }}</text>
                <text :x="DONUT_CX" :y="DONUT_CY + 12" text-anchor="middle" font-size="10" fill="#64748b">gesamt</text>
              </svg>
              <div class="donut-legend">
                <div v-for="s in costsByRoleSlices" :key="s.label" class="legend-item">
                  <span class="legend-dot" :style="{ background: s.color }"></span>
                  <span>{{ s.label }}</span>
                  <span class="legend-pct">{{ s.pct }}%</span>
                </div>
              </div>
            </div>
            <p v-else class="chart-empty">Keine Daten</p>
          </div>
        </div>

        <!-- Schätzfaktor Summary -->
        <div class="charts-row">
          <div class="chart-box">
            <h4 class="chart-title">Schätzfaktor Überblick</h4>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
              <div class="factor-row">
                <span style="color:#64748b;font-size:13px;">Gesamt</span>
                <span v-if="agg.avgFactor !== null" class="factor-badge"
                  :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }">
                  {{ agg.avgFactor.toFixed(2) }} — {{ factorInfo(agg.avgFactor).label }}
                </span>
                <span v-else style="color:#94a3b8;">—</span>
              </div>
              <div class="factor-row">
                <span style="color:#64748b;font-size:13px;">Pflichtaufgaben</span>
                <span v-if="agg.avgFactorMandatory !== null" class="factor-badge"
                  :style="{ background: factorInfo(agg.avgFactorMandatory).bg, color: factorInfo(agg.avgFactorMandatory).color }">
                  {{ agg.avgFactorMandatory.toFixed(2) }} — {{ factorInfo(agg.avgFactorMandatory).label }}
                </span>
                <span v-else style="color:#94a3b8;">—</span>
              </div>
              <div class="factor-row">
                <span style="color:#64748b;font-size:13px;">Optionale Aufgaben</span>
                <span v-if="agg.avgFactorOptional !== null" class="factor-badge"
                  :style="{ background: factorInfo(agg.avgFactorOptional).bg, color: factorInfo(agg.avgFactorOptional).color }">
                  {{ agg.avgFactorOptional.toFixed(2) }} — {{ factorInfo(agg.avgFactorOptional).label }}
                </span>
                <span v-else style="color:#94a3b8;">—</span>
              </div>
            </div>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Legende Schätzfaktor</h4>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
              <div><span class="factor-badge" style="background:#dcfce7;color:#16a34a;">≤ 0.30 — Sehr Gut</span></div>
              <div><span class="factor-badge" style="background:#dcfce7;color:#16a34a;">≤ 0.50 — Gut</span></div>
              <div><span class="factor-badge" style="background:#ecfccb;color:#65a30d;">≤ 0.80 — Akzeptabel</span></div>
              <div><span class="factor-badge" style="background:#fef3c7;color:#d97706;">≤ 1.00 — Kritisch</span></div>
              <div><span class="factor-badge" style="background:#fee2e2;color:#dc2626;">&gt; 1.00 — Gefährlich</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 3: RESSOURCEN ════════════════════════════════════════════════ -->
    <div class="pdf-section">
      <div class="section-header" style="background:#16a34a;">
        <div class="section-header-inner">
          <span class="section-number">03</span>
          <div>
            <h2 class="section-title">Ressourcen</h2>
            <p class="section-subtitle">{{ project.name }}</p>
          </div>
        </div>
      </div>

      <div class="section-body">
        <!-- Roles -->
        <h3 class="table-heading">Rollen &amp; Tagessätze</h3>
        <table class="data-table" style="max-width:500px;margin-bottom:32px;">
          <thead>
            <tr>
              <th>Rolle</th>
              <th style="text-align:right;">Tagessatz (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in project.roles" :key="role.id">
              <td>{{ role.name }}</td>
              <td style="text-align:right;font-weight:600;">{{ fmtCost(role.rate) }}</td>
            </tr>
            <tr v-if="!project.roles.length">
              <td colspan="2" style="text-align:center;color:#94a3b8;padding:16px;">Keine Rollen erfasst.</td>
            </tr>
          </tbody>
        </table>

        <!-- Task Types -->
        <h3 class="table-heading">Aufgabentypen &amp; Aufschläge</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Typ</th>
              <th style="text-align:right;">PM %</th>
              <th style="text-align:right;">Testing %</th>
              <th style="text-align:right;">Risiko %</th>
              <th style="text-align:right;">Doku %</th>
              <th style="text-align:right;">Gewährleistung %</th>
              <th style="text-align:right;">Gesamt %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in project.taskTypes" :key="type.id">
              <td>{{ type.name }}</td>
              <td style="text-align:right;">{{ type.pm ?? 0 }} %</td>
              <td style="text-align:right;">{{ type.testing ?? 0 }} %</td>
              <td style="text-align:right;">{{ type.risk ?? 0 }} %</td>
              <td style="text-align:right;">{{ type.docs ?? 0 }} %</td>
              <td style="text-align:right;">{{ type.warranty ?? 0 }} %</td>
              <td style="text-align:right;font-weight:700;color:#2563eb;">{{ totalMarkup(type) }} %</td>
            </tr>
            <tr v-if="!project.taskTypes.length">
              <td colspan="7" style="text-align:center;color:#94a3b8;padding:16px;">Keine Aufgabentypen erfasst.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ SECTION 4: RISIKEN ════════════════════════════════════════════════════ -->
    <div class="pdf-section">
      <div class="section-header" style="background:#dc2626;">
        <div class="section-header-inner">
          <span class="section-number">04</span>
          <div>
            <h2 class="section-title">Risiken</h2>
            <p class="section-subtitle">{{ project.name }}</p>
          </div>
          <div style="margin-left:auto;display:flex;gap:12px;">
            <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;text-align:center;">
              <p style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:500;text-transform:uppercase;">Offen</p>
              <p style="font-size:20px;font-weight:700;color:#fff;">{{ risks.filter(r => r.status === 'open').length }}</p>
            </div>
            <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;text-align:center;">
              <p style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:500;text-transform:uppercase;">Gesamt</p>
              <p style="font-size:20px;font-weight:700;color:#fff;">{{ risks.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th style="min-width:220px;">Beschreibung</th>
              <th>Kategorie</th>
              <th>Eintrittswahrsch.</th>
              <th>Auswirkung</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="risk in risks" :key="risk.id">
              <td style="font-weight:600;">{{ risk.name }}</td>
              <td style="white-space:pre-wrap;word-break:break-word;">{{ risk.description || '' }}</td>
              <td>{{ CATEGORIES[risk.category] ?? risk.category }}</td>
              <td>
                <span :style="{
                  background: risk.probability === 'high' ? '#fee2e2' : risk.probability === 'medium' ? '#fef3c7' : '#f1f5f9',
                  color:      risk.probability === 'high' ? '#dc2626' : risk.probability === 'medium' ? '#d97706' : '#64748b',
                  borderRadius: '5px', padding: '2px 7px', fontSize: '12px', fontWeight: '600'
                }">{{ PROB_LABELS[risk.probability] ?? risk.probability }}</span>
              </td>
              <td>
                <span :style="{
                  background: risk.impact === 'high' ? '#fee2e2' : risk.impact === 'medium' ? '#fef3c7' : '#f1f5f9',
                  color:      risk.impact === 'high' ? '#dc2626' : risk.impact === 'medium' ? '#d97706' : '#64748b',
                  borderRadius: '5px', padding: '2px 7px', fontSize: '12px', fontWeight: '600'
                }">{{ IMPACT_LABELS[risk.impact] ?? risk.impact }}</span>
              </td>
              <td>
                <span :style="{
                  background: STATUS_COLORS[risk.status]?.bg ?? '#f1f5f9',
                  color:      STATUS_COLORS[risk.status]?.color ?? '#64748b',
                  borderRadius: '5px', padding: '2px 7px', fontSize: '12px', fontWeight: '600'
                }">{{ STATUS_LABELS[risk.status] ?? risk.status }}</span>
              </td>
            </tr>
            <tr v-if="!risks.length">
              <td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">Keine Risiken erfasst.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Report container ──────────────────────────────────────────────────────── */
.pdf-report {
  width: 1120px;
  background: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: #0f172a;
  line-height: 1.5;
}

/* ── Section ───────────────────────────────────────────────────────────────── */
.pdf-section {
  margin-bottom: 0;
}

.section-header {
  padding: 24px 40px;
}
.section-header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
}
.section-number {
  font-size: 40px;
  font-weight: 900;
  color: rgba(255,255,255,0.25);
  line-height: 1;
  flex-shrink: 0;
}
.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.section-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin: 2px 0 0;
}
.section-date {
  margin-left: auto;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

.section-body {
  padding: 32px 40px 40px;
  background: #ffffff;
}

/* ── KPI boxes ─────────────────────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.kpi-grid-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
.kpi-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 16px 18px;
}
.kpi-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.kpi-val {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  line-height: 1.2;
}
.kpi-sub {
  font-size: 12px;
  color: #64748b;
}

/* ── Tables ────────────────────────────────────────────────────────────────── */
.table-heading {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.5;
}
.data-table th {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 12px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
  color: #0f172a;
}
.data-table tr:last-child td {
  border-bottom: none;
}
.data-table tbody tr:nth-child(even) td {
  background: #f8fafc;
}

/* ── Charts ────────────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.charts-row--3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.chart-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
}
.chart-title {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
}
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bar-label {
  font-size: 12px;
  color: #475569;
  flex: 0 0 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-track {
  flex: 1;
  height: 14px;
  background: #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: none;
}
.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  flex: 0 0 80px;
  text-align: right;
}
.chart-empty {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  padding: 20px 0;
}

/* ── Donut charts ──────────────────────────────────────────────────────────── */
.donut-box {
  display: flex;
  flex-direction: column;
}
.donut-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}
.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-pct {
  font-weight: 700;
  color: #0f172a;
  margin-left: auto;
}

/* ── Factor badge ──────────────────────────────────────────────────────────── */
.factor-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  padding: 2px 8px;
}
.factor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
