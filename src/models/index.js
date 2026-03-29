export function createProject(name = 'Neues Projekt') {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    roles: [
      { id: crypto.randomUUID(), name: 'Entwickler', rate: 800 },
      { id: crypto.randomUUID(), name: 'Designer', rate: 700 },
    ],
    taskTypes: [
      { id: 'testing', name: 'Testing', markup: 15 },
      { id: 'pm', name: 'PM', markup: 10 },
      { id: 'risiko', name: 'Risiko', markup: 10 },
      { id: 'dokumentation', name: 'Dokumentation', markup: 5 },
      { id: 'gewaehrleistung', name: 'Gewährleistung', markup: 5 },
    ],
    tasks: [],
  }
}

export function createRole(name = '', rate = 0) {
  return { id: crypto.randomUUID(), name, rate: Number(rate) }
}

export function createTaskType(name = '', markup = 0) {
  return { id: crypto.randomUUID(), name, markup: Number(markup) }
}

export function createTask(packageName = '', roleId = '', typeId = '') {
  return {
    id: crypto.randomUUID(),
    package: packageName,
    name: '',
    description: '',
    roleId,
    typeId,
    opt: 0,
    pess: 0,
    optional: false,
  }
}
