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

function calcScenarioEffort(task, markupPct, scenario) {
  let base
  if (scenario === 'min') base = Number(task.opt)
  else if (scenario === 'max') base = Number(task.pess)
  else base = calcMW(task.opt, task.pess)
  return base + calcMarkup(base, markupPct)
}

function sumEfforts(metrics, filter, scenario) {
  return metrics
    .filter(filter)
    .reduce((s, m) => s + calcScenarioEffort(m.task, m.markupPct, scenario), 0)
}

export function calcAggregations(tasks, roles, taskTypes) {
  const allMetrics = tasks.map(t => ({ task: t, ...calcTaskMetrics(t, roles, taskTypes) }))

  const mandatory = m => !m.task.optional
  const optional  = m => !!m.task.optional
  const all       = () => true

  const totals = {
    gesamt: {
      min:    sumEfforts(allMetrics, all, 'min'),
      mittel: sumEfforts(allMetrics, all, 'mittel'),
      max:    sumEfforts(allMetrics, all, 'max'),
    },
    ohneOptional: {
      min:    sumEfforts(allMetrics, mandatory, 'min'),
      mittel: sumEfforts(allMetrics, mandatory, 'mittel'),
      max:    sumEfforts(allMetrics, mandatory, 'max'),
    },
    nurOptional: {
      min:    sumEfforts(allMetrics, optional, 'min'),
      mittel: sumEfforts(allMetrics, optional, 'mittel'),
      max:    sumEfforts(allMetrics, optional, 'max'),
    },
  }

  const totalEffort = totals.gesamt.mittel

  const effortPerPackage = {}
  for (const m of allMetrics) {
    effortPerPackage[m.task.package] = (effortPerPackage[m.task.package] || 0) + m.totalEffort
  }

  const optionalEffort = totals.nurOptional.mittel

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

  function avgFactorOf(filter) {
    const vals = allMetrics.filter(filter).map(m => m.factor).filter(f => f !== null)
    return vals.length ? vals.reduce((s, f) => s + f, 0) / vals.length : null
  }

  const avgFactor = avgFactorOf(all)
  const avgFactorMandatory = avgFactorOf(mandatory)
  const avgFactorOptional = avgFactorOf(optional)

  const effortPerType = {}
  for (const type of taskTypes) {
    effortPerType[type.name] = allMetrics
      .filter(m => m.task.typeId === type.id)
      .reduce((s, m) => s + m.totalEffort, 0)
  }

  const totalCosts = allMetrics.reduce((s, m) => s + m.costs, 0)

  return {
    totalEffort, totals, effortPerPackage, optionalEffort,
    costsPerRole, costsPerType, effortPerType, totalCosts,
    avgFactor, avgFactorMandatory, avgFactorOptional,
  }
}
