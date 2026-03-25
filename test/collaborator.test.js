import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcWorkIncomeReduction,
  WORK_INCOME_REDUCTION_LOWER,
  WORK_INCOME_REDUCTION_UPPER,
  WORK_INCOME_REDUCTION_MAX,
  COLLAB_SS_MIN_MONTHLY,
  calculateCollaboratorSide,
  calculateJointTax,
  optimizeCollaboratorSalary,
} from '../src/collaborator.js'

describe('calcWorkIncomeReduction', () => {
  it('exports expected constants', () => {
    assert.equal(WORK_INCOME_REDUCTION_LOWER, 13115)
    assert.equal(WORK_INCOME_REDUCTION_UPPER, 16825)
    assert.equal(WORK_INCOME_REDUCTION_MAX, 5565)
    assert.equal(COLLAB_SS_MIN_MONTHLY, 205.23)
  })
  it('max reduction at or below lower threshold', () => {
    assert.equal(calcWorkIncomeReduction(0), 5565)
    assert.equal(calcWorkIncomeReduction(13115), 5565)
  })
  it('zero at or above upper threshold', () => {
    assert.equal(calcWorkIncomeReduction(16825), 0)
    assert.equal(calcWorkIncomeReduction(50000), 0)
  })
  it('linear phase-out: 1€ above lower reduces by 1.5', () => {
    const at = calcWorkIncomeReduction(WORK_INCOME_REDUCTION_LOWER)
    const above = calcWorkIncomeReduction(WORK_INCOME_REDUCTION_LOWER + 1)
    assert.ok(Math.abs(at - above - 1.5) < 0.01)
  })
  it('interpolates correctly at midpoint', () => {
    const r = calcWorkIncomeReduction(14970)
    assert.ok(Math.abs(r - 2782.5) < 1)
  })
})

describe('calculateCollaboratorSide', () => {
  const base = { annualSalary: 15000, region: 'madrid', age: 35 }

  it('returns all expected keys', () => {
    const r = calculateCollaboratorSide(base)
    for (const k of ['annualSalary','collabSSBracketId','collabSSMonthly','collabSSAnnual',
      'rendimientoNeto','workIncomeReduction','rendimientoNetoReducido','personalMinimum',
      'irpfState','irpfRegional','irpfTotal','irpfStateBrackets','irpfRegionalBrackets','netAfterTax']) {
      assert.ok(k in r, `missing: ${k}`)
    }
  })

  it('bracket 4 for €1250/mo', () => {
    const r = calculateCollaboratorSide(base)
    assert.equal(r.collabSSBracketId, 4)
    assert.ok(Math.abs(r.collabSSMonthly - 299.56) < 0.01)
  })

  it('netAfterTax = salary - SS - IRPF', () => {
    const r = calculateCollaboratorSide(base)
    assert.ok(Math.abs(r.netAfterTax - (15000 - r.collabSSAnnual - r.irpfTotal)) < 0.1)
  })

  it('zero salary yields zero', () => {
    const r = calculateCollaboratorSide({ ...base, annualSalary: 0 })
    assert.equal(r.irpfTotal, 0)
    assert.equal(r.netAfterTax, 0)
  })

  it('Madrid ≤ Catalunya for same income', () => {
    assert.ok(
      calculateCollaboratorSide(base).irpfTotal <=
      calculateCollaboratorSide({ ...base, region: 'catalunya' }).irpfTotal
    )
  })

  it('IRPF floored at zero', () => {
    const r = calculateCollaboratorSide({ ...base, annualSalary: 5000, numChildren: 4 })
    assert.equal(r.irpfTotal, 0)
  })
})

describe('calculateJointTax', () => {
  const base = { userNetIncome: 50000, collabMonthly: 1000, region: 'madrid', autonomoType: 'individual', year: 2026 }

  it('returns all expected keys', () => {
    const r = calculateJointTax(base)
    assert.ok('autonomo' in r)
    assert.ok('collaborator' in r)
    assert.ok('totalTaxPaid' in r)
    assert.ok('combinedNet' in r)
  })

  it('collabSalaryAnnual = 12000', () => {
    assert.equal(calculateJointTax(base).collabSalaryAnnual, 12000)
  })

  it('combinedNet = autonomo.net + collab.net', () => {
    const r = calculateJointTax(base)
    assert.ok(Math.abs(r.combinedNet - (r.autonomo.netTakeHome + r.collaborator.netAfterTax)) < 0.1)
  })

  it('zero collab salary', () => {
    const r = calculateJointTax({ ...base, collabMonthly: 0 })
    assert.equal(r.collaborator.netAfterTax, 0)
  })
})

describe('optimizeCollaboratorSalary', () => {
  const base = { userNetIncome: 60000, region: 'madrid', autonomoType: 'individual', year: 2026 }

  it('returns optimalMonthly, optimalAnnual, totalTaxPaidAtOptimal', () => {
    const r = optimizeCollaboratorSalary(base)
    assert.ok('optimalMonthly' in r)
    assert.ok('optimalAnnual' in r)
    assert.ok('totalTaxPaidAtOptimal' in r)
  })

  it('optimalMonthly is multiple of 25', () => {
    assert.equal(optimizeCollaboratorSalary(base).optimalMonthly % 25, 0)
  })

  it('optimal ≤ zero-salary tax', () => {
    const r = optimizeCollaboratorSalary(base)
    const atZero = calculateJointTax({ ...base, collabMonthly: 0 }).totalTaxPaid
    assert.ok(r.totalTaxPaidAtOptimal <= atZero)
  })

  it('zero income → zero optimal', () => {
    assert.equal(optimizeCollaboratorSalary({ ...base, userNetIncome: 0 }).optimalMonthly, 0)
  })
})
