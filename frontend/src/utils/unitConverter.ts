import convert, { type Mass, type Volume } from 'convert'

// COUNTS
export const CANONICAL_COUNT = 'each'

// WEIGHTS
export const CANONICAL_WEIGHT = 'g'
const METRIC_WEIGHTS = ['mg', 'g', 'kg'] as const satisfies readonly Mass[]
const US_WEIGHTS = ['oz', 'lb'] as const satisfies readonly Mass[]
export const SUPPORTED_WEIGHTS = [...METRIC_WEIGHTS, ...US_WEIGHTS]
export type WeightUnit = typeof SUPPORTED_WEIGHTS[number];

// VOLUMES
export const CANONICAL_VOLUME = 'mL'
const METRIC_VOLUMES = ['mL', 'cl', 'dl', 'l'] as const satisfies readonly Volume[]
const US_VOLUMES = ['tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal'] as const satisfies readonly Volume[]
export const SUPPORTED_VOLUMES = [...METRIC_VOLUMES, ...US_VOLUMES]
export type VolumeUnit = typeof SUPPORTED_VOLUMES[number];

const FRACTION_UNITS = new Set<WeightUnit | VolumeUnit>([...US_WEIGHTS, ...US_VOLUMES])

export function isWeightUnit(unit: string): unit is WeightUnit {
  return (SUPPORTED_WEIGHTS as readonly string[]).includes(unit)
}

export function isVolumeUnit(unit: string): unit is VolumeUnit {
  return (SUPPORTED_VOLUMES as readonly string[]).includes(unit)
}

export function toCanonical(quantity: number, unit: WeightUnit | VolumeUnit): number {
  return isWeightUnit(unit)
    ? convert(quantity, unit).to(CANONICAL_WEIGHT)
    : convert(quantity, unit).to(CANONICAL_VOLUME)
}

export function fromCanonical(quantity: number, unit: WeightUnit | VolumeUnit): number {
  return isWeightUnit(unit)
    ? convert(quantity, CANONICAL_WEIGHT).to(unit)
    : convert(quantity, CANONICAL_VOLUME).to(unit)
}

// Parse a user-entered quantity into a number. Accepts decimals ("0.25"),
// simple fractions ("1/4"), and mixed numbers ("1 1/2"). Returns null when the
// input can't be understood, so callers can surface a validation error.
export function parseQuantity(input: string): number | null {
  const s = input.trim()
  if (s === '') return null

  let value: number
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (mixed) value = +mixed[1] + +mixed[2] / +mixed[3]
  else if (frac) value = +frac[1] / +frac[2]
  else value = Number(s)

  return Number.isFinite(value) && value >= 0 ? value : null
}

// Format a number as a cooking-friendly fraction (e.g. 0.25 -> "1/4",
// 1.5 -> "1 1/2"). Snaps to the nearest common culinary denominator within a
// small tolerance; values that aren't close to a nice fraction fall back to a
// 2-decimal string. Intended for US-customary units only
function toFraction(value: number): string {
  const whole = Math.floor(value)
  const frac = value - whole
  if (frac < 1e-6) return `${whole}`

  let best = { num: 0, den: 1, err: Infinity }
  for (const den of [2, 3, 4, 8, 16]) {
    const num = Math.round(frac * den)
    const err = Math.abs(frac - num / den)
    if (num > 0 && num < den && err < best.err) best = { num, den, err }
  }
  if (best.err > 0.02) return value.toFixed(2)

  const f = `${best.num}/${best.den}`
  return whole > 0 ? `${whole} ${f}` : f
}

export function formatQuantity(value: number, unit: WeightUnit | VolumeUnit): string {
  return FRACTION_UNITS.has(unit) ? toFraction(value) : value.toFixed(2)
}
