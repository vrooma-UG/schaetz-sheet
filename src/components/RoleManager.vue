<script setup>
import { createRole } from '../models/index.js'
import { t } from '../i18n/index.js'

const props = defineProps({ project: Object })

function addRole() {
  props.project.roles.push(createRole(t('roles.defaultName'), 0))
}

function removeRole(id) {
  const idx = props.project.roles.findIndex(r => r.id === id)
  if (idx !== -1) props.project.roles.splice(idx, 1)
}
</script>

<template>
  <div class="card">
    <div class="toolbar">
      <h2>{{ t('roles.title') }}</h2>
      <button @click="addRole">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        {{ t('roles.addRole') }}
      </button>
    </div>
    <table>
      <thead>
        <tr>
          <th>{{ t('roles.name') }}</th>
          <th>{{ t('roles.dailyRate') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in project.roles" :key="role.id">
          <td><input v-model="role.name" /></td>
          <td><input v-model.number="role.rate" type="number" min="0" /></td>
          <td><button class="danger" @click="removeRole(role.id)">
            <span class="material-symbols-outlined" style="font-size:15px;">close</span>
          </button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
