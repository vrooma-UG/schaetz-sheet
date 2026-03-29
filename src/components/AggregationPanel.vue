<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(props.project.tasks, props.project.roles, props.project.taskTypes))

function fmtCost(val) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val || 0)
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
        <h2 class="hero-value">{{ agg.totalEffort.toFixed(2) }} PT</h2>
        <p class="hero-sub">
          Aggregiert über {{ project.tasks.length }} Aufgaben in {{ project.name }}.
        </p>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-val">{{ agg.minEffort.toFixed(1) }}</span>
          <span class="stat-lbl">Min PT</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-val">{{ agg.avgEffort.toFixed(1) }}</span>
          <span class="stat-lbl">MW PT</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-val">{{ agg.maxEffort.toFixed(1) }}</span>
          <span class="stat-lbl">Max PT</span>
        </div>
        <template v-if="agg.avgFactor !== null">
          <div class="stat-divider"></div>
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

    <!-- Detail Cards -->
    <div class="agg-grid" style="margin-top:24px;">
      <div class="agg-block">
        <h3>Optional</h3>
        <p class="big">{{ agg.optionalEffort.toFixed(2) }}</p>
        <p>PT optionaler Aufwand</p>
      </div>
      <div class="agg-block">
        <h3>Aufwand je Paket</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerPackage" :key="key">
            <td>{{ key || '(kein Paket)' }}</td>
            <td class="agg-num">{{ val.toFixed(2) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Kosten je Rolle</h3>
        <table>
          <tr v-for="(val, key) in agg.costsPerRole" :key="key">
            <td>{{ key }}</td>
            <td class="agg-num">{{ fmtCost(val) }}</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Kosten je Typ</h3>
        <table>
          <tr v-for="(val, key) in agg.costsPerType" :key="key">
            <td>{{ key }}</td>
            <td class="agg-num">{{ fmtCost(val) }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
