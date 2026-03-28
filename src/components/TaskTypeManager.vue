<script setup>
const props = defineProps({ project: Object })
</script>

<template>
  <div class="card">
    <h2>Aufschläge (%)</h2>
    <table>
      <thead>
        <tr>
          <th>Typ</th>
          <th>Aufschlag (%)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="type in project.taskTypes" :key="type.id">
          <td>{{ type.name }}</td>
          <td><input v-model.number="type.markup" type="number" min="0" max="100" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
