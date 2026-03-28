<script setup>
import { computed } from 'vue'
import { calcAggregations } from '../utils/calculations.js'

const props = defineProps({ project: Object })

const agg = computed(() => calcAggregations(props.project.tasks, props.project.roles, props.project.taskTypes))
</script>

<template>
  <div class="card aggregations">
    <h2>Aggregationen</h2>
    <div class="agg-grid">
      <div class="agg-block">
        <h3>Gesamtaufwand</h3>
        <p class="big">{{ agg.totalEffort.toFixed(2) }} PT</p>
      </div>
      <div class="agg-block">
        <h3>Min / MW / Max</h3>
        <p>Min: {{ agg.minEffort.toFixed(2) }} PT</p>
        <p>MW: {{ agg.avgEffort.toFixed(2) }} PT</p>
        <p>Max: {{ agg.maxEffort.toFixed(2) }} PT</p>
      </div>
      <div class="agg-block">
        <h3>Aufwand optional</h3>
        <p>{{ agg.optionalEffort.toFixed(2) }} PT</p>
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
