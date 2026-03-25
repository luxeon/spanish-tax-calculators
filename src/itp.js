/**
 * ITP (Impuesto sobre Transmisiones Patrimoniales) calculator.
 *
 * Calculates property transfer tax for resale properties across all
 * Spanish autonomous communities. Supports both flat rates and
 * progressive bracket scales, including date-conditional transitions.
 */

/**
 * Calculate ITP amount for a resale property.
 *
 * @param {number} price - property price (€)
 * @param {object} region - region data object from spain-tax-data.json
 * @returns {number} ITP amount (€)
 */
export function calculateItpAmount(price, region) {
  if (region == null || !price || price <= 0) return 0

  let brackets = region.itp_brackets
  if (!brackets || brackets.length === 0) return price * (region.itp_standard || 0) / 100

  // Date-conditional transition (e.g. Comunidad Valenciana from 2026-07-01)
  if (region.itp_brackets_transition) {
    const transitionDate = new Date(region.itp_brackets_transition.effective_from)
    const transitionBrackets = region.itp_brackets_transition.brackets
    if (
      !isNaN(transitionDate.getTime()) &&
      new Date() >= transitionDate &&
      Array.isArray(transitionBrackets) &&
      transitionBrackets.length > 0
    ) {
      brackets = transitionBrackets
    }
  }

  let total = 0
  let prev = 0
  for (const bracket of brackets) {
    const limit = bracket.upTo ?? Infinity
    const portion = Math.min(price - prev, limit - prev)
    if (portion <= 0) break
    total += portion * bracket.rate / 100
    prev = limit
    if (prev >= price) break
  }
  return Math.round(total * 100) / 100
}
