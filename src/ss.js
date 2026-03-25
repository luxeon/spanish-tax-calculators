/**
 * Spanish Social Security (SS) quota calculator for autónomos.
 *
 * Covers the 2023 income-based reform (15 brackets / tramos),
 * tarifa plana for new autonomos, and RETA quotas for collaborators.
 *
 * Data source: BOE-A-2022-12482 (2026 official values).
 * 2027+: no increases approved yet; 2026 values are used.
 */

// ── Brackets ──────────────────────────────────────────────────────────────────

/** @type {Array<{id:number, maxMonthly:number}>} */
export const SS_BRACKET_THRESHOLDS = [
  { id: 1,  maxMonthly: 670     },
  { id: 2,  maxMonthly: 900     },
  { id: 3,  maxMonthly: 1166.70 },
  { id: 4,  maxMonthly: 1300    },
  { id: 5,  maxMonthly: 1500    },
  { id: 6,  maxMonthly: 1700    },
  { id: 7,  maxMonthly: 1850    },
  { id: 8,  maxMonthly: 2030    },
  { id: 9,  maxMonthly: 2330    },
  { id: 10, maxMonthly: 2760    },
  { id: 11, maxMonthly: 3190    },
  { id: 12, maxMonthly: 3620    },
  { id: 13, maxMonthly: 4050    },
  { id: 14, maxMonthly: 6000    },
  { id: 15, maxMonthly: Infinity },
]

/** Minimum monthly SS quotas (cuota mínima) per bracket — 2026 official. */
export const SS_MIN_QUOTAS_2026 = [
  205.23, 225.75, 266.80, 299.56, 302.65, 302.65,
  360.29, 380.88, 401.47, 427.21, 452.94, 478.68,
  504.41, 545.59, 607.35,
]

/** Tarifa plana: €80/month flat quota for new autonomos (first 12 months). */
export const TARIFA_PLANA = 80

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSSQuotasForYear(_year) {
  return SS_MIN_QUOTAS_2026
}

/**
 * Find the SS bracket for a given monthly net income.
 * @param {number} monthlyNetIncome
 * @returns {{id:number, maxMonthly:number}}
 */
export function findSSBracket(monthlyNetIncome) {
  for (const bracket of SS_BRACKET_THRESHOLDS) {
    if (monthlyNetIncome <= bracket.maxMonthly) return bracket
  }
  return SS_BRACKET_THRESHOLDS[SS_BRACKET_THRESHOLDS.length - 1]
}

/**
 * Returns the monthly SS quota for a given net income, year, and autonomo status.
 * @param {number} monthlyNetIncome
 * @param {number} year
 * @param {'new'|'mid'|'established'} timeAsAutonomo
 * @returns {{ bracketId: number, monthlyQuota: number, isTarifaPlana: boolean }}
 */
export function findSSQuota(monthlyNetIncome, year, timeAsAutonomo) {
  const bracket = findSSBracket(monthlyNetIncome)
  if (timeAsAutonomo === 'new') {
    return { bracketId: bracket.id, monthlyQuota: TARIFA_PLANA, isTarifaPlana: true }
  }
  if (!['new', 'mid', 'established'].includes(timeAsAutonomo)) {
    console.warn(`[spanish-tax-calculators] findSSQuota: unrecognized timeAsAutonomo "${timeAsAutonomo}", using bracket-based quota`)
  }
  const quotas = getSSQuotasForYear(year)
  const monthlyQuota = quotas[bracket.id - 1]
  return { bracketId: bracket.id, monthlyQuota, isTarifaPlana: false }
}

/**
 * Returns the minimum monthly RETA SS quota for an autonomo colaborador.
 * No tarifa plana — collaborators are not new autonomos.
 * @param {number} monthlyIncome - monthly gross income (€)
 * @param {number} [year=2026]
 * @returns {{ bracketId: number, monthlyQuota: number }}
 */
export function findSSQuotaForCollaborator(monthlyIncome, year = 2026) {
  if (monthlyIncome <= 0) return { bracketId: 0, monthlyQuota: 0 }
  const bracket = findSSBracket(monthlyIncome)
  const quotas = getSSQuotasForYear(year)
  return { bracketId: bracket.id, monthlyQuota: quotas[bracket.id - 1] }
}
