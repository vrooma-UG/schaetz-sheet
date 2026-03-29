const STORAGE_KEY = 'schaetz-sheet-projects'

/**
 * Migrate a task type from the legacy single-markup format to the new
 * per-surcharge format.  A legacy task type carries a numeric `markup`
 * field and no individual surcharge keys.
 */
function migrateTaskType(type) {
  if (typeof type.markup === 'number') {
    const { markup, ...rest } = type
    // Map the old single markup value entirely to pm as a best-effort migration.
    return { ...rest, pm: markup, testing: 0, risk: 0, docs: 0, warranty: 0 }
  }
  // Ensure all surcharge fields exist in case the project was partially migrated.
  return {
    pm: 0, testing: 0, risk: 0, docs: 0, warranty: 0,
    ...type,
  }
}

function migrateProject(project) {
  if (!Array.isArray(project.taskTypes)) return project
  return {
    ...project,
    taskTypes: project.taskTypes.map(migrateTaskType),
  }
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const projects = raw ? JSON.parse(raw) : []
    return projects.map(migrateProject)
  } catch {
    return []
  }
}

export function exportProject(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        resolve(migrateProject(JSON.parse(e.target.result)))
      } catch {
        reject(new Error('Ungültige JSON-Datei'))
      }
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsText(file)
  })
}
