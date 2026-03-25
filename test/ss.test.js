import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  findSSBracket,
  findSSQuota,
  findSSQuotaForCollaborator,
} from '../src/ss.js'

describe('findSSBracket', () => {
  it('returns bracket 1 for zero income', () => {
    assert.equal(findSSBracket(0).id, 1)
  })
  it('returns bracket 1 for exactly €670', () => {
    assert.equal(findSSBracket(670).id, 1)
  })
  it('returns bracket 2 for €670.01', () => {
    assert.equal(findSSBracket(670.01).id, 2)
  })
  it('returns bracket 9 for €2,100', () => {
    assert.equal(findSSBracket(2100).id, 9)
  })
  it('returns bracket 14 for €5,000', () => {
    assert.equal(findSSBracket(5000).id, 14)
  })
  it('returns bracket 15 for €7,000', () => {
    assert.equal(findSSBracket(7000).id, 15)
  })
})

describe('findSSQuota', () => {
  it('returns tarifa plana (€80) for new autonomo', () => {
    const r = findSSQuota(2000, 2026, 'new')
    assert.equal(r.isTarifaPlana, true)
    assert.equal(r.monthlyQuota, 80)
  })
  it('returns 2026 quota for bracket 1 (established)', () => {
    const r = findSSQuota(500, 2026, 'established')
    assert.equal(r.isTarifaPlana, false)
    assert.equal(r.bracketId, 1)
    assert.equal(r.monthlyQuota, 205.23)
  })
  it('returns 2026 quota for bracket 15 (established)', () => {
    const r = findSSQuota(10000, 2026, 'established')
    assert.equal(r.bracketId, 15)
    assert.equal(r.monthlyQuota, 607.35)
  })
  it('returns same quota for all years beyond 2026', () => {
    assert.equal(findSSQuota(2500, 2028, 'established').monthlyQuota,
                 findSSQuota(2500, 2026, 'established').monthlyQuota)
  })
})

describe('findSSQuotaForCollaborator', () => {
  it('returns zero for zero income', () => {
    const r = findSSQuotaForCollaborator(0)
    assert.equal(r.bracketId, 0)
    assert.equal(r.monthlyQuota, 0)
  })
  it('returns zero for negative income', () => {
    const r = findSSQuotaForCollaborator(-100)
    assert.equal(r.bracketId, 0)
    assert.equal(r.monthlyQuota, 0)
  })
  it('uses bracket 1 minimum quota for income ≤ €670/mo', () => {
    const r = findSSQuotaForCollaborator(500)
    assert.equal(r.bracketId, 1)
    assert.equal(r.monthlyQuota, 205.23)
  })
  it('uses correct quota for bracket 4', () => {
    const r = findSSQuotaForCollaborator(1250)
    assert.equal(r.bracketId, 4)
    assert.equal(r.monthlyQuota, 299.56)
  })
})
