<script setup>
import { computed } from 'vue'
import { createTaskType } from '../models/index.js'

const props = defineProps({ project: Object })

function addTaskType() {
  props.project.taskTypes.push(createTaskType('Neuer Typ'))
}

function removeTaskType(id) {
  const idx = props.project.taskTypes.findIndex(t => t.id === id)
  if (idx !== -1) props.project.taskTypes.splice(idx, 1)
}

function totalMarkup(type) {
  return (type.pm || 0) + (type.testing || 0) + (type.risk || 0) + (type.docs || 0) + (type.warranty || 0)
}

const avgMarkups = computed(() => {
  const types = props.project.taskTypes
  if (!types.length) return { pm: 0, testing: 0, risk: 0, docs: 0, warranty: 0, total: 0 }
  const n = types.length
  const avg = field => types.reduce((s, t) => s + (t[field] || 0), 0) / n
  const pm = avg('pm')
  const testing = avg('testing')
  const risk = avg('risk')
  const docs = avg('docs')
  const warranty = avg('warranty')
  return { pm, testing, risk, docs, warranty, total: pm + testing + risk + docs + warranty }
})
</script>

<template>
  <div class="card">
    <div class="toolbar">
      <h2>Aufgabentypen</h2>
      <button @click="addTaskType">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        Typ
      </button>
    </div>
    <div class="table-scroll">
      <table class="surcharge-matrix">
        <thead>
          <tr>
            <th>Typ</th>
            <th title="Projektmanagement">PM %</th>
            <th title="Testing">Testing %</th>
            <th title="Risiko">Risiko %</th>
            <th title="Dokumentation">Doku %</th>
            <th title="Gewährleistung">Gewährleistung %</th>
            <th title="Gesamtaufschlag">Gesamt %</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="type in project.taskTypes" :key="type.id">
            <td><input v-model="type.name" /></td>
            <td><input v-model.number="type.pm" type="number" min="0" max="100" style="width:60px" /></td>
            <td><input v-model.number="type.testing" type="number" min="0" max="100" style="width:60px" /></td>
            <td><input v-model.number="type.risk" type="number" min="0" max="100" style="width:60px" /></td>
            <td><input v-model.number="type.docs" type="number" min="0" max="100" style="width:60px" /></td>
            <td><input v-model.number="type.warranty" type="number" min="0" max="100" style="width:60px" /></td>
            <td class="calc bold">{{ totalMarkup(type) }} %</td>
            <td><button class="danger" @click="removeTaskType(type.id)">
              <span class="material-symbols-outlined" style="font-size:15px;">close</span>
            </button></td>
          </tr>
        </tbody>
        <tfoot v-if="project.taskTypes.length">
          <tr class="avg-row">
            <td class="bold">Mittelwert</td>
            <td class="calc">{{ avgMarkups.pm.toFixed(1) }} %</td>
            <td class="calc">{{ avgMarkups.testing.toFixed(1) }} %</td>
            <td class="calc">{{ avgMarkups.risk.toFixed(1) }} %</td>
            <td class="calc">{{ avgMarkups.docs.toFixed(1) }} %</td>
            <td class="calc">{{ avgMarkups.warranty.toFixed(1) }} %</td>
            <td class="calc bold">{{ avgMarkups.total.toFixed(1) }} %</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
