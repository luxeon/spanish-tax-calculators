/**
 * spanish-tax-calculators
 * Pure functions for Spanish tax calculations — IRPF, Social Security,
 * Autónomo, Autónomo Colaborador, and ITP.
 *
 * @module spanish-tax-calculators
 */

// SS
export {
  SS_BRACKET_THRESHOLDS,
  SS_MIN_QUOTAS_2026,
  TARIFA_PLANA,
  findSSBracket,
  findSSQuota,
  findSSQuotaForCollaborator,
} from './ss.js'

// IRPF
export {
  IRPF_STATE_BRACKETS,
  IRPF_REGIONAL_BRACKETS,
  REGIONS,
  calcProgressiveTax,
  calcProgressiveTaxWithBreakdown,
  calcIrpfState,
  calcIrpfStateWithBreakdown,
  calcIrpfRegional,
  calcIrpfRegionalWithBreakdown,
} from './irpf.js'

// Autónomo
export {
  AUTONOMO_DEFAULTS,
  calcGeneralExpenses,
  calcPersonalMinimum,
  calculateAutonomo,
} from './autonomo.js'

// Collaborator
export {
  COLLAB_SS_MIN_MONTHLY,
  WORK_INCOME_REDUCTION_LOWER,
  WORK_INCOME_REDUCTION_UPPER,
  WORK_INCOME_REDUCTION_MAX,
  calcWorkIncomeReduction,
  calculateCollaboratorSide,
  calculateJointTax,
  optimizeCollaboratorSalary,
} from './collaborator.js'

// ITP
export { calculateItpAmount } from './itp.js'

// Data
import spainTaxData from './data/spain-tax-data.json' with { type: 'json' }
export { spainTaxData }
