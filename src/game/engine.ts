import { endings } from '../data/endings'
import { events } from '../data/events'
import { getRoute, getWorldRoutes } from '../data/routes'
import { talents } from '../data/talents'
import { getWorld } from '../data/worlds'
import { applyCheatStats } from './cheat'
import { createRandomSeed, pickOne } from './random'
import type { CharacterDraft, EventOption, GameAction, GameEvent, GameState, RouteId, RouteProgress, StatKey, Stats, WorldId } from './types'

export const statLabels: Record<keyof Stats, string> = {
  age: '年龄',
  money: '金钱',
  ability: '能力',
  health: '健康',
  reputation: '声望',
  charm: '魅力',
  mind: '心性',
  luck: '运气',
  education: '学历',
  career: '职业',
  property: '房产',
  investment: '投资',
  love: '恋爱',
  family: '家庭',
  realm: '境界',
  spiritRoot: '灵根',
  comprehension: '悟性',
  bone: '根骨',
  spiritPower: '灵力',
  karma: '因果',
  alchemy: '丹药',
  artifact: '法宝',
  sect: '宗门',
  blood: '气血',
  combat: '战力',
  martial: '武技',
  dojo: '武馆',
  arena: '擂台',
  legion: '军团',
  breakthrough: '突破',
}

export const baseStats = (worldId: WorldId): Stats => ({
  age: getWorld(worldId).startAge,
  money: 30,
  ability: 28,
  health: 85,
  reputation: 8,
  charm: 25,
  mind: 30,
  luck: 20,
  education: worldId === 'modern' ? 28 : 0,
  career: worldId === 'modern' ? 15 : 0,
  property: 0,
  investment: 5,
  love: 0,
  family: 20,
  realm: worldId === 'xianxia' ? 8 : 0,
  spiritRoot: worldId === 'xianxia' ? 25 : 0,
  comprehension: worldId === 'xianxia' ? 25 : 10,
  bone: worldId === 'xianxia' ? 25 : 8,
  spiritPower: worldId === 'xianxia' ? 18 : 0,
  karma: 0,
  alchemy: 0,
  artifact: 0,
  sect: 0,
  blood: worldId === 'wuxia' ? 28 : 0,
  combat: worldId === 'wuxia' ? 20 : 0,
  martial: worldId === 'wuxia' ? 18 : 0,
  dojo: 0,
  arena: 0,
  legion: 0,
  breakthrough: 0,
})

export const baseRoutes = (worldId: WorldId): RouteProgress =>
  Object.fromEntries(getWorldRoutes(worldId).map((route) => [route.id, 0])) as RouteProgress

export const hydrateGameState = (state: GameState): GameState => ({
  ...state,
  routes: { ...baseRoutes(state.worldId), ...(state.routes ?? {}) },
})

const clampStats = (stats: Stats): Stats => {
  const next = { ...stats }
  Object.keys(next).forEach((key) => {
    const statKey = key as keyof Stats
    next[statKey] = Math.max(0, Math.min(999, Math.round(next[statKey])))
  })
  return next
}

export const createGame = (worldId: WorldId, character: CharacterDraft, cheatNext: boolean): GameState => {
  const talent = talents.find((item) => item.name === character.talent) ?? talents[0]
  const difficultyEffect = character.difficulty === '轻松' ? 12 : character.difficulty === '残酷' ? -12 : 0
  let stats = clampStats({
    ...baseStats(worldId),
    health: baseStats(worldId).health + difficultyEffect,
    luck: baseStats(worldId).luck + difficultyEffect,
    ...Object.fromEntries(
      Object.entries(talent.effects).map(([key, value]) => [key, (baseStats(worldId)[key as keyof Stats] ?? 0) + (value ?? 0)]),
    ),
  } as Stats)
  if (cheatNext) stats = applyCheatStats(stats, worldId)
  return {
    seed: createRandomSeed(),
    worldId,
    character,
    stats,
    routes: baseRoutes(worldId),
    stage: 1,
    logs: [
      { year: stats.age, text: `${character.name} 出身于${character.origin}，带着“${character.talent}”天赋开始了${getWorld(worldId).name}人生。` },
      ...(cheatNext ? [{ year: stats.age, text: '隐藏开挂模式生效：下一局限定满资源已注入，本次结束后自动关闭。' }] : []),
    ],
    inventory: [],
    skills: [talent.name],
    relations: [],
    achievements: cheatNext ? ['识破命运后台'] : [],
    flags: cheatNext ? ['cheat'] : [],
    actionCooldowns: {},
    cheatApplied: cheatNext,
  }
}

