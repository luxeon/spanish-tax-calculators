import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calculateItpAmount } from '../src/itp.js'

const FLAT_REGION = { itp_standard: 7.0 }
const BRACKET_REGION = {
  itp_standard: 8.0,
  itp_brackets: [
    { upTo: 400000, rate: 8.0 },
    { upTo: null, rate: 10.0 },
  ],
}

describe('calculateItpAmount', () => {
  describe('input guards', () => {
    it('returns 0 for null region', () => { assert.equal(calculateItpAmount(200000, null), 0) })
    it('returns 0 for zero price', () => { assert.equal(calculateItpAmount(0, FLAT_REGION), 0) })
    it('returns 0 for negative price', () => { assert.equal(calculateItpAmount(-100, FLAT_REGION), 0) })
  })

  describe('flat-rate fallback', () => {
    it('uses itp_standard when no brackets', () => {
      assert.equal(calculateItpAmount(200000, FLAT_REGION), 14000)
    })
    it('falls back when brackets is empty array', () => {
      assert.equal(calculateItpAmount(200000, { itp_standard: 7.0, itp_brackets: [] }), 14000)
    })
  })

  describe('progressive brackets', () => {
    it('price in first bracket', () => {
      assert.equal(calculateItpAmount(200000, BRACKET_REGION), 16000)
    })
    it('price spanning two brackets', () => {
      assert.equal(calculateItpAmount(500000, BRACKET_REGION), 42000)
    })
    it('price exactly at boundary', () => {
      assert.equal(calculateItpAmount(400000, BRACKET_REGION), 32000)
    })
  })
})
