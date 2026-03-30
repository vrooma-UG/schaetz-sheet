<script setup>
import { ref } from 'vue'
import { t } from '../i18n/index.js'

const props = defineProps({
  projects: Array,
  activeProjectId: String,
})
const emit = defineEmits(['select', 'new', 'delete', 'rename'])

const editingId = ref(null)
const editingName = ref('')

function startRename(p, event) {
  event.stopPropagation()
  editingId.value = p.id
  editingName.value = p.name
}

function commitRename(p) {
  const name = editingName.value.trim()
  if (name && name !== p.name) {
    emit('rename', { id: p.id, name })
  }
  editingId.value = null
}

function cancelRename() {
  editingId.value = null
}

function confirmDelete(id, event) {
  event.stopPropagation()
  if (window.confirm(t('project.deleteConfirm'))) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="project-manager">
    <!-- Section header -->
    <div class="section-header">
      <span class="section-label">{{ t('project.activeProjects') }}</span>
      <button class="btn-primary" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        {{ t('project.newProject') }}
      </button>
    </div>

    <!-- Bento grid of project cards -->
    <div v-if="projects.length > 0" class="project-grid">
      <!-- Featured card: first (or active) project -->
      <template v-for="(p, idx) in projects" :key="p.id">
        <div
          v-if="idx === 0"
          :class="['project-card-featured', { 'active-card': p.id === activeProjectId }]"
          @click="emit('select', p.id)"
        >
          <div>
            <div class="project-card-header" style="margin-bottom:16px;">
              <span :class="['status-badge', p.id === activeProjectId ? 'active' : 'default']">
                {{ p.id === activeProjectId ? t('project.opened') : t('project.inactive') }}
              </span>
              <button class="project-delete-btn" @click="confirmDelete(p.id, $event)" :title="t('project.deleteTitle')" :aria-label="t('project.deleteTitle')">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
              </button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <template v-if="editingId === p.id">
                <input
                  class="project-name-input"
                  v-model="editingName"
                  @keyup.enter="commitRename(p)"
                  @keyup.escape="cancelRename"
                  @blur="commitRename(p)"
                  @click.stop
                  autofocus
                />
              </template>
              <template v-else>
                <h3 class="project-card-title">{{ p.name }}</h3>
                <button class="rename-btn" @click.stop="startRename(p, $event)" :title="t('project.renameTitle')">
                  <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
                </button>
              </template>
            </div>
            <p class="project-card-meta">{{ p.tasks?.length ?? 0 }} {{ t('project.tasks') }} · {{ p.roles?.length ?? 0 }} {{ t('project.roles') }}</p>
          </div>
          <div class="project-card-footer">
            <div style="display:flex;gap:24px;">
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">{{ t('project.taskTypes') }}</p>
                <p style="font-size:1.1rem;font-weight:700;color:var(--on-surface);">{{ p.taskTypes?.length ?? 0 }}</p>
              </div>
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">{{ t('project.roles') }}</p>
                <p style="font-size:1.1rem;font-weight:700;color:var(--on-surface);">{{ p.roles?.length ?? 0 }}</p>
              </div>
            </div>
            <button
              style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--surface-container-lowest);color:var(--primary);border:1px solid var(--outline-variant);cursor:pointer;transition:background 0.15s,color 0.15s;"
              @click.stop="emit('select', p.id)"
            >
              <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
            </button>
          </div>
        </div>

        <div
          v-else
          :class="['project-card', { 'active-card': p.id === activeProjectId }]"
          @click="emit('select', p.id)"
        >
          <div>
            <div class="project-card-header">
              <span :class="['status-badge', p.id === activeProjectId ? 'active' : 'default']">
                {{ p.id === activeProjectId ? t('project.opened') : t('project.inactive') }}
              </span>
              <button class="project-delete-btn" style="position:static;padding:4px;" @click="confirmDelete(p.id, $event)" :title="t('project.deleteTitle')" :aria-label="t('project.deleteTitle')">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
              </button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
              <template v-if="editingId === p.id">
                <input
                  class="project-name-input"
                  v-model="editingName"
                  @keyup.enter="commitRename(p)"
                  @keyup.escape="cancelRename"
                  @blur="commitRename(p)"
                  @click.stop
                  autofocus
                />
              </template>
              <template v-else>
                <h3 class="project-card-title" style="font-size:1rem;margin-top:0;">{{ p.name }}</h3>
                <button class="rename-btn" @click.stop="startRename(p, $event)" :title="t('project.renameTitle')">
                  <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
                </button>
              </template>
            </div>
            <p class="project-card-meta">{{ p.tasks?.length ?? 0 }} {{ t('project.tasks') }}</p>
          </div>
          <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">{{ t('project.roles') }}</p>
              <p style="font-size:1rem;font-weight:700;color:var(--on-surface);">{{ p.roles?.length ?? 0 }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Add new project card -->
      <div class="add-project-card" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:32px;">add_circle</span>
        <span>{{ t('project.newProject') }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <span class="material-symbols-outlined">folder_open</span>
      <p>{{ t('project.noProjects') }}</p>
      <button class="btn-primary" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        {{ t('project.firstProject') }}
      </button>
    </div>
  </div>
</template>
