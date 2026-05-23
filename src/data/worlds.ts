import type { WorldConfig } from '../game/types'

export const worlds: WorldConfig[] = [
  {
    id: 'modern',
    name: '现代都市',
    subtitle: '学历、职业、投资、家庭与名望在同一座城市里互相追逐。',
    theme: 'modern',
    ageLabel: '年龄',
    startAge: 18,
    maxAge: 95,
    origins: ['普通家庭', '小镇做题家', '商贾之家', '艺术世家', '负债家庭'],
    featuredStats: ['money', 'ability', 'education', 'career', 'property', 'investment', 'love', 'family'],
  },
  {
    id: 'xianxia',
    name: '修仙世界',
    subtitle: '灵根、宗门、秘境、渡劫与因果，决定此生能否问鼎大道。',
    theme: 'xianxia',
    ageLabel: '年岁',
    startAge: 16,
    maxAge: 520,
    origins: ['山村孤儿', '修真世家', '外门杂役', '凡国皇族', '散修后裔'],
    featuredStats: ['realm', 'spiritRoot', 'comprehension', 'bone', 'spiritPower', 'alchemy', 'artifact', 'karma'],
  },
  {
    id: 'wuxia',
    name: '高武世界',
    subtitle: '气血、武技、擂台、试炼与军团功勋，把凡人推向极限。',
    theme: 'wuxia',
    ageLabel: '战龄',
    startAge: 15,
    maxAge: 120,
    origins: ['武馆学徒', '边城少年', '军团遗孤', '财阀旁支', '旧伤病号'],
    featuredStats: ['blood', 'combat', 'martial', 'dojo', 'arena', 'legion', 'breakthrough', 'reputation'],
  },
]

export const getWorld = (id: WorldConfig['id']) => worlds.find((world) => world.id === id) ?? worlds[0]
