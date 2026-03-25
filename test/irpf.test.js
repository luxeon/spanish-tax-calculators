import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcProgressiveTax,
  calcProgressiveTaxWithBreakdown,
  calcIrpfState,
  calcIrpfRegional,
  IRPF_REGIONAL_BRACKETS,
} from '../src/irpf.js'

describe('calcProgressiveTax', () => {
  const brackets = [
    { upTo: 10000, rate: 0.10 },
    { upTo: 20000, rate: 0.20 },
    { upTo: Infinity, rate: 0.30 },
  ]

  it('returns 0 for zero base', () => {
    assert.equal(calcProgressiveTax(0, brackets), 0)
  })
  it('returns 0 for negative base', () => {
    assert.equal(calcProgressiveTax(-100, brackets), 0)
  })
  it('calculates single bracket correctly', () => {
    assert.equal(calcProgressiveTax(5000, brackets), 500)
  })
  it('calculates two brackets correctly', () => {
    assert.equal(calcProgressiveTax(15000, brackets), 2000)
  })
  it('calculates three brackets correctly', () => {
    assert.equal(calcProgressiveTax(25000, brackets), 4500)
  })
})

describe('calcIrpfState', () => {
  it('returns 0 for zero income', () => {
    assert.equal(calcIrpfState(0), 0)
  })
  it('€10,000 → 950', () => {
    assert.equal(calcIrpfState(10000), 950)
  })
  it('€12,450 → 1182.75', () => {
    assert.equal(calcIrpfState(12450), 1182.75)
  })
  it('€15,000 spans two brackets', () => {
    assert.equal(calcIrpfState(15000), 1488.75)
  })
  it('€30,000 correct', () => {
    assert.equal(calcIrpfState(30000), 3582.75)
  })
})

describe('calcIrpfRegional', () => {
  it('returns 0 for zero income', () => {
    assert.equal(calcIrpfRegional(0, 'madrid'), 0)
  })
  it('Madrid < Catalunya for same income', () => {
    assert.ok(calcIrpfRegional(40000, 'madrid') < calcIrpfRegional(40000, 'catalunya'))
  })
  it('falls back for unknown region', () => {
    assert.equal(calcIrpfRegional(30000, 'unknown_region'), 3582.75)
  })
})

describe('calcProgressiveTaxWithBreakdown', () => {
  const brackets = [
    { upTo: 12450, rate: 0.095 },
    { upTo: 20200, rate: 0.12 },
    { upTo: Infinity, rate: 0.15 },
  ]

  it('returns zero for zero base', () => {
    const r = calcProgressiveTaxWithBreakdown(0, brackets)
    assert.equal(r.total, 0)
    assert.deepEqual(r.brackets, [])
  })
  it('total matches calcProgressiveTax', () => {
    for (const base of [0, 5000, 12450, 15000, 35000, 60000, 100000]) {
      assert.equal(
        calcProgressiveTaxWithBreakdown(base, brackets).total,
        calcProgressiveTax(base, brackets)
      )
    }
  })
  it('sum of breakdown taxAmount entries equals total', () => {
    for (const base of [15000, 35000, 100000]) {
      const { total, brackets: bd } = calcProgressiveTaxWithBreakdown(base, brackets)
      const sum = bd.reduce((s, b) => s + b.taxAmount, 0)
      assert.ok(Math.abs(sum - total) < 0.01)
    }
  })
  it('last bracket with Infinity has to = null', () => {
    const { brackets: bd } = calcProgressiveTaxWithBreakdown(100000, brackets)
    assert.equal(bd[bd.length - 1].to, null)
  })
})

describe('IRPF_REGIONAL_BRACKETS', () => {
  it('contains all 19 regions', () => {
    const expected = [
      'andalucia','aragon','asturias','baleares','canarias','cantabria',
      'castilla_la_mancha','castilla_leon','catalunya','comunidad_valenciana',
      'extremadura','galicia','madrid','murcia','la_rioja',
      'navarra','pais_vasco','ceuta','melilla',
    ]
    for (const r of expected) {
      assert.ok(IRPF_REGIONAL_BRACKETS[r], `missing region: ${r}`)
    }
  })
})
