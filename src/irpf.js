/**
 * Spanish IRPF (Income Tax) calculator.
 *
 * Covers state (tramo estatal) and regional (tramo autonómico) brackets
 * for all 17 comunidades autónomas + Ceuta/Melilla.
 *
 * Data source: AEAT state brackets + taxdown.es/irpf/tabla-tramos (regional).
 * Navarra and País Vasco have foral regimes; values here are educational estimates.
 */

// ── State brackets ────────────────────────────────────────────────────────────

/** IRPF state brackets (tramo estatal) — valid 2024–2026. */
export const IRPF_STATE_BRACKETS = [
  { upTo: 12450,    rate: 0.095  },
  { upTo: 20200,    rate: 0.12   },
  { upTo: 35200,    rate: 0.15   },
  { upTo: 60000,    rate: 0.185  },
  { upTo: 300000,   rate: 0.225  },
  { upTo: Infinity, rate: 0.245  },
]

// ── Regional brackets ─────────────────────────────────────────────────────────

/** @type {Record<string, Array<{upTo:number, rate:number}>>} */
export const IRPF_REGIONAL_BRACKETS = {
  andalucia: [
    { upTo: 13000,    rate: 0.095  },
    { upTo: 21000,    rate: 0.12   },
    { upTo: 35200,    rate: 0.15   },
    { upTo: 50000,    rate: 0.185  },
    { upTo: Infinity, rate: 0.225  },
  ],
  aragon: [
    { upTo: 13972.50, rate: 0.095  },
    { upTo: 21210,    rate: 0.12   },
    { upTo: 36960,    rate: 0.15   },
    { upTo: 52500,    rate: 0.185  },
    { upTo: 60000,    rate: 0.205  },
    { upTo: 80000,    rate: 0.23   },
    { upTo: 90000,    rate: 0.24   },
    { upTo: 130000,   rate: 0.25   },
    { upTo: Infinity, rate: 0.255  },
  ],
  asturias: [
    { upTo: 12450,    rate: 0.10   },
    { upTo: 17707,    rate: 0.12   },
    { upTo: 33007,    rate: 0.14   },
    { upTo: 53407,    rate: 0.185  },
    { upTo: 70000,    rate: 0.215  },
    { upTo: 90000,    rate: 0.225  },
    { upTo: 175000,   rate: 0.25   },
    { upTo: Infinity, rate: 0.255  },
  ],
  baleares: [
    { upTo: 10000,    rate: 0.09   },
    { upTo: 18000,    rate: 0.1125 },
    { upTo: 30000,    rate: 0.1425 },
    { upTo: 48000,    rate: 0.175  },
    { upTo: 70000,    rate: 0.19   },
    { upTo: 90000,    rate: 0.2175 },
    { upTo: 120000,   rate: 0.2275 },
    { upTo: 175000,   rate: 0.2375 },
    { upTo: Infinity, rate: 0.2475 },
  ],
  canarias: [
    { upTo: 12450,    rate: 0.09   },
    { upTo: 17707,    rate: 0.115  },
    { upTo: 33007,    rate: 0.14   },
    { upTo: 53407,    rate: 0.185  },
    { upTo: 90000,    rate: 0.235  },
    { upTo: 120000,   rate: 0.25   },
    { upTo: Infinity, rate: 0.26   },
  ],
  cantabria: [
    { upTo: 13000,    rate: 0.085  },
    { upTo: 21000,    rate: 0.11   },
    { upTo: 35200,    rate: 0.145  },
    { upTo: 60000,    rate: 0.18   },
    { upTo: 90000,    rate: 0.225  },
    { upTo: Infinity, rate: 0.245  },
  ],
  castilla_la_mancha: [
    { upTo: 12450,    rate: 0.095  },
    { upTo: 20200,    rate: 0.12   },
    { upTo: 35200,    rate: 0.15   },
    { upTo: 60000,    rate: 0.185  },
    { upTo: Infinity, rate: 0.225  },
  ],
  castilla_leon: [
    { upTo: 12450,    rate: 0.09   },
    { upTo: 20200,    rate: 0.12   },
    { upTo: 35200,    rate: 0.14   },
    { upTo: 53407,    rate: 0.185  },
    { upTo: Infinity, rate: 0.215  },
  ],
  catalunya: [
    { upTo: 12450,    rate: 0.105  },
    { upTo: 17707,    rate: 0.12   },
    { upTo: 21000,    rate: 0.14   },
    { upTo: 33007,    rate: 0.15   },
    { upTo: 53407,    rate: 0.188  },
    { upTo: 90000,    rate: 0.215  },
    { upTo: 120000,   rate: 0.235  },
    { upTo: 175000,   rate: 0.245  },
    { upTo: Infinity, rate: 0.255  },
  ],
  comunidad_valenciana: [
    { upTo: 12000,    rate: 0.09   },
    { upTo: 22000,    rate: 0.12   },
    { upTo: 32000,    rate: 0.15   },
    { upTo: 42000,    rate: 0.175  },
    { upTo: 52000,    rate: 0.20   },
    { upTo: 62000,    rate: 0.225  },
    { upTo: 72000,    rate: 0.25   },
    { upTo: 100000,   rate: 0.265  },
    { upTo: 150000,   rate: 0.275  },
    { upTo: 200000,   rate: 0.285  },
    { upTo: Infinity, rate: 0.295  },
  ],
  extremadura: [
    { upTo: 12450,    rate: 0.08   },
    { upTo: 20200,    rate: 0.10   },
    { upTo: 24200,    rate: 0.16   },
    { upTo: 35200,    rate: 0.175  },
    { upTo: 60000,    rate: 0.21   },
    { upTo: 80200,    rate: 0.235  },
    { upTo: 99200,    rate: 0.24   },
    { upTo: 120200,   rate: 0.245  },
    { upTo: Infinity, rate: 0.25   },
  ],
  galicia: [
    { upTo: 12985,    rate: 0.09   },
    { upTo: 21068,    rate: 0.1165 },
    { upTo: 35200,    rate: 0.149  },
    { upTo: 47600,    rate: 0.184  },
    { upTo: Infinity, rate: 0.225  },
  ],
  madrid: [
    { upTo: 13362,    rate: 0.085  },
    { upTo: 18004,    rate: 0.107  },
    { upTo: 35425,    rate: 0.128  },
    { upTo: 57320,    rate: 0.174  },
    { upTo: Infinity, rate: 0.205  },
  ],
  murcia: [
    { upTo: 12450,    rate: 0.095  },
    { upTo: 20200,    rate: 0.112  },
    { upTo: 34000,    rate: 0.133  },
    { upTo: 60000,    rate: 0.179  },
    { upTo: Infinity, rate: 0.225  },
  ],
  la_rioja: [
    { upTo: 12450,    rate: 0.08   },
    { upTo: 20200,    rate: 0.106  },
    { upTo: 35200,    rate: 0.136  },
    { upTo: 40000,    rate: 0.178  },
    { upTo: 50000,    rate: 0.185  },
    { upTo: 60000,    rate: 0.19   },
    { upTo: 120000,   rate: 0.245  },
    { upTo: Infinity, rate: 0.27   },
  ],
  // Foral regimes — educational estimates only
  navarra: [
    { upTo: 12450,    rate: 0.085  },
    { upTo: 20200,    rate: 0.105  },
    { upTo: 35200,    rate: 0.145  },
    { upTo: 60000,    rate: 0.175  },
    { upTo: 300000,   rate: 0.22   },
    { upTo: Infinity, rate: 0.235  },
  ],
  pais_vasco: [
    { upTo: 12450,    rate: 0.07   },
    { upTo: 20200,    rate: 0.10   },
    { upTo: 35200,    rate: 0.135  },
    { upTo: 60000,    rate: 0.165  },
    { upTo: 300000,   rate: 0.20   },
    { upTo: Infinity, rate: 0.22   },
  ],
  ceuta: [
    { upTo: 12450,    rate: 0.095  },
    { upTo: 20200,    rate: 0.12   },
    { upTo: 35200,    rate: 0.15   },
    { upTo: 60000,    rate: 0.185  },
    { upTo: 300000,   rate: 0.225  },
    { upTo: Infinity, rate: 0.245  },
  ],
  melilla: [
    { upTo: 12450,    rate: 0.095  },
    { upTo: 20200,    rate: 0.12   },
    { upTo: 35200,    rate: 0.15   },
    { upTo: 60000,    rate: 0.185  },
    { upTo: 300000,   rate: 0.225  },
    { upTo: Infinity, rate: 0.245  },
  ],
}