const routeStatMap: Record<WorldId, Partial<Record<StatKey, RouteId[]>>> = {
  modern: {
    education: ['modern-education'],
    ability: ['modern-education', 'modern-career'],
    career: ['modern-career'],
    investment: ['modern-business'],
    property: ['modern-business', 'modern-family'],
    money: ['modern-business'],
    family: ['modern-family'],
    love: ['modern-family'],
    reputation: ['modern-fame'],
    charm: ['modern-fame'],
  },
  xianxia: {
    sect: ['xianxia-sect'],
    reputation: ['xianxia-sect'],
    artifact: ['xianxia-wanderer', 'xianxia-craft'],
    luck: ['xianxia-wanderer'],
    alchemy: ['xianxia-craft'],
    karma: ['xianxia-karma'],
    mind: ['xianxia-karma'],
    comprehension: ['xianxia-karma', 'xianxia-ascension'],
    realm: ['xianxia-ascension'],
    spiritPower: ['xianxia-ascension'],
    bone: ['xianxia-ascension'],
  },
  wuxia: {
    dojo: ['wuxia-dojo'],
    blood: ['wuxia-dojo', 'wuxia-grandmaster'],
    arena: ['wuxia-arena'],
    legion: ['wuxia-legion'],
    combat: ['wuxia-arena', 'wuxia-legion', 'wuxia-secret'],
    breakthrough: ['wuxia-secret'],
    martial: ['wuxia-grandmaster'],
    mind: ['wuxia-grandmaster'],
  },
}

const tagRouteMap: Record<string, RouteId> = {
  startup: 'modern-business',
  'bold-investor': 'modern-business',
  'career-first': 'modern-career',
  'public-face': 'modern-fame',
  'borrow-fame': 'modern-fame',
  'new-city': 'modern-career',
  beast: 'xianxia-wanderer',
  secret: 'xianxia-wanderer',
  tribulation: 'xianxia-ascension',
  'demon-cut': 'xianxia-karma',
  auction: 'xianxia-craft',
  'ancient-ruin': 'xianxia-wanderer',
  'market-fight': 'xianxia-karma',
  arena: 'wuxia-arena',
  wild: 'wuxia-secret',
  limit: 'wuxia-secret',
  'legion-oath': 'wuxia-legion',
  'injury-fight': 'wuxia-arena',
  ranking: 'wuxia-arena',
  'border-guard': 'wuxia-legion',
}

const addRoutePoints = (base: RouteProgress, routeId: RouteId, value: number) => ({
  ...base,
  [routeId]: Math.max(0, Math.round((base[routeId] ?? 0) + value)),
})

const inferRouteEffects = (worldId: WorldId, effects: Partial<Stats>, tags: string[] = []): RouteProgress => {
  let routeEffects: RouteProgress = {}
  Object.entries(effects).forEach(([key, value]) => {
    if (!value || value <= 0) return
    const routeIds = routeStatMap[worldId][key as StatKey] ?? []
    routeIds.forEach((routeId) => {
      routeEffects = addRoutePoints(routeEffects, routeId, Math.max(1, Math.ceil(value * 0.75)))
    })
  })
  tags.forEach((tag) => {
    const routeId = tagRouteMap[tag] ?? (tag.startsWith('route:') ? (tag.slice(6) as RouteId) : tag.startsWith('route-') ? (tag.slice(6) as RouteId) : undefined)
    if (routeId && getWorldRoutes(worldId).some((route) => route.id === routeId)) {
      routeEffects = addRoutePoints(routeEffects, routeId, 16)
    }
  })
  return routeEffects
}

