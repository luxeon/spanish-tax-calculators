/**
 * Autónomo (Spanish self-employed) tax calculator.
 *
 * Covers:
 * - General expenses deduction (7% individual, 3% director)
 * - Personal minimum allowances (age, children, disability)
 * - Full autónomo tax breakdown (SS + IRPF + net take-home)
 *
 * Depends on: ./ss.js, ./irpf.js
 */

import { findSSQuota } from './ss.js'
import { calcIrpfState, calcIrpfRegional } from './irpf.js'

// ── General expenses ──────────────────────────────────────────────────────────

const GENERAL_EXPENSES_RATE = { individual: 0.07, director: 0.03 }
const GENERAL_EXPENSES_MAX = 2000

/**
 * Compute the general expenses deduction (gastos genéricos).
 * @param {number} annualNetRevenue
 * @param {'individual'|'director'} autonomoType
 * @returns {number}
 */
export function calcGeneralExpenses(annualNetRevenue, autonomoType) {
  const rate = GENERAL_EXPENSES_RATE[autonomoType]
  if (rate === undefined) {
    console.warn(`[spanish-tax-calculators] calcGeneralExpenses: unrecognized autonomoType "${autonomoType}", using default 7% rate`)
  }
  return Math.round(Math.min(Math.max(0, annualNetRevenue) * (rate ?? 0.07), GENERAL_EXPENSES_MAX) * 100) / 100
}

// ── Personal minimum ──────────────────────────────────────────────────────────

const PERSONAL_MIN_BASE = 5550
const AGE_65_EXTRA      = 1150
const AGE_75_EXTRA      = 1400
const CHILD_ALLOWANCES  = [2400, 2700, 4000, 4500]
const CHILD_U3_EXTRA    = 2800
const DISABILITY_ALLOWANCE = { 33: 3000, 65: 9000 }

/**
 * Compute the total personal minimum allowance (mínimo personal y familiar).
 * @param {{ age:number, numChildren:number, childrenUnder3:number, disabilityLevel:0|33|65 }} params
 * @returns {number}
 */
export function calcPersonalMinimum({ age = 35, numChildren = 0, childrenUnder3 = 0, disabilityLevel = 0 }) {
  let min = PERSONAL_MIN_BASE

  if (age >= 75) min += AGE_65_EXTRA + AGE_75_EXTRA
  else if (age >= 65) min += AGE_65_EXTRA

  const safeChildren = Math.max(0, Math.round(numChildren))
  for (let i = 0; i < safeChildren; i++) {
    min += CHILD_ALLOWANCES[Math.min(i, CHILD_ALLOWANCES.length - 1)]
  }

  const safeU3 = Math.min(Math.max(0, Math.round(childrenUnder3)), safeChildren)
  min += safeU3 * CHILD_U3_EXTRA

  if (disabilityLevel >= 65) min += DISABILITY_ALLOWANCE[65]
  else if (disabilityLevel >= 33) min += DISABILITY_ALLOWANCE[33]

  return min
}

// ── Main calculation ──────────────────────────────────────────────────────────

/** Default parameters for calculateAutonomo. */
export const AUTONOMO_DEFAULTS = {
  annualNetRevenue: 30000,
  autonomoType: 'individual',
  timeAsAutonomo: 'established',
  region: 'madrid',
  year: 2026,
  age: 35,
  numChildren: 0,
  childrenUnder3: 0,
  disabilityLevel: 0,
}

/**
 * Calculate full autónomo tax breakdown.
 *
 * @param {{
 *   annualNetRevenue: number,
 *   autonomoType?: 'individual'|'director',
 *   timeAsAutonomo?: 'new'|'mid'|'established',
 *   region?: string,
 *   year?: number,
 *   age?: number,
 *   numChildren?: number,
 *   childrenUnder3?: number,
 *   disabilityLevel?: 0|33|65,
 * }} params
 * @returns {{
 *   monthlyNetIncome: number,
 *   ssBracketId: number,
 *   isTarifaPlana: boolean,
 *   monthlySSQuota: number,
 *   annualSSTotal: number,
 *   generalExpensesDeduction: number,
 *   reducedNetIncome: number,
 *   personalMinimum: number,
 *   irpfBase: number,
 *   irpfState: number,
 *   irpfRegional: number,
 *   irpfTotal: number,
 *   effectiveIrpfRate: number,
 *   totalBurden: number,
 *   effectiveTotalRate: number,
 *   netTakeHome: number,
 *   netTakeHomeMonthly: number,
 * }}
 */
export function calculateAutonomo({
  annualNetRevenue,
  autonomoType = 'individual',
  timeAsAutonomo = 'established',
  region = 'madrid',
  year = 2026,
  age = 35,
  numChildren = 0,
  childrenUnder3 = 0,
  disabilityLevel = 0,
}) {
  const revenue = Math.max(0, annualNetRevenue)
  const monthlyNetIncome = revenue / 12

  const generalExpensesDeduction = calcGeneralExpenses(revenue, autonomoType)

  // SS bracket uses income after general expenses deduction
  const monthlyIncomeForSS = Math.max(0, revenue - generalExpensesDeduction) / 12
  const { bracketId: ssBracketId, monthlyQuota: monthlySSQuota, isTarifaPlana } =
    findSSQuota(monthlyIncomeForSS, year, timeAsAutonomo)
  const annualSSTotal = Math.round(monthlySSQuota * 12 * 100) / 100

  const reducedNetIncome = Math.max(0, revenue - annualSSTotal - generalExpensesDeduction)

  const personalMinimum = calcPersonalMinimum({ age, numChildren, childrenUnder3, disabilityLevel })

  // IRPF: Tax(base) - Tax(personalMin), NOT Tax(base - personalMin)
  const irpfState = Math.max(0, Math.round(
    (calcIrpfState(reducedNetIncome) - calcIrpfState(personalMinimum)) * 100
  ) / 100)
  const irpfRegional = Math.max(0, Math.round(
    (calcIrpfRegional(reducedNetIncome, region) - calcIrpfRegional(personalMinimum, region)) * 100
  ) / 100)
  const irpfTotal = Math.round((irpfState + irpfRegional) * 100) / 100

  const effectiveIrpfRate = revenue > 0 ? irpfTotal / revenue : 0
  const totalBurden = annualSSTotal + irpfTotal
  const effectiveTotalRate = revenue > 0 ? totalBurden / revenue : 0
  const netTakeHome = Math.max(0, revenue - totalBurden)
  const netTakeHomeMonthly = Math.round((netTakeHome / 12) * 100) / 100

  return {
    monthlyNetIncome: Math.round(monthlyNetIncome * 100) / 100,
    ssBracketId,
    isTarifaPlana,
    monthlySSQuota,
    annualSSTotal,
    generalExpensesDeduction: Math.round(generalExpensesDeduction * 100) / 100,
    reducedNetIncome: Math.round(reducedNetIncome * 100) / 100,
    personalMinimum,
    irpfBase: Math.round(reducedNetIncome * 100) / 100,
    irpfState,
    irpfRegional,
    irpfTotal,
    effectiveIrpfRate: Math.round(effectiveIrpfRate * 10000) / 10000,
    totalBurden: Math.round(totalBurden * 100) / 100,
    effectiveTotalRate: Math.round(effectiveTotalRate * 10000) / 10000,
    netTakeHome: Math.round(netTakeHome * 100) / 100,
    netTakeHomeMonthly,
  }
}
