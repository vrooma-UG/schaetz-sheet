export function calcMW(opt, pess) {
  return (Number(opt) + Number(pess)) / 2
}

export function calcMarkup(mw, markupPercent) {
  return mw * (Number(markupPercent) / 100)
}

export function calcTotalEffort(mw, markup) {
  return mw + markup
}

export function calcCosts(totalEffort, rate) {
  return totalEffort * Number(rate)
}

export function calcFactor(opt, pess) {
  const o = Number(opt)
  if (o === 0) return null
  return (Number(pess) - o) / o
}

export function calcTaskMetrics(task, roles, taskTypes) {
  const role = roles.find(r => r.id === task.roleId)
  const type = taskTypes.find(t => t.id === task.typeId)
  const mw = calcMW(task.opt, task.pess)
  // Support legacy single-markup format as well as new per-surcharge format
  let markupPct = 0
  if (type) {
    if (typeof type.markup === 'number') {
      markupPct = type.markup
    } else {
      markupPct = (type.pm || 0) + (type.testing || 0) + (type.risk || 0) + (type.docs || 0) + (type.warranty || 0)
    }
  }
  const markup = calcMarkup(mw, markupPct)
  const totalEffort = calcTotalEffort(mw, markup)
  const rate = role ? role.rate : 0
  const costs = calcCosts(totalEffort, rate)
  const factor = calcFactor(task.opt, task.pess)
  return { mw, markup, markupPct, totalEffort, costs, factor }
}

export function calcAggregations(tasks, roles, taskTypes) {
  const allMetrics = tasks.map(t => ({ task: t, ...calcTaskMetrics(t, roles, taskTypes) }))

  const totalEffort = allMetrics.reduce((s, m) => s + m.totalEffort, 0)

  const effortPerPackage = {}
  for (const m of allMetrics) {
    effortPerPackage[m.task.package] = (effortPerPackage[m.task.package] || 0) + m.totalEffort
  }

  const optionalEffort = allMetrics
    .filter(m => m.task.optional)
    .reduce((s, m) => s + m.totalEffort, 0)

  const costsPerRole = {}
  for (const role of roles) {
    costsPerRole[role.name] = allMetrics
      .filter(m => m.task.roleId === role.id)
      .reduce((s, m) => s + m.costs, 0)
  }

  const costsPerType = {}
  for (const type of taskTypes) {
    costsPerType[type.name] = allMetrics
      .filter(m => m.task.typeId === type.id)
      .reduce((s, m) => s + m.costs, 0)
  }

  const effortValues = allMetrics.map(m => m.totalEffort)
  const minEffort = effortValues.length ? Math.min(...effortValues) : 0
  const maxEffort = effortValues.length ? Math.max(...effortValues) : 0
  const avgEffort = effortValues.length ? totalEffort / effortValues.length : 0

  return { totalEffort, effortPerPackage, optionalEffort, costsPerRole, costsPerType, minEffort, avgEffort, maxEffort }
}