const applyRouteEffects = (state: GameState, source: Pick<EventOption, 'effects' | 'routeEffects' | 'tags'>): RouteProgress => {
  const explicit = source.routeEffects ?? {}
  const inferred = inferRouteEffects(state.worldId, source.effects, source.tags)
  let next: RouteProgress = { ...baseRoutes(state.worldId), ...(state.routes ?? {}) }
  ;[inferred, explicit].forEach((routeEffects) => {
    Object.entries(routeEffects).forEach(([routeId, value]) => {
      next = addRoutePoints(next, routeId as RouteId, value ?? 0)
    })
  })
  return next
}

export const getRouteStageIndex = (routeId: RouteId, points: number) => {
  const route = getRoute(routeId)
  return route.stages.reduce((stageIndex, stage, index) => (points >= stage.points ? index : stageIndex), 0)
}

export const getRouteStage = (routeId: RouteId, points: number) => getRoute(routeId).stages[getRouteStageIndex(routeId, points)]

export const getMainRoute = (state: GameState) => {
  const worldRoutes = getWorldRoutes(state.worldId)
  const routes = { ...baseRoutes(state.worldId), ...(state.routes ?? {}) }
  const route = [...worldRoutes].sort((a, b) => (routes[b.id] ?? 0) - (routes[a.id] ?? 0))[0]
  const points = routes[route.id] ?? 0
  return { route, points, stage: getRouteStage(route.id, points), stageIndex: getRouteStageIndex(route.id, points) }
}

const ageStep = (worldId: WorldId) => (worldId === 'xianxia' ? 3 : 1)

const randomEvent = (state: GameState): GameEvent => {
  const pool = events.filter((event) => {
    if (event.world !== state.worldId) return false
    if (event.minAge && state.stats.age < event.minAge) return false
    if (event.requiredFlags?.some((flag) => !state.flags.includes(flag))) return false
    if (event.requiredAnyFlags?.length && !event.requiredAnyFlags.some((flag) => state.flags.includes(flag))) return false
    if (event.excludeFlags?.some((flag) => state.flags.includes(flag))) return false
    if (!event.condition) return true
    return Object.entries(event.condition).every(([key, value]) => state.stats[key as keyof Stats] >= value)
  })
  const cheatStory = pool.filter((event) => event.requiredFlags?.includes('cheat') && !state.flags.includes(`seen-${event.id}`))
  const source = cheatStory.length ? cheatStory : pool
  return pickOne(source) ?? events.find((event) => event.world === state.worldId)!
}

export const nextStage = (state: GameState): GameState => {
  if (state.endingId) return state
  const world = getWorld(state.worldId)
  const passive: Partial<Stats> = {
    age: ageStep(state.worldId),
    health: -(state.character.difficulty === '残酷' ? 6 : 3),
    money: (state.stats.career + state.stats.investment) / 18,
    reputation: Math.max(0, state.stats.ability - 50) / 40,
  }
  const stats = clampStats({
    ...state.stats,
    ...Object.fromEntries(Object.entries(passive).map(([key, value]) => [key, state.stats[key as keyof Stats] + (value ?? 0)])),
  } as Stats)
  const aged = {
    ...state,
    stats,
    stage: state.stage + 1,
    actionCooldowns: Object.fromEntries(Object.entries(state.actionCooldowns).map(([key, value]) => [key, Math.max(0, value - 1)])),
    pendingEvent: randomEvent({ ...state, stats }),
    logs: [{ year: stats.age, text: `${world.ageLabel} ${stats.age}：新阶段开始，命运递来一张未拆封的牌。` }, ...state.logs].slice(0, 80),
  }
  return resolveEnding(aged)
}

