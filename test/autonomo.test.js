import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcGeneralExpenses,
  calcPersonalMinimum,
  calculateAutonomo,
} from '../src/autonomo.js'

describe('calcGeneralExpenses', () => {
  it('7% for individual', () => {
    assert.equal(calcGeneralExpenses(20000, 'individual'), 1400)
  })
  it('caps at €2,000 for individual', () => {
    assert.equal(calcGeneralExpenses(40000, 'individual'), 2000)
  })
  it('3% for director', () => {
    assert.equal(calcGeneralExpenses(20000, 'director'), 600)
  })
  it('caps at €2,000 for director', () => {
    assert.equal(calcGeneralExpenses(70000, 'director'), 2000)
  })
  it('0 for zero revenue', () => {
    assert.equal(calcGeneralExpenses(0, 'individual'), 0)
  })
  it('falls back to 7% for unknown type', () => {
    assert.equal(calcGeneralExpenses(10000, 'unknown'), 700)
  })
})

describe('calcPersonalMinimum', () => {
  it('base only', () => {
    assert.equal(calcPersonalMinimum({}), 5550)
  })
  it('age 65+ adds 1150', () => {
    assert.equal(calcPersonalMinimum({ age: 65 }), 5550 + 1150)
  })
  it('age 75+ adds 1150+1400', () => {
    assert.equal(calcPersonalMinimum({ age: 75 }), 5550 + 1150 + 1400)
  })
  it('2 children: 2400+2700', () => {
    assert.equal(calcPersonalMinimum({ numChildren: 2 }), 5550 + 2400 + 2700)
  })
  it('1 child under 3: extra 2800', () => {
    assert.equal(calcPersonalMinimum({ numChildren: 1, childrenUnder3: 1 }), 5550 + 2400 + 2800)
  })
  it('disability 33%', () => {
    assert.equal(calcPersonalMinimum({ disabilityLevel: 33 }), 5550 + 3000)
  })
  it('disability 65%', () => {
    assert.equal(calcPersonalMinimum({ disabilityLevel: 65 }), 5550 + 9000)
  })
  it('combined age + children + disability', () => {
    assert.equal(calcPersonalMinimum({ age: 67, numChildren: 1, disabilityLevel: 33 }), 5550 + 1150 + 2400 + 3000)
  })
})

describe('calculateAutonomo', () => {
  const base = {
    annualNetRevenue: 30000, autonomoType: 'individual', timeAsAutonomo: 'established',
    region: 'madrid', year: 2026, age: 35, numChildren: 0, childrenUnder3: 0, disabilityLevel: 0,
  }

  it('returns all expected keys', () => {
    const r = calculateAutonomo(base)
    for (const k of ['monthlyNetIncome','ssBracketId','isTarifaPlana','monthlySSQuota',
      'annualSSTotal','generalExpensesDeduction','reducedNetIncome','personalMinimum',
      'irpfBase','irpfState','irpfRegional','irpfTotal','effectiveIrpfRate',
      'totalBurden','effectiveTotalRate','netTakeHome','netTakeHomeMonthly']) {
      assert.ok(k in r, `missing key: ${k}`)
    }
  })

  it('irpfBase equals reducedNetIncome', () => {
    const r = calculateAutonomo(base)
    assert.equal(r.irpfBase, r.reducedNetIncome)
  })

  it('netTakeHome + totalBurden ≈ revenue', () => {
    const r = calculateAutonomo({ ...base, annualNetRevenue: 40000, region: 'andalucia', age: 40, numChildren: 1 })
    assert.ok(Math.abs(r.netTakeHome + r.totalBurden - 40000) < 0.02)
  })

  it('tarifa plana reduces SS', () => {
    const nw = calculateAutonomo({ ...base, timeAsAutonomo: 'new' })
    const est = calculateAutonomo(base)
    assert.ok(nw.annualSSTotal < est.annualSSTotal)
    assert.equal(nw.isTarifaPlana, true)
    assert.equal(nw.monthlySSQuota, 80)
  })

  it('more children → lower IRPF', () => {
    assert.ok(calculateAutonomo({ ...base, numChildren: 2 }).irpfTotal < calculateAutonomo(base).irpfTotal)
  })

  it('zero income returns zero everything', () => {
    const r = calculateAutonomo({ ...base, annualNetRevenue: 0 })
    assert.equal(r.irpfTotal, 0)
    assert.equal(r.netTakeHome, 0)
    assert.equal(r.effectiveIrpfRate, 0)
  })

  it('Madrid < Catalunya for same income', () => {
    assert.ok(
      calculateAutonomo({ ...base, annualNetRevenue: 50000 }).totalBurden <
      calculateAutonomo({ ...base, annualNetRevenue: 50000, region: 'catalunya' }).totalBurden
    )
  })

  it('IRPF state component for €80k verified', () => {
    const r = calculateAutonomo({ ...base, annualNetRevenue: 80000 })
    assert.equal(r.irpfState, 10833.66)
  })

  it('SS cost > revenue → reducedNetIncome clamps to 0', () => {
    const r = calculateAutonomo({ ...base, annualNetRevenue: 2400, timeAsAutonomo: 'established' })
    assert.equal(r.reducedNetIncome, 0)
    assert.equal(r.irpfTotal, 0)
    assert.equal(r.netTakeHome, 0)
  })
})
