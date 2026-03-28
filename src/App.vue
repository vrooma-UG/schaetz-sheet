<script setup>
import { ref, computed, watch } from 'vue'
import { createProject } from './models/index.js'
import { saveProjects, loadProjects, exportProject, importProject } from './services/jsonService.js'
import ProjectManager from './components/ProjectManager.vue'
import RoleManager from './components/RoleManager.vue'
import TaskTypeManager from './components/TaskTypeManager.vue'
import TaskMatrix from './components/TaskMatrix.vue'
import AggregationPanel from './components/AggregationPanel.vue'

const projects = ref(loadProjects())
const activeProjectId = ref(projects.value[0]?.id ?? null)

const activeProject = computed(() => projects.value.find(p => p.id === activeProjectId.value) ?? null)

watch(projects, val => saveProjects(val), { deep: true })

function newProject() {
  const p = createProject()
  projects.value.push(p)
  activeProjectId.value = p.id
}

function deleteProject(id) {
  projects.value = projects.value.filter(p => p.id !== id)
  if (activeProjectId.value === id) {
    activeProjectId.value = projects.value[0]?.id ?? null
  }
}

async function handleImport(file) {
  try {
    const p = await importProject(file)
    p.id = crypto.randomUUID()
    projects.value.push(p)
    activeProjectId.value = p.id
  } catch (e) {
    alert(e.message)
  }
}

function handleExport() {
  if (activeProject.value) exportProject(activeProject.value)
}
</script>

<template>
  <div id="app">
    <header>
      <h1>📊 Schätzsheet</h1>
    </header>
    <main>
      <ProjectManager
        :projects="projects"
        :activeProjectId="activeProjectId"
        @select="id => activeProjectId = id"
        @new="newProject"
        @delete="deleteProject"
        @import="handleImport"
        @export="handleExport"
      />
      <template v-if="activeProject">
        <div class="grid-2">
          <RoleManager :project="activeProject" />
          <TaskTypeManager :project="activeProject" />
        </div>
        <TaskMatrix :project="activeProject" />
        <AggregationPanel :project="activeProject" />
      </template>
      <div v-else class="empty-state">
        <p>Kein Projekt ausgewählt. Erstelle ein neues Projekt oder importiere eine JSON-Datei.</p>
      </div>
    </main>
  </div>
</template>