export const applyOption = (state: GameState, option: EventOption): GameState => {
  if (!state.pendingEvent || state.endingId) return state
  const stats = clampStats({ ...state.stats, ...Object.fromEntries(Object.entries(option.effects).map(([key, value]) => [key, state.stats[key as keyof Stats] + (value ?? 0)])) } as Stats)
  const addUnique = (list: string[], value?: string) => (value && !list.includes(value) ? [value, ...list] : list)
  const next: GameState = {
    ...state,
    stats,
    routes: applyRouteEffects(state, option),
    pendingEvent: undefined,
    flags: [...new Set([...state.flags, `seen-${state.pendingEvent.id}`, ...(option.tags ?? [])])],
    inventory: addUnique(state.inventory, option.item),
    skills: addUnique(state.skills, option.skill),
    relations: addUnique(state.relations, option.relation),
    achievements: addUnique(state.achievements, option.achievement),
    logs: [
      { year: stats.age, text: option.log ?? `你选择了“${option.text}”。` },
      { year: stats.age, text: `${state.pendingEvent.title}：${option.text}` },
      ...state.logs,
    ].slice(0, 100),
  }
  return resolveEnding(next)
}

export const applyAction = (state: GameState, action: GameAction): GameState => {
  if (state.endingId) return state
  const blocked = action.requirement && !Object.entries(action.requirement).every(([key, value]) => state.stats[key as keyof Stats] >= value)
  const cooling = (state.actionCooldowns[action.id] ?? 0) > 0
  if (blocked || cooling) {
    return {
      ...state,
      logs: [
        {
          year: state.stats.age,
          text: blocked ? `行动失败：${action.name} 的条件还不满足。` : `行动失败：${action.name} 仍在冷却中。`,
        },
        ...state.logs,
      ].slice(0, 100),
    }
  }
  const stats = clampStats({
    ...state.stats,
    ...Object.fromEntries(Object.entries(action.effects).map(([key, value]) => [key, state.stats[key as keyof Stats] + (value ?? 0)])),
  } as Stats)
  const addUnique = (list: string[], value?: string) => (value && !list.includes(value) ? [value, ...list] : list)
  const next: GameState = {
    ...state,
    stats,
    routes: applyRouteEffects(state, action),
    flags: [...new Set([...state.flags, ...(action.tags ?? [])])],
    inventory: addUnique(state.inventory, action.item),
    skills: addUnique(state.skills, action.skill),
    relations: addUnique(state.relations, action.relation),
    achievements: addUnique(state.achievements, action.achievement),
    actionCooldowns: { ...state.actionCooldowns, [action.id]: action.cooldown ?? 1 },
    logs: [{ year: stats.age, text: action.log ?? `你执行了行动：${action.name}。` }, ...state.logs].slice(0, 100),
  }
  return resolveEnding(next)
}

export const resolveEnding = (state: GameState): GameState => {
  if (state.endingId) return state
  const world = getWorld(state.worldId)
  const earlyStage = state.stage < 18 && !state.flags.includes('cheat')
  const cheatStoryStage = state.flags.includes('cheat') && !state.flags.includes('cheat-finale-ready')
  const possible = endings
    .filter((ending) => ending.world === state.worldId)
    .filter(() => !cheatStoryStage)
    .filter((ending) => !earlyStage || ending.rarity === '失败')
    .filter((ending) => meetsEndingCondition(state, ending.condition, ending.rarity, ending.routeCondition, ending.routeStageCondition))
    .sort((a, b) => rarityScore(b.rarity) - rarityScore(a.rarity))
  const forcedAge = state.stats.age >= world.maxAge
  const ending = selectEnding(state, possible) ?? (forcedAge ? fallbackEnding(state.worldId) : undefined)
  if (!ending) return state
  return {
    ...state,
    endingId: ending.id,
    pendingEvent: undefined,
    logs: [{ year: state.stats.age, text: `结局达成：${ending.title}。${ending.desc}` }, ...state.logs],
  }
}

