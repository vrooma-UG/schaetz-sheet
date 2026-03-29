<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(props.project.tasks, props.project.roles, props.project.taskTypes))

function fmtCost(val) {
  if (!val) return '€0'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
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
            <td>{{ val.toFixed(2) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Kosten je Rolle</h3>
        <table>
          <tr v-for="(val, key) in agg.costsPerRole" :key="key">
            <td>{{ key }}</td>
            <td>{{ val.toFixed(2) }} €</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>Kosten je Typ</h3>
        <table>
          <tr v-for="(val, key) in agg.costsPerType" :key="key">
            <td>{{ key }}</td>
            <td>{{ val.toFixed(2) }} €</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
