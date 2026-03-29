<script setup>
import { createTaskType } from '../models/index.js'

const props = defineProps({ project: Object })

function addTaskType() {
  props.project.taskTypes.push(createTaskType('Neuer Typ', 0))
}

function removeTaskType(id) {
  const idx = props.project.taskTypes.findIndex(t => t.id === id)
  if (idx !== -1) props.project.taskTypes.splice(idx, 1)
}
</script>

<template>
  <div class="card">
    <div class="toolbar">
      <h2>Aufgabentypen</h2>
      <button @click="addTaskType">+ Typ</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Typ</th>
          <th>Aufschlag (%)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="type in project.taskTypes" :key="type.id">
          <td><input v-model="type.name" /></td>
          <td><input v-model.number="type.markup" type="number" min="0" max="100" /></td>
          <td><button class="danger" @click="removeTaskType(type.id)">✕</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