const rarityScore = (rarity: string) => ({ 隐藏: 4, 稀有: 3, 普通: 2, 失败: 1 })[rarity] ?? 0

const selectEnding = (state: GameState, possible: typeof endings) => {
  if (!possible.length) return undefined
  const routed = preferredCheatEnding(state)
  if (routed) {
    const ending = possible.find((item) => item.id === routed)
    if (ending) return ending
  }
  const topScore = rarityScore(possible[0].rarity)
  const topCandidates = possible.filter((ending) => rarityScore(ending.rarity) === topScore)
  if (!state.flags.includes('cheat') || topCandidates.length === 1) return topCandidates[0]
  return pickOne(topCandidates)
}

const preferredCheatEnding = (state: GameState) => {
  if (!state.flags.includes('cheat')) return undefined
  if (state.flags.includes('cheat-route-balance')) {
    return state.worldId === 'modern' ? 'modern-cheat-city-god' : state.worldId === 'xianxia' ? 'xianxia-cheat-heaven-source' : 'wuxia-cheat-star-emperor'
  }
  if (state.flags.includes('cheat-route-limit')) {
    return state.worldId === 'modern' ? 'modern-cheat-everything-king' : state.worldId === 'xianxia' ? 'xianxia-cheat-all-realms-lord' : 'wuxia-cheat-body-universe'
  }
  if (state.flags.includes('cheat-route-admin')) {
    return state.worldId === 'modern' ? 'modern-cheat-authority' : state.worldId === 'xianxia' ? 'xianxia-cheat-heaven-admin' : 'wuxia-cheat-panel-sovereign'
  }
  return undefined
}

const meetsEndingCondition = (
  state: GameState,
  condition: Partial<Record<keyof Stats, number>>,
  rarity: string,
  routeCondition?: Partial<Record<RouteId, number>>,
  routeStageCondition?: Partial<Record<RouteId, number>>,
) => {
  const statsPassed = Object.entries(condition).every(([key, value]) => {
    const statKey = key as keyof Stats
    if (rarity === '失败' && value === 0 && ['health', 'money', 'mind'].includes(statKey)) {
      return state.stats[statKey] <= 0
    }
    return state.stats[statKey] >= (value ?? 0)
  })
  const routes = { ...baseRoutes(state.worldId), ...(state.routes ?? {}) }
  const routePointsPassed = Object.entries(routeCondition ?? {}).every(([routeId, value]) => (routes[routeId as RouteId] ?? 0) >= (value ?? 0))
  const routeStagesPassed = Object.entries(routeStageCondition ?? {}).every(([routeId, value]) => getRouteStageIndex(routeId as RouteId, routes[routeId as RouteId] ?? 0) >= (value ?? 0))
  return statsPassed && routePointsPassed && routeStagesPassed
}

const fallbackEnding = (worldId: WorldId) => {
  const id = worldId === 'modern' ? 'modern-warm' : worldId === 'xianxia' ? 'xianxia-master' : 'wuxia-champ'
  return endings.find((ending) => ending.id === id)
}

export const randomCharacter = (worldId: WorldId): CharacterDraft => {
  const names = ['林越', '许知安', '沈青禾', '陆星河', '周砚', '顾云起', '秦照夜', '温南枝']
  const world = getWorld(worldId)
  const genders = ['男', '女', '无定'] as const
  const difficulties = ['轻松', '普通', '残酷'] as const
  return {
    name: pickOne(names) ?? names[0],
    gender: pickOne(genders) ?? genders[0],
    origin: pickOne(world.origins) ?? world.origins[0],
    talent: (pickOne(talents) ?? talents[0]).name,
    difficulty: pickOne(difficulties) ?? difficulties[0],
  }
}
