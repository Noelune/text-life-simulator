export type WorldId = 'modern' | 'xianxia' | 'wuxia'

export type Difficulty = '轻松' | '普通' | '残酷'

export type Gender = '男' | '女' | '无定'

export type PanelId = '属性' | '路线' | '背包' | '技能' | '关系' | '成就' | '图鉴' | '设置'

export type RouteId =
  | 'modern-education'
  | 'modern-career'
  | 'modern-business'
  | 'modern-family'
  | 'modern-fame'
  | 'xianxia-sect'
  | 'xianxia-wanderer'
  | 'xianxia-craft'
  | 'xianxia-karma'
  | 'xianxia-ascension'
  | 'wuxia-dojo'
  | 'wuxia-arena'
  | 'wuxia-legion'
  | 'wuxia-secret'
  | 'wuxia-grandmaster'

export type StatKey =
  | 'age'
  | 'money'
  | 'ability'
  | 'health'
  | 'reputation'
  | 'charm'
  | 'mind'
  | 'luck'
  | 'education'
  | 'career'
  | 'property'
  | 'investment'
  | 'love'
  | 'family'
  | 'realm'
  | 'spiritRoot'
  | 'comprehension'
  | 'bone'
  | 'spiritPower'
  | 'karma'
  | 'alchemy'
  | 'artifact'
  | 'sect'
  | 'blood'
  | 'combat'
  | 'martial'
  | 'dojo'
  | 'arena'
  | 'legion'
  | 'breakthrough'

export type Stats = Record<StatKey, number>

export type CharacterDraft = {
  name: string
  gender: Gender
  origin: string
  talent: string
  difficulty: Difficulty
}

export type WorldConfig = {
  id: WorldId
  name: string
  subtitle: string
  theme: string
  ageLabel: string
  startAge: number
  maxAge: number
  origins: string[]
  featuredStats: StatKey[]
}

export type Talent = {
  id: string
  name: string
  desc: string
  effects: Partial<Stats>
}

export type EventOption = {
  text: string
  effects: Partial<Stats>
  routeEffects?: Partial<Record<RouteId, number>>
  tags?: string[]
  item?: string
  skill?: string
  relation?: string
  achievement?: string
  log?: string
}

export type GameAction = Omit<EventOption, 'text'> & {
  id: string
  world: WorldId
  name: string
  desc: string
  category: '成长' | '财富' | '关系' | '冒险' | '恢复'
  cooldown?: number
  requirement?: Partial<Record<StatKey, number>>
}

export type GameEvent = {
  id: string
  world: WorldId
  title: string
  text: string
  minAge?: number
  condition?: Partial<Record<StatKey, number>>
  requiredFlags?: string[]
  requiredAnyFlags?: string[]
  excludeFlags?: string[]
  options: EventOption[]
}

export type Ending = {
  id: string
  world: WorldId
  title: string
  rarity: '失败' | '普通' | '稀有' | '隐藏'
  desc: string
  condition: Partial<Record<StatKey, number>>
  routeCondition?: Partial<Record<RouteId, number>>
  routeStageCondition?: Partial<Record<RouteId, number>>
  tags?: string[]
}

export type RouteStage = {
  title: string
  points: number
}

export type LifeRoute = {
  id: RouteId
  world: WorldId
  name: string
  desc: string
  stages: RouteStage[]
}

export type RouteProgress = Partial<Record<RouteId, number>>

export type LifeLog = {
  year: number
  text: string
}

export type GameState = {
  version?: number
  seed?: string
  worldId: WorldId
  character: CharacterDraft
  stats: Stats
  routes: RouteProgress
  stage: number
  logs: LifeLog[]
  inventory: string[]
  skills: string[]
  relations: string[]
  achievements: string[]
  flags: string[]
  actionCooldowns: Record<string, number>
  pendingEvent?: GameEvent
  endingId?: string
  cheatApplied?: boolean
}

export type MetaState = {
  version?: number
  endings: string[]
  achievements: string[]
  settings: {
    autoSave: boolean
    compactText: boolean
  }
  cheatNext: boolean
}
