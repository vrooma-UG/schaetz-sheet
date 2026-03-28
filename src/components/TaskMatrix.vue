<script setup>
import { computed } from 'vue'
import { createTask } from '../models/index.js'
import { calcTaskMetrics } from '../utils/calculations.js'

const props = defineProps({ project: Object })

// Use index-based approach to avoid repeated .find() calls in template
const enrichedTasks = computed(() =>
  props.project.tasks.map((task, index) => ({
    index,
    task,
    ...calcTaskMetrics(task, props.project.roles, props.project.taskTypes),
  }))
)

function addTask() {
  props.project.tasks.push(createTask('', props.project.roles[0]?.id ?? '', props.project.taskTypes[0]?.id ?? ''))
}

function removeTask(id) {
  const idx = props.project.tasks.findIndex(t => t.id === id)
  if (idx !== -1) props.project.tasks.splice(idx, 1)
}

function fmt(val) {
  if (val === null || val === undefined) return '-'
  return typeof val === 'number' ? val.toFixed(2) : val
}
</script>

<template>
  <div class="card task-matrix">
    <div class="toolbar">
      <h2>Aufgabenmatrix</h2>
      <button @click="addTask">+ Aufgabe</button>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Paket</th>
            <th>Aufgabe</th>
            <th>Beschreibung</th>
            <th>Rolle</th>
            <th>Typ</th>
            <th>Opt</th>
            <th>Pess</th>
            <th>MW</th>
            <th>Aufschlag</th>
            <th>Gesamt PT</th>
            <th>Kosten €</th>
            <th>Faktor</th>
            <th>Optional</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ index, task, mw, markup, totalEffort, costs, factor } in enrichedTasks" :key="task.id">
            <td><input v-model="project.tasks[index].package" /></td>
            <td><input v-model="project.tasks[index].name" /></td>
            <td><input v-model="project.tasks[index].description" /></td>
            <td>
              <select v-model="project.tasks[index].roleId">
                <option v-for="r in project.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </td>
            <td>
              <select v-model="project.tasks[index].typeId">
                <option v-for="tp in project.taskTypes" :key="tp.id" :value="tp.id">{{ tp.name }}</option>
              </select>
            </td>
            <td><input v-model.number="project.tasks[index].opt" type="number" min="0" style="width:60px" /></td>
            <td><input v-model.number="project.tasks[index].pess" type="number" min="0" style="width:60px" /></td>
            <td class="calc">{{ fmt(mw) }}</td>
            <td class="calc">{{ fmt(markup) }}</td>
            <td class="calc bold">{{ fmt(totalEffort) }}</td>
            <td class="calc">{{ fmt(costs) }}</td>
            <td class="calc">{{ factor !== null ? fmt(factor) : '-' }}</td>
            <td><input type="checkbox" v-model="project.tasks[index].optional" /></td>
            <td><button class="danger" @click="removeTask(task.id)">✕</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
