<script setup>
const props = defineProps({
  projects: Array,
  activeProjectId: String,
})
const emit = defineEmits(['select', 'new', 'delete', 'import', 'export'])

function handleFileInput(e) {
  const file = e.target.files[0]
  if (file) emit('import', file)
  e.target.value = ''
}
</script>

<template>
  <div class="project-manager card">
    <div class="toolbar">
      <h2>Projekte</h2>
      <div class="actions">
        <button @click="emit('new')">+ Neu</button>
        <button @click="emit('export')" :disabled="!activeProjectId">⬇ Export</button>
        <label class="btn">⬆ Import<input type="file" accept=".json" hidden @change="handleFileInput" /></label>
      </div>
    </div>
    <div class="project-list">
      <button
        v-for="p in projects"
        :key="p.id"
        :class="['project-btn', { active: p.id === activeProjectId }]"
        @click="emit('select', p.id)"
      >
        {{ p.name }}
        <span class="delete-btn" @click.stop="emit('delete', p.id)">✕</span>
      </button>
    </div>
  </div>
</template>
