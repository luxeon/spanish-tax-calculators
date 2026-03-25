# spanish-tax-calculators

[![npm](https://img.shields.io/npm/v/spanish-tax-calculators)](https://www.npmjs.com/package/spanish-tax-calculators)

Pure JavaScript calculators for Spanish taxes — no dependencies, no UI.

## Demo

[calculators.dslab.fyi](https://calculators.dslab.fyi/)

## Install

```bash
npm install spanish-tax-calculators
```

## Usage

```js
import {
  calculateAutonomo,
  calculateJointTax,
  optimizeCollaboratorSalary,
  calculateItpAmount,
} from 'spanish-tax-calculators'

// Autónomo tax breakdown
const result = calculateAutonomo({
  annualNetRevenue: 50000,
  autonomoType: 'individual',
  region: 'madrid',
  year: 2026,
})
console.log(result.netTakeHome) // → 33495.38

// Autónomo + Colaborador joint optimization
const optimized = optimizeCollaboratorSalary({
  userNetIncome: 50000,
  region: 'madrid',
  autonomoType: 'individual',
})
console.log(optimized.optimalMonthly) // → 1000

// ITP property transfer tax
const itp = calculateItpAmount(300000, {
  itp_brackets: [
    { upTo: 400000, rate: 8.0 },
    { upTo: 600000, rate: 9.0 },
    { upTo: null, rate: 10.0 },
  ],
})
console.log(itp) // → 24000
```

## API Reference

### Autónomo

| Function | Description |
|---|---|
| `calculateAutonomo(params)` | Full autónomo tax breakdown: SS, IRPF, net take-home |
| `calcGeneralExpenses(revenue, type)` | General expenses deduction (7% individual, 3% director, max €2,000) |
| `calcPersonalMinimum({ age, children, disability })` | Personal minimum allowance (mínimo personal y familiar) |

### IRPF

| Function | Description |
|---|---|
| `calcProgressiveTax(base, brackets)` | Progressive tax from any bracket table |
| `calcProgressiveTaxWithBreakdown(base, brackets)` | Same, with per-bracket breakdown |
| `calcIrpfState(base)` | State IRPF component |
| `calcIrpfRegional(base, region)` | Regional IRPF for 19 comunidades autónomas |
| `IRPF_REGIONAL_BRACKETS` | All regional bracket tables |

### Social Security

| Function | Description |
|---|---|
| `findSSBracket(monthlyIncome)` | Find SS bracket (1–15 tramos) |
| `findSSQuota(monthlyIncome, year, timeAsAutonomo)` | Monthly SS quota (with tarifa plana support) |
| `findSSQuotaForCollaborator(monthlyIncome, year)` | RETA quota for autónomo colaborador |

### Autónomo Colaborador

| Function | Description |
|---|---|
| `calculateCollaboratorSide(params)` | Collaborator tax breakdown |
| `calculateJointTax(params)` | Combined autonomo + collaborator picture |
| `optimizeCollaboratorSalary(params)` | Find optimal collaborator salary to minimize tax |
| `calcWorkIncomeReduction(rendimientoNeto)` | Reducción por rendimientos del trabajo (Art. 20 LIRPF) |

### ITP (Property Transfer Tax)

| Function | Description |
|---|---|
| `calculateItpAmount(price, region)` | ITP with progressive brackets or flat rate fallback |

## Data

Regional tax data (ITP, AJD, IGIC rates) is available via the JSON file at `src/data/spain-tax-data.json`.

## License

MIT
