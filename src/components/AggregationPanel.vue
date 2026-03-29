<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(props.project.tasks, props.project.roles, props.project.taskTypes))

function fmtCost(val) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val || 0)
}

function fmtPT(val) {
  return Number(val).toFixed(2)
}

function factorInfo(factor) {
  if (factor === null) return null
  if (factor <= 0.25) return { label: 'Gut geschätzt', color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.5)  return { label: 'Akzeptabel',    color: '#65a30d', bg: '#ecfccb' }
  if (factor <= 1.0)  return { label: 'Kritisch',      color: '#d97706', bg: '#fef3c7' }
  return                      { label: 'Gefährlich',   color: '#dc2626', bg: '#fee2e2' }
}
</script>

<template>
  <div class="aggregations">
    <!-- Hero Stats Header -->
    <div class="hero-section">
      <div class="hero-stats">
        <p class="hero-label">Gesamtaufwand</p>
        <h2 class="hero-value">{{ fmtPT(agg.totalEffort) }} PT</h2>
        <p class="hero-sub">
          Aggregiert über {{ project.tasks.length }} Aufgaben in {{ project.name }}.
        </p>
      </div>
      <div class="stats-row">
        <template v-if="agg.avgFactor !== null">
          <div class="stat-item">
            <span class="stat-val" :style="{ color: factorInfo(agg.avgFactor)?.color }">
              {{ agg.avgFactor.toFixed(2) }}
            </span>
            <span class="stat-lbl">Schätzfaktor</span>
            <span
              v-if="factorInfo(agg.avgFactor)"
              class="factor-badge"
              :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }"
            >{{ factorInfo(agg.avgFactor).label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Totals Table -->
    <div class="agg-block" style="margin-top:24px;">
      <h3>Aufwand Übersicht (PT)</h3>
      <table class="totals-table">
        <thead>
          <tr>
            <th></th>
            <th>Min</th>
            <th>Mittel</th>
            <th>Max</th>
            <th>Schätzfaktor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gesamt</td>
            <td class="agg-num">{{ fmtPT(agg.totals.gesamt.min) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.gesamt.mittel) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.gesamt.max) }}</td>
            <td class="agg-num">
              <span
                v-if="agg.avgFactor !== null"
                class="factor-badge"
                :style="{ background: factorInfo(agg.avgFactor).bg, color: factorInfo(agg.avgFactor).color }"
              >{{ agg.avgFactor.toFixed(2) }} — {{ factorInfo(agg.avgFactor).label }}</span>
              <span v-else style="color:var(--outline)">—</span>
            </td>
          </tr>
          <tr>
            <td>Ohne Optional</td>
            <td class="agg-num">{{ fmtPT(agg.totals.ohneOptional.min) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.ohneOptional.mittel) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.ohneOptional.max) }}</td>
            <td class="agg-num">
              <span
                v-if="agg.avgFactorMandatory !== null"
                class="factor-badge"
                :style="{ background: factorInfo(agg.avgFactorMandatory).bg, color: factorInfo(agg.avgFactorMandatory).color }"
              >{{ agg.avgFactorMandatory.toFixed(2) }} — {{ factorInfo(agg.avgFactorMandatory).label }}</span>
              <span v-else style="color:var(--outline)">—</span>
            </td>
          </tr>
          <tr>
            <td>Nur Optional</td>
            <td class="agg-num">{{ fmtPT(agg.totals.nurOptional.min) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.nurOptional.mittel) }}</td>
            <td class="agg-num">{{ fmtPT(agg.totals.nurOptional.max) }}</td>
            <td class="agg-num">
              <span
                v-if="agg.avgFactorOptional !== null"
                class="factor-badge"
                :style="{ background: factorInfo(agg.avgFactorOptional).bg, color: factorInfo(agg.avgFactorOptional).color }"
              >{{ agg.avgFactorOptional.toFixed(2) }} — {{ factorInfo(agg.avgFactorOptional).label }}</span>
              <span v-else style="color:var(--outline)">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Cards -->
    <div class="agg-grid" style="margin-top:24px;">
      <div class="agg-block">
        <h3>Aufwand je Paket</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerPackage" :key="key">
            <td>{{ key || '(kein Paket)' }}</td>
            <td class="agg-num">{{ fmtPT(val) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Aufwand je Rolle</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerRole" :key="key">
            <td>{{ key }}</td>
            <td class="agg-num">{{ fmtPT(val) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Aufwand je Typ</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerType" :key="key">
            <td>{{ key }}</td>
            <td class="agg-num">{{ fmtPT(val) }} PT</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
