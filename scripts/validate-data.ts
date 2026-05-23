import { readFileSync } from 'node:fs'

import { actions } from '../src/data/actions'
import { endings } from '../src/data/endings'
import { events } from '../src/data/events'
import { milestones } from '../src/data/milestones'
import { talents } from '../src/data/talents'
import { worlds } from '../src/data/worlds'

type DataItem = Record<string, unknown>

type DataError = {
  file: string
  id: string
  reason: string
}

const errors: DataError[] = []
const typesFile = new URL('../src/game/types.ts', import.meta.url)
const typesSource = readFileSync(typesFile, 'utf8')

const readUnion = (typeName: string) => {
  const match = typesSource.match(new RegExp(`export type ${typeName} =([\\s\\S]*?)(?=\\nexport type |\\n$)`))
  if (!match) throw new Error(`Cannot find union type ${typeName} in src/game/types.ts`)
  return new Set([...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]))
}

const statKeys = readUnion('StatKey')
const actionCategories = readUnion('GameAction')
const endingRarities = readUnion('Ending')
const worldIds = new Set(worlds.map((world) => world.id))
const minEventsPerWorld = 20
const minActionsPerWorld = 5
const minEndingsPerWorld = 20
const requiredEndingRarities = ['失败', '普通', '稀有', '隐藏']

const addError = (file: string, id: unknown, reason: string) => {
  errors.push({ file, id: typeof id === 'string' && id ? id : '(missing id)', reason })
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0

const requireFields = (file: string, item: DataItem, fields: string[]) => {
  for (const field of fields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      addError(file, item.id, `缺少必填字段 ${field}`)
    }
  }
}

const validateUnique = (file: string, items: DataItem[], key: string) => {
  const seen = new Map<string, number>()

  items.forEach((item, index) => {
    const value = item[key]
    if (!isNonEmptyString(value)) {
      addError(file, item.id, `${key} 必须是非空字符串`)
      return
    }

    const firstIndex = seen.get(value)
    if (firstIndex !== undefined) {
      addError(file, item.id, `${key} 重复：${value}，首次出现于第 ${firstIndex + 1} 项`)
      return
    }

    seen.set(value, index)
  })
}

const validateWorldRef = (file: string, item: DataItem) => {
  if (!isNonEmptyString(item.world) || !worldIds.has(item.world)) {
    addError(file, item.id, `world 必须引用存在的世界，当前为 ${String(item.world)}`)
  }
}

const validateStatMap = (file: string, id: unknown, label: string, value: unknown) => {
  if (value === undefined) return

  if (!isPlainObject(value)) {
    addError(file, id, `${label} 必须是对象`)
    return
  }

  for (const [key, statValue] of Object.entries(value)) {
    if (!statKeys.has(key)) addError(file, id, `${label} 包含非法属性 ${key}`)
    if (typeof statValue !== 'number' || Number.isNaN(statValue)) {
      addError(file, id, `${label}.${key} 必须是数字`)
    }
  }
}

const validateStringArray = (file: string, id: unknown, label: string, value: unknown) => {
  if (value === undefined) return

  if (!Array.isArray(value)) {
    addError(file, id, `${label} 必须是字符串数组`)
    return
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) addError(file, id, `${label}[${index}] 必须是非空字符串`)
  })
}

const countByWorld = (items: DataItem[]) => {
  const counts = new Map<string, number>()
  for (const world of worlds) counts.set(world.id, 0)

  for (const item of items) {
    if (typeof item.world === 'string') counts.set(item.world, (counts.get(item.world) ?? 0) + 1)
  }

  return counts
}

const validateMinimumByWorld = (file: string, items: DataItem[], minCount: number, label: string) => {
  const counts = countByWorld(items)
  for (const world of worlds) {
    const count = counts.get(world.id) ?? 0
    if (count < minCount) {
      addError(file, world.id, `每个世界至少需要 ${minCount} 个${label}，当前 ${count} 个`)
    }
  }
}

const validateWorlds = () => {
  const file = 'src/data/worlds.ts'
  validateUnique(file, worlds, 'id')

  worlds.forEach((world) => {
    requireFields(file, world, ['name', 'subtitle', 'theme', 'ageLabel', 'startAge', 'maxAge', 'origins', 'featuredStats'])

    if (typeof world.startAge !== 'number' || typeof world.maxAge !== 'number') {
      addError(file, world.id, 'startAge 和 maxAge 必须是数字')
    } else if (world.startAge >= world.maxAge) {
      addError(file, world.id, 'startAge 必须小于 maxAge')
    }

    validateStringArray(file, world.id, 'origins', world.origins)
    validateStringArray(file, world.id, 'featuredStats', world.featuredStats)
    world.featuredStats?.forEach((key) => {
      if (!statKeys.has(key)) addError(file, world.id, `featuredStats 包含非法属性 ${key}`)
    })
  })
}

