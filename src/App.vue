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
const activeView = ref('projects')

const activeProject = computed(() => projects.value.find(p => p.id === activeProjectId.value) ?? null)

watch(projects, val => saveProjects(val), { deep: true })

function newProject() {
  const p = createProject()
  projects.value.push(p)
  activeProjectId.value = p.id
  activeView.value = 'estimation'
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
    activeView.value = 'estimation'
  } catch (e) {
    alert(e.message)
  }
}

function handleExport() {
  if (activeProject.value) exportProject(activeProject.value)
}

function selectProject(id) {
  activeProjectId.value = id
  activeView.value = 'estimation'
}
</script>

<template>
  <div id="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <h1>Schätzsheet</h1>
        <p>Precision Ledger Pro</p>
      </div>
      <nav class="sidebar-nav">
        <button
          :class="['nav-btn', { active: activeView === 'projects' }]"
          @click="activeView = 'projects'"
        >
          <span class="material-symbols-outlined">folder_open</span>
          Projekte
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'estimation' }]"
          @click="activeView = 'estimation'"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">calculate</span>
          Schätzung
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'resources' }]"
          @click="activeView = 'resources'"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">groups</span>
          Ressourcen
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="btn-primary" style="border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;justify-content:center;" @click="newProject">
          <span class="material-symbols-outlined" style="font-size:16px;">add</span>
          Neues Projekt
        </button>
        <button class="footer-nav-btn" @click="handleExport" :disabled="!activeProject">
          <span class="material-symbols-outlined">download</span>
          Export
        </button>
        <label class="footer-nav-btn" style="cursor:pointer;">
          <span class="material-symbols-outlined">upload</span>
          Import
          <input type="file" accept=".json" hidden @change="e => { const f = e.target.files[0]; if(f) handleImport(f); e.target.value = ''; }" />
        </label>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <span class="header-title">The Precision Ledger</span>
        </div>
        <div class="header-actions">
          <button @click="handleExport" :disabled="!activeProject">
            <span class="material-symbols-outlined" style="font-size:15px;">download</span>
            Export
          </button>
          <label class="btn" style="cursor:pointer;">
            <span class="material-symbols-outlined" style="font-size:15px;">upload</span>
            Import
            <input type="file" accept=".json" hidden @change="e => { const f = e.target.files[0]; if(f) handleImport(f); e.target.value = ''; }" />
          </label>
        </div>
      </header>

      <!-- Content -->
      <section :class="['content-section', { 'is-estimation': activeView === 'estimation' }]">
        <!-- Projects View -->
        <template v-if="activeView === 'projects'">
          <ProjectManager
            :projects="projects"
            :activeProjectId="activeProjectId"
            @select="selectProject"
            @new="newProject"
            @delete="deleteProject"
          />
        </template>

        <!-- Estimation View -->
        <template v-else-if="activeView === 'estimation'">
          <div v-if="activeProject" class="estimation-view">
            <AggregationPanel :project="activeProject" />
            <TaskMatrix :project="activeProject" />
          </div>
          <div v-else class="empty-state">
            <span class="material-symbols-outlined">calculate</span>
            <p>Kein Projekt ausgewählt. Wähle ein Projekt aus oder erstelle ein neues.</p>
          </div>
        </template>

        <!-- Resources View -->
        <template v-else-if="activeView === 'resources'">
          <template v-if="activeProject">
            <div class="resources-stack">
              <RoleManager :project="activeProject" />
              <TaskTypeManager :project="activeProject" />
            </div>
          </template>
          <div v-else class="empty-state">
            <span class="material-symbols-outlined">groups</span>
            <p>Kein Projekt ausgewählt. Wähle ein Projekt aus oder erstelle ein neues.</p>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>
