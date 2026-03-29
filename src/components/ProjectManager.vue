<script setup>
import { computed } from 'vue'

const props = defineProps({
  projects: Array,
  activeProjectId: String,
})
const emit = defineEmits(['select', 'new', 'delete'])
</script>

<template>
  <div class="project-manager">
    <!-- Section header -->
    <div class="section-header">
      <span class="section-label">Aktive Projekte</span>
      <button class="btn-primary" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        Neues Projekt
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
                {{ p.id === activeProjectId ? 'Aktiv' : 'Inaktiv' }}
              </span>
              <button class="project-delete-btn" @click.stop="emit('delete', p.id)" title="Projekt löschen">
                <span class="material-symbols-outlined" style="font-size:16px;">close</span>
              </button>
            </div>
            <h3 class="project-card-title">{{ p.name }}</h3>
            <p class="project-card-meta">{{ p.tasks?.length ?? 0 }} Aufgaben · {{ p.roles?.length ?? 0 }} Rollen</p>
          </div>
          <div class="project-card-footer">
            <div style="display:flex;gap:24px;">
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">Aufgabentypen</p>
                <p style="font-size:1.1rem;font-weight:700;color:var(--on-surface);">{{ p.taskTypes?.length ?? 0 }}</p>
              </div>
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">Rollen</p>
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
                {{ p.id === activeProjectId ? 'Aktiv' : 'Inaktiv' }}
              </span>
              <button class="project-delete-btn" style="position:static;padding:4px;" @click.stop="emit('delete', p.id)" title="Projekt löschen">
                <span class="material-symbols-outlined" style="font-size:16px;">close</span>
              </button>
            </div>
            <h3 class="project-card-title" style="font-size:1rem;margin-top:8px;">{{ p.name }}</h3>
            <p class="project-card-meta">{{ p.tasks?.length ?? 0 }} Aufgaben</p>
          </div>
          <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--outline);">Rollen</p>
              <p style="font-size:1rem;font-weight:700;color:var(--on-surface);">{{ p.roles?.length ?? 0 }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Add new project card -->
      <div class="add-project-card" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:32px;">add_circle</span>
        <span>Neues Projekt</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <span class="material-symbols-outlined">folder_open</span>
      <p>Keine Projekte vorhanden.</p>
      <button class="btn-primary" @click="emit('new')">
        <span class="material-symbols-outlined" style="font-size:15px;">add</span>
        Erstes Projekt erstellen
      </button>
    </div>
  </div>
</template>
