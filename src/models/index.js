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
      { id: crypto.randomUUID(), name: 'ProjectManagement', pm: 10, testing: 0, risk: 10, docs: 10, warranty: 0 },
      { id: crypto.randomUUID(), name: 'Install', pm: 5, testing: 5, risk: 5, docs: 5, warranty: 0 },
      { id: crypto.randomUUID(), name: 'Configuration', pm: 10, testing: 5, risk: 5, docs: 5, warranty: 10 },
      { id: crypto.randomUUID(), name: 'Develop', pm: 10, testing: 5, risk: 5, docs: 10, warranty: 10 },
    ],
    tasks: [],
  }
}

export function createRole(name = '', rate = 0) {
  return { id: crypto.randomUUID(), name, rate: Number(rate) }
}

export function createTaskType(name = '') {
  return { id: crypto.randomUUID(), name, pm: 0, testing: 0, risk: 0, docs: 0, warranty: 0 }
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
