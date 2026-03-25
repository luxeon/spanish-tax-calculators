/**
 * Autónomo Colaborador tax calculator.
 *
 * The autonomo pays a family member as an autónomo colaborador. The salary
 * is deductible for the autonomo (reduces their taxable income) but is taxable
 * as rendimientos del trabajo for the collaborator.
 *
 * Depends on: ./ss.js, ./irpf.js, ./autonomo.js
 */

import {
  calculateAutonomo,
  calcPersonalMinimum,
} from './autonomo.js'
import {
  calcIrpfState,
  calcIrpfRegional,
  calcIrpfStateWithBreakdown,
  calcIrpfRegionalWithBreakdown,
} from './irpf.js'
import { findSSQuotaForCollaborator } from './ss.js'

// ── Work income reduction constants ───────────────────────────────────────────

/** Minimum monthly SS quota for autonomo colaborador under RETA 2026, bracket 1. */
export const COLLAB_SS_MIN_MONTHLY = 205.23

/** Net work income threshold below which full reduction applies (€). */
export const WORK_INCOME_REDUCTION_LOWER = 13115

/** Net work income threshold above which the reduction is zero (€). */
export const WORK_INCOME_REDUCTION_UPPER = 16825

/** Maximum reduction amount when rendimiento neto ≤ LOWER threshold (€). */
export const WORK_INCOME_REDUCTION_MAX = 5565

/**
 * Compute the reducción por rendimientos del trabajo (Art. 20 LIRPF).
 * @param {number} rendimientoNeto - salary minus annual SS contributions (€)
 * @returns {number} reduction amount (€), always ≥ 0
 */
export function calcWorkIncomeReduction(rendimientoNeto) {
  if (rendimientoNeto <= WORK_INCOME_REDUCTION_LOWER) {
    return WORK_INCOME_REDUCTION_MAX
  }
  if (rendimientoNeto >= WORK_INCOME_REDUCTION_UPPER) {
    return 0
  }
  return Math.max(0, WORK_INCOME_REDUCTION_MAX - 1.5 * (rendimientoNeto - WORK_INCOME_REDUCTION_LOWER))
}

// ── Collaborator side ─────────────────────────────────────────────────────────

/**
 * Calculate the collaborator's net take-home given their gross annual salary.
 *
 * @param {{
 *   annualSalary: number,
 *   region?: string,
 *   age?: number,
 *   numChildren?: number,
 *   childrenUnder3?: number,
 *   disabilityLevel?: 0|33|65,
 * }} params
 * @returns {{
 *   annualSalary: number,
 *   collabSSBracketId: number,
 *   collabSSMonthly: number,
 *   collabSSAnnual: number,
 *   rendimientoNeto: number,
 *   workIncomeReduction: number,
 *   rendimientoNetoReducido: number,
 *   personalMinimum: number,
 *   irpfState: number,
 *   irpfRegional: number,
 *   irpfTotal: number,
 *   irpfStateBrackets: Array,
 *   irpfRegionalBrackets: Array,
 *   netAfterTax: number,
 * }}
 */
export function calculateCollaboratorSide({
  annualSalary,
  region = 'madrid',
  age = 35,
  numChildren = 0,
  childrenUnder3 = 0,
  disabilityLevel = 0,
}) {
  const salary = Math.max(0, annualSalary)
  const { bracketId: collabSSBracketId, monthlyQuota: collabSSMonthly } = findSSQuotaForCollaborator(salary / 12)
  const collabSSAnnual = Math.round(collabSSMonthly * 12 * 100) / 100

  const rendimientoNeto = Math.max(0, salary - collabSSAnnual)
  const workIncomeReduction = calcWorkIncomeReduction(rendimientoNeto)
  const rendimientoNetoReducido = Math.max(0, rendimientoNeto - workIncomeReduction)

  const personalMinimum = calcPersonalMinimum({ age, numChildren, childrenUnder3, disabilityLevel })

  const irpfState = Math.max(0, Math.round(
    (calcIrpfState(rendimientoNetoReducido) - calcIrpfState(personalMinimum)) * 100
  ) / 100)
  const irpfRegional = Math.max(0, Math.round(
    (calcIrpfRegional(rendimientoNetoReducido, region) - calcIrpfRegional(personalMinimum, region)) * 100
  ) / 100)
  const irpfTotal = Math.round((irpfState + irpfRegional) * 100) / 100

  const { brackets: irpfStateBrackets } = calcIrpfStateWithBreakdown(rendimientoNetoReducido)
  const { brackets: irpfRegionalBrackets } = calcIrpfRegionalWithBreakdown(rendimientoNetoReducido, region)

  const netAfterTax = Math.max(0, salary - collabSSAnnual - irpfTotal)

  return {
    annualSalary: salary,
    collabSSBracketId,
    collabSSMonthly,
    collabSSAnnual,
    rendimientoNeto: Math.round(rendimientoNeto * 100) / 100,
    workIncomeReduction: Math.round(workIncomeReduction * 100) / 100,
    rendimientoNetoReducido: Math.round(rendimientoNetoReducido * 100) / 100,
    personalMinimum,
    irpfState,
    irpfRegional,
    irpfTotal,
    irpfStateBrackets,
    irpfRegionalBrackets,
    netAfterTax: Math.round(netAfterTax * 100) / 100,
  }
}