const validateEvents = () => {
  const file = 'src/data/events.ts'
  validateUnique(file, events, 'id')
  validateMinimumByWorld(file, events, minEventsPerWorld, '事件')

  events.forEach((event) => {
    requireFields(file, event, ['title', 'text', 'options'])
    validateWorldRef(file, event)
    validateStatMap(file, event.id, 'condition', event.condition)
    validateStringArray(file, event.id, 'requiredFlags', event.requiredFlags)
    validateStringArray(file, event.id, 'requiredAnyFlags', event.requiredAnyFlags)
    validateStringArray(file, event.id, 'excludeFlags', event.excludeFlags)

    if (!Array.isArray(event.options)) {
      addError(file, event.id, 'options 必须是数组')
      return
    }

    if (event.options.length < 2) {
      addError(file, event.id, `每个事件至少需要 2 个 option，当前 ${event.options.length} 个`)
    }

    event.options.forEach((option, index) => {
      const optionId = `${event.id}.options[${index}]`
      if (!isNonEmptyString(option.text)) addError(file, optionId, 'option.text 必须是非空字符串')
      validateStatMap(file, optionId, 'option.effects', option.effects)
      validateStringArray(file, optionId, 'option.tags', option.tags)
    })
  })
}

const validateActions = () => {
  const file = 'src/data/actions.ts'
  validateUnique(file, actions, 'id')
  validateMinimumByWorld(file, actions, minActionsPerWorld, '行动')

  actions.forEach((action) => {
    requireFields(file, action, ['name', 'desc', 'category', 'effects'])
    validateWorldRef(file, action)

    if (!isNonEmptyString(action.category) || !actionCategories.has(action.category)) {
      addError(file, action.id, `category 必须是允许值之一：${[...actionCategories].join(' / ')}`)
    }

    if (action.cooldown !== undefined && (typeof action.cooldown !== 'number' || action.cooldown < 0)) {
      addError(file, action.id, 'cooldown 不能是负数，且必须是数字')
    }

    validateStatMap(file, action.id, 'effects', action.effects)
    validateStatMap(file, action.id, 'requirement', action.requirement)
  })
}

const validateEndings = () => {
  const file = 'src/data/endings.ts'
  validateUnique(file, endings, 'id')
  validateMinimumByWorld(file, endings, minEndingsPerWorld, '结局')

  const raritiesByWorld = new Map<string, Set<string>>()
  worlds.forEach((world) => raritiesByWorld.set(world.id, new Set()))

  endings.forEach((ending) => {
    requireFields(file, ending, ['title', 'rarity', 'desc', 'condition'])
    validateWorldRef(file, ending)

    if (!isNonEmptyString(ending.rarity) || !endingRarities.has(ending.rarity)) {
      addError(file, ending.id, `rarity 必须是：${[...endingRarities].join(' / ')}`)
    }

    if (typeof ending.world === 'string') raritiesByWorld.get(ending.world)?.add(String(ending.rarity))

    validateStatMap(file, ending.id, 'condition', ending.condition)
    validateStringArray(file, ending.id, 'tags', ending.tags)
  })

  for (const world of worlds) {
    const rarities = raritiesByWorld.get(world.id) ?? new Set()
    for (const rarity of requiredEndingRarities) {
      if (!rarities.has(rarity)) addError(file, world.id, `每个世界至少包含 1 个${rarity}结局`)
    }
  }
}

const validateMilestones = () => {
  const file = 'src/data/milestones.ts'
  validateUnique(file, milestones, 'id')

  milestones.forEach((milestone) => {
    requireFields(file, milestone, ['title', 'desc', 'reward', 'condition'])
    validateWorldRef(file, milestone)
    validateStatMap(file, milestone.id, 'condition', milestone.condition)
  })
}

const validateTalents = () => {
  const file = 'src/data/talents.ts'
  validateUnique(file, talents, 'id')
  validateUnique(file, talents, 'name')

  talents.forEach((talent) => {
    requireFields(file, talent, ['name', 'desc', 'effects'])
    validateStatMap(file, talent.id, 'effects', talent.effects)
  })
}

validateWorlds()
validateEvents()
validateActions()
validateEndings()
validateMilestones()
validateTalents()

if (errors.length > 0) {
  console.error(`数据校验失败：发现 ${errors.length} 个问题。`)
  for (const error of errors) console.error(`- ${error.file} :: ${error.id} :: ${error.reason}`)
  process.exit(1)
}

console.log(
  [
    '数据校验通过。',
    `worlds=${worlds.length}`,
    `events=${events.length}`,
    `actions=${actions.length}`,
    `endings=${endings.length}`,
    `milestones=${milestones.length}`,
    `talents=${talents.length}`,
  ].join(' '),
)
