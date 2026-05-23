import type { Stats, WorldId } from './types'

export const applyCheatStats = (stats: Stats, worldId: WorldId): Stats => {
  const boosted: Stats = { ...stats }
  ;(['money', 'ability', 'health', 'reputation', 'charm', 'mind', 'luck'] as const).forEach((key) => {
    boosted[key] = 999
  })
  if (worldId === 'modern') {
    ;(['education', 'career', 'property', 'investment', 'love', 'family'] as const).forEach((key) => {
      boosted[key] = 999
    })
  }
  if (worldId === 'xianxia') {
    ;(['realm', 'spiritRoot', 'comprehension', 'bone', 'spiritPower', 'karma', 'alchemy', 'artifact', 'sect'] as const).forEach((key) => {
      boosted[key] = 999
    })
  }
  if (worldId === 'wuxia') {
    ;(['blood', 'combat', 'martial', 'dojo', 'arena', 'legion', 'breakthrough'] as const).forEach((key) => {
      boosted[key] = 999
    })
  }
  return boosted
}
