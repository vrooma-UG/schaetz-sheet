<script setup>
import { ref, computed, watch } from 'vue'
import { createProject } from './models/index.js'
import { saveProjects, loadProjects, exportProject, importProject } from './services/jsonService.js'
import ProjectManager from './components/ProjectManager.vue'
import RoleManager from './components/RoleManager.vue'
import TaskTypeManager from './components/TaskTypeManager.vue'
import TaskMatrix from './components/TaskMatrix.vue'
import AggregationPanel from './components/AggregationPanel.vue'
import DashboardView from './components/DashboardView.vue'
import RiskManager from './components/RiskManager.vue'
import HelpModal from './components/HelpModal.vue'
import { generateProjectPdf } from './utils/pdfExport.js'

const projects = ref(loadProjects())
const showHelp = ref(false)
const activeProjectId = ref(null)
const activeView = ref('projects')
const sidebarOpen = ref(false)

function closeSidebar() {
  sidebarOpen.value = false
}

function navigate(view) {
  activeView.value = view
  closeSidebar()
}

function handleNewProject() {
  newProject()
  closeSidebar()
}

function handlePdfExportAndClose() {
  handlePdfExport()
  closeSidebar()
}

function openHelpAndClose() {
  showHelp.value = true
  closeSidebar()
}

const activeProject = computed(() => projects.value.find(p => p.id === activeProjectId.value) ?? null)

const editingProjectName = ref(false)
const projectNameDraft = ref('')

function startEditProjectName() {
  if (!activeProject.value) return
  projectNameDraft.value = activeProject.value.name
  editingProjectName.value = true
}

function commitProjectName() {
  const name = projectNameDraft.value.trim()
  if (name && activeProject.value) {
    activeProject.value.name = name
  }
  editingProjectName.value = false
}

function cancelEditProjectName() {
  editingProjectName.value = false
}

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

function renameProject(id, name) {
  const p = projects.value.find(p => p.id === id)
  if (p) p.name = name
}

function selectProject(id) {
  activeProjectId.value = id
  activeView.value = 'estimation'
  closeSidebar()
}

const generatingPdf = ref(false)

async function handlePdfExport() {
  if (!activeProject.value || generatingPdf.value) return
  generatingPdf.value = true
  try {
    await generateProjectPdf(activeProject.value)
  } finally {
    generatingPdf.value = false
  }
}
</script>

<template>
  <div id="app">
    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" :class="{ 'sidebar-overlay--visible': sidebarOpen }" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar-brand">
        <h1><span class="brand-bold">Mise</span><span class="brand-light">EnPlace</span></h1>
        <p>Plan your project efforts</p>
        <button class="sidebar-close-btn" @click="closeSidebar" aria-label="Menü schließen">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav class="sidebar-nav">
        <button
          :class="['nav-btn', { active: activeView === 'projects' }]"
          @click="navigate('projects')"
        >
          <span class="material-symbols-outlined">folder_open</span>
          Projekt
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'resources' }]"
          @click="navigate('resources')"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">groups</span>
          Ressourcen
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'estimation' }]"
          @click="navigate('estimation')"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">calculate</span>
          Schätzung
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'risks' }]"
          @click="navigate('risks')"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">warning</span>
          Risiken
        </button>
        <button
          :class="['nav-btn', { active: activeView === 'dashboard' }]"
          @click="navigate('dashboard')"
          :disabled="!activeProject"
        >
          <span class="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>
        <button
          class="nav-btn nav-btn--pdf"
          @click="handlePdfExportAndClose"
          :disabled="!activeProject || generatingPdf"
          :title="generatingPdf ? 'PDF wird erstellt…' : 'Komplettes Projekt als PDF exportieren'"
        >
          <span class="material-symbols-outlined">picture_as_pdf</span>
          {{ generatingPdf ? 'Erstelle PDF…' : 'PDF erstellen' }}
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="btn-primary" style="border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;justify-content:center;" @click="handleNewProject">
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
        <button class="footer-nav-btn" @click="openHelpAndClose">
          <span class="material-symbols-outlined">help</span>
          Hilfe
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <button class="hamburger-btn" @click="sidebarOpen = true" aria-label="Menü öffnen">
          <span class="material-symbols-outlined">menu</span>
        </button>
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
            @rename="({ id, name }) => renameProject(id, name)"
          />
        </template>

        <!-- Estimation View -->
        <template v-else-if="activeView === 'estimation'">
          <div v-if="activeProject" class="estimation-view">
            <div class="estimation-header">
              <template v-if="editingProjectName">
                <input
                  class="project-title-input"
                  v-model="projectNameDraft"
                  @keyup.enter="commitProjectName"
                  @keyup.escape="cancelEditProjectName"
                  @blur="commitProjectName"
                  autofocus
                />
              </template>
              <template v-else>
                <h2 class="estimation-title">{{ activeProject.name }}</h2>
                <button class="rename-btn" @click="startEditProjectName" title="Projekt umbenennen">
                  <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
                </button>
              </template>
            </div>
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

        <!-- Dashboard View -->
        <template v-else-if="activeView === 'dashboard'">
          <div v-if="activeProject">
            <DashboardView :project="activeProject" />
          </div>
          <div v-else class="empty-state">
            <span class="material-symbols-outlined">dashboard</span>
            <p>Kein Projekt ausgewählt. Wähle ein Projekt aus oder erstelle ein neues.</p>
          </div>
        </template>

        <!-- Risks View -->
        <template v-else-if="activeView === 'risks'">
          <div v-if="activeProject">
            <RiskManager :project="activeProject" />
          </div>
          <div v-else class="empty-state">
            <span class="material-symbols-outlined">warning</span>
            <p>Kein Projekt ausgewählt. Wähle ein Projekt aus oder erstelle ein neues.</p>
          </div>
        </template>
      </section>
    </div>
    <HelpModal v-if="showHelp" @close="showHelp = false" />
  </div>
</template>