/** Fallback for unknown regions — mirrors state bracket structure. */
const DEFAULT_REGIONAL_BRACKETS = [
  { upTo: 12450,    rate: 0.095  },
  { upTo: 20200,    rate: 0.12   },
  { upTo: 35200,    rate: 0.15   },
  { upTo: 60000,    rate: 0.185  },
  { upTo: 300000,   rate: 0.225  },
  { upTo: Infinity, rate: 0.245  },
]

/** List of all supported regions. */
export const REGIONS = Object.keys(IRPF_REGIONAL_BRACKETS)

// ── Calculation ───────────────────────────────────────────────────────────────

/**
 * Compute progressive IRPF using a bracket table.
 * @param {number} base - taxable income (€)
 * @param {Array<{upTo:number, rate:number}>} brackets
 * @returns {number} tax owed (€)
 */
export function calcProgressiveTax(base, brackets) {
  if (base <= 0) return 0
  let tax = 0
  let prev = 0
  for (const { upTo, rate } of brackets) {
    if (base <= prev) break
    const slice = Math.min(base, upTo) - prev
    tax += slice * rate
    prev = upTo
    if (upTo === Infinity || base <= upTo) break
  }
  return Math.round(tax * 100) / 100
}

/**
 * Compute progressive IRPF with per-bracket breakdown.
 * @param {number} base - taxable income (€)
 * @param {Array<{upTo:number, rate:number}>} brackets
 * @returns {{ total: number, brackets: Array<{from:number, to:number|null, rate:number, taxableAmount:number, taxAmount:number}> }}
 */
