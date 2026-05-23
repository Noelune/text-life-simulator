export type RandomFloat = () => number

const hashSeed = (seed: string | number) => {
  const text = String(seed)
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const createSeededRandom = (seed: string | number): RandomFloat => {
  let state = hashSeed(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export const randomFloat = (source: RandomFloat = Math.random) => source()

export const randomInt = (max: number, source: RandomFloat = Math.random) => {
  const limit = Math.floor(max)
  if (!Number.isFinite(limit) || limit <= 0) return 0
  return Math.floor(randomFloat(source) * limit)
}

export const pickOne = <T>(items: readonly T[], source: RandomFloat = Math.random): T | undefined => {
  if (!items.length) return undefined
  return items[randomInt(items.length, source)]
}

export const createRandomSeed = () => `${Date.now().toString(36)}-${randomInt(36 ** 6).toString(36).padStart(6, '0')}`