// ── Joint calculation ─────────────────────────────────────────────────────────

/**
 * Calculate the joint tax picture for autonomo + collaborator.
 *
 * @param {{
 *   userNetIncome: number,
 *   collabMonthly: number,
 *   region?: string,
 *   autonomoType?: 'individual'|'director',
 *   year?: number,
 *   age?: number,
 *   numChildren?: number,
 *   childrenUnder3?: number,
 *   disabilityLevel?: 0|33|65,
 *   collabAge?: number,
 *   collabNumChildren?: number,
 *   collabChildrenUnder3?: number,
 *   collabDisabilityLevel?: 0|33|65,
 * }} params
 * @returns {{
 *   autonomo: object,
 *   collaborator: object,
 *   collabSalaryAnnual: number,
 *   totalTaxPaid: number,
 *   combinedNet: number,
 * }}
 */
export function calculateJointTax({
  userNetIncome,
  collabMonthly,
  region = 'madrid',
  autonomoType = 'individual',
  year = 2026,
  age = 35,
  numChildren = 0,
  childrenUnder3 = 0,
  disabilityLevel = 0,
  collabAge = 35,
  collabNumChildren = 0,
  collabChildrenUnder3 = 0,
  collabDisabilityLevel = 0,
}) {
  const collabSalaryAnnual = Math.round(collabMonthly * 12 * 100) / 100
  const effectiveRevenue = Math.max(0, userNetIncome - collabSalaryAnnual)

  const autonomo = calculateAutonomo({
    annualNetRevenue: effectiveRevenue,
    autonomoType,
    timeAsAutonomo: 'established',
    region,
    year,
    age,
    numChildren,
    childrenUnder3,
    disabilityLevel,
  })

  const collaborator = calculateCollaboratorSide({
    annualSalary: collabSalaryAnnual,
    region,
    age: collabAge,
    numChildren: collabNumChildren,
    childrenUnder3: collabChildrenUnder3,
    disabilityLevel: collabDisabilityLevel,
  })

  const { brackets: autonomoIrpfStateBrackets } = calcIrpfStateWithBreakdown(autonomo.irpfBase)
  const { brackets: autonomoIrpfRegionalBrackets } = calcIrpfRegionalWithBreakdown(autonomo.irpfBase, region)

  const totalTaxPaid = Math.round((autonomo.totalBurden + collaborator.collabSSAnnual + collaborator.irpfTotal) * 100) / 100
  const combinedNet = Math.round((autonomo.netTakeHome + collaborator.netAfterTax) * 100) / 100

  return {
    autonomo: {
      ...autonomo,
      irpfStateBrackets: autonomoIrpfStateBrackets,
      irpfRegionalBrackets: autonomoIrpfRegionalBrackets,
    },
    collaborator,
    collabSalaryAnnual,
    totalTaxPaid,
    combinedNet,
  }
}

// ── Optimizer ─────────────────────────────────────────────────────────────────

/**
 * Find the collaborator monthly salary that minimizes the combined tax burden.
 * Searches €0 to min(userNetIncome/12, €6000) in €25 steps.
 *
 * @param {object} params - same as calculateJointTax minus collabMonthly
 * @returns {{ optimalMonthly: number, optimalAnnual: number, totalTaxPaidAtOptimal: number }}
 */
export function optimizeCollaboratorSalary(params) {
  const { userNetIncome } = params
  const maxMonthly = Math.min(userNetIncome / 12, 6000)

  let bestMonthly = 0
  let bestTax = Infinity

  for (let monthly = 0; monthly <= maxMonthly; monthly += 25) {
    const result = calculateJointTax({ ...params, collabMonthly: monthly })
    if (result.totalTaxPaid < bestTax) {
      bestTax = result.totalTaxPaid
      bestMonthly = monthly
    }
  }

  return {
    optimalMonthly: bestMonthly,
    optimalAnnual: Math.round(bestMonthly * 12 * 100) / 100,
    totalTaxPaidAtOptimal: Math.round(bestTax * 100) / 100,
  }
}