export function calcProgressiveTaxWithBreakdown(base, brackets) {
  if (base <= 0) return { total: 0, brackets: [] }
  let tax = 0
  let prev = 0
  const result = []
  for (const { upTo, rate } of brackets) {
    if (base <= prev) break
    const slice = Math.min(base, upTo) - prev
    const taxAmount = Math.round(slice * rate * 100) / 100
    tax += taxAmount
    result.push({
      from: prev,
      to: upTo === Infinity ? null : upTo,
      rate,
      taxableAmount: Math.round(slice * 100) / 100,
      taxAmount,
    })
    prev = upTo
    if (upTo === Infinity || base <= upTo) break
  }
  return { total: Math.round(tax * 100) / 100, brackets: result }
}

/**
 * Compute state IRPF on the given base.
 * @param {number} base
 * @returns {number}
 */
export function calcIrpfState(base) {
  return calcProgressiveTax(base, IRPF_STATE_BRACKETS)
}

/**
 * Compute state IRPF with per-bracket breakdown.
 * @param {number} base
 * @returns {{ total: number, brackets: Array }}
 */
export function calcIrpfStateWithBreakdown(base) {
  return calcProgressiveTaxWithBreakdown(base, IRPF_STATE_BRACKETS)
}

/**
 * Compute regional IRPF for the given region and base.
 * @param {number} base
 * @param {string} region
 * @returns {number}
 */
export function calcIrpfRegional(base, region) {
  const brackets = IRPF_REGIONAL_BRACKETS[region]
  if (!brackets) {
    console.warn(`[spanish-tax-calculators] calcIrpfRegional: unrecognized region "${region}", using default brackets. Ceuta/Melilla residents: the 50% IRPF deduction is NOT implemented; tax liability will be overstated.`)
  }
  return calcProgressiveTax(base, brackets ?? DEFAULT_REGIONAL_BRACKETS)
}

/**
 * Compute regional IRPF with per-bracket breakdown.
 * @param {number} base
 * @param {string} region
 * @returns {{ total: number, brackets: Array }}
 */
export function calcIrpfRegionalWithBreakdown(base, region) {
  const brackets = IRPF_REGIONAL_BRACKETS[region]
  if (!brackets) {
    console.warn(`[spanish-tax-calculators] calcIrpfRegionalWithBreakdown: unrecognized region "${region}", using default brackets.`)
  }
  return calcProgressiveTaxWithBreakdown(base, brackets ?? DEFAULT_REGIONAL_BRACKETS)
}
