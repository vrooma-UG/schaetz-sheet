<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'
import { t } from '../i18n/index.js'

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
  if (factor <= 0.3) return { label: t('aggregation.factorVeryGood'), color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.5) return { label: t('aggregation.factorGood'),     color: '#16a34a', bg: '#dcfce7' }
  if (factor <= 0.8) return { label: t('aggregation.factorAcceptable'), color: '#65a30d', bg: '#ecfccb' }
  if (factor <= 1.0) return { label: t('aggregation.factorCritical'),  color: '#d97706', bg: '#fef3c7' }
  return                     { label: t('aggregation.factorDangerous'), color: '#dc2626', bg: '#fee2e2' }
}
</script>

<template>
  <div class="aggregations">
    <!-- Hero Stats Header -->
    <div class="hero-section">
      <div class="hero-stats">
        <p class="hero-label">{{ t('aggregation.totalEffort') }}</p>
        <h2 class="hero-value">{{ fmtPT(agg.totalEffort) }} PT</h2>
        <p class="hero-sub">
          {{ t('aggregation.aggregatedOver') }} {{ project.tasks.length }} {{ t('aggregation.tasks') }} {{ project.name }}.
        </p>
      </div>
      <div class="stats-row">
        <template v-if="agg.avgFactor !== null">
          <div class="stat-item">
            <span class="stat-val" :style="{ color: factorInfo(agg.avgFactor)?.color }">
              {{ agg.avgFactor.toFixed(2) }}
            </span>
            <span class="stat-lbl">{{ t('aggregation.estimationFactor') }}</span>
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
      <h3>{{ t('aggregation.effortOverview') }}</h3>
      <table class="totals-table">
        <thead>
          <tr>
            <th></th>
            <th>{{ t('aggregation.colMin') }}</th>
            <th>{{ t('aggregation.colMittel') }}</th>
            <th>{{ t('aggregation.colMax') }}</th>
            <th>{{ t('aggregation.colFactor') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ t('aggregation.rowTotal') }}</td>
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
            <td>{{ t('aggregation.rowWithoutOptional') }}</td>
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
            <td>{{ t('aggregation.rowOnlyOptional') }}</td>
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
        <h3>{{ t('aggregation.effortPerPackage') }}</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerPackage" :key="key">
            <td>{{ key || t('aggregation.noPackage') }}</td>
            <td class="agg-num">{{ fmtPT(val) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>{{ t('aggregation.effortPerRole') }}</h3>
        <table>
          <tr v-for="(val, key) in agg.effortPerRole" :key="key">
            <td>{{ key }}</td>
            <td class="agg-num">{{ fmtPT(val) }} PT</td>
          </tr>
        </table>
      </div>
      <div class="agg-block">
        <h3>{{ t('aggregation.effortPerType') }}</h3>
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
