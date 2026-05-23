import type { GameState, MetaState } from './types'
import { hydrateGameState } from './engine'

const SAVE_KEY = 'text-life-simulator-save'
const META_KEY = 'text-life-simulator-meta'

export const CURRENT_SAVE_VERSION = 1
export const CURRENT_META_VERSION = 1

export const defaultMeta: MetaState = {
  version: CURRENT_META_VERSION,
  endings: [],
  achievements: [],
  settings: { autoSave: true, compactText: false },
  cheatNext: false,
}

const getStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

const readJson = (key: string): unknown => {
  try {
    const raw = getStorage()?.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeJson = (key: string, value: unknown) => {
  try {
    getStorage()?.setItem(key, JSON.stringify(value))
  } catch {
    // 存储不可用时跳过，读取侧会回退默认值。
  }
}

const removeJson = (key: string) => {
  try {
    getStorage()?.removeItem(key)
  } catch {
    // localStorage 不可用时无需额外处理。
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getVersion = (value: Record<string, unknown>) => (typeof value.version === 'number' ? value.version : 0)

const stringList = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])

const uniqueStrings = (value: unknown) => Array.from(new Set(stringList(value)))

const numberRecord = (value: unknown) =>
  isRecord(value)
    ? Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'number'))
    : {}

export const migrateGameState = (raw: unknown): GameState | null => {
  if (!isRecord(raw)) return null

  const version = getVersion(raw)
  const migrated = { ...raw }

  if (version < 1) {
    migrated.actionCooldowns = numberRecord(migrated.actionCooldowns)
    migrated.flags = uniqueStrings(migrated.flags)
    migrated.achievements = uniqueStrings(migrated.achievements)
    migrated.inventory = uniqueStrings(migrated.inventory)
    migrated.skills = uniqueStrings(migrated.skills)
    migrated.relations = uniqueStrings(migrated.relations)
    migrated.cheatApplied = typeof migrated.cheatApplied === 'boolean' ? migrated.cheatApplied : false
  }

  return {
    ...migrated,
    actionCooldowns: numberRecord(migrated.actionCooldowns),
    flags: uniqueStrings(migrated.flags),
    achievements: uniqueStrings(migrated.achievements),
    inventory: uniqueStrings(migrated.inventory),
    skills: uniqueStrings(migrated.skills),
    relations: uniqueStrings(migrated.relations),
    cheatApplied: typeof migrated.cheatApplied === 'boolean' ? migrated.cheatApplied : false,
    version: CURRENT_SAVE_VERSION,
  } as GameState
}

export const migrateMetaState = (raw: unknown): MetaState => {
  if (!isRecord(raw)) return defaultMeta

  const version = getVersion(raw)
  const rawSettings = isRecord(raw.settings) ? raw.settings : {}
  const migrated = { ...raw }

  if (version < 1) {
    migrated.settings = {
      autoSave: typeof rawSettings.autoSave === 'boolean' ? rawSettings.autoSave : defaultMeta.settings.autoSave,
      compactText: typeof rawSettings.compactText === 'boolean' ? rawSettings.compactText : defaultMeta.settings.compactText,
    }
    migrated.cheatNext = typeof migrated.cheatNext === 'boolean' ? migrated.cheatNext : defaultMeta.cheatNext
    migrated.endings = uniqueStrings(migrated.endings)
    migrated.achievements = uniqueStrings(migrated.achievements)
  }

  const settings = isRecord(migrated.settings) ? migrated.settings : {}

  return {
    ...defaultMeta,
    ...migrated,
    version: CURRENT_META_VERSION,
    settings: {
      autoSave: typeof settings.autoSave === 'boolean' ? settings.autoSave : defaultMeta.settings.autoSave,
      compactText: typeof settings.compactText === 'boolean' ? settings.compactText : defaultMeta.settings.compactText,
    },
    cheatNext: typeof migrated.cheatNext === 'boolean' ? migrated.cheatNext : defaultMeta.cheatNext,
    endings: uniqueStrings(migrated.endings),
    achievements: uniqueStrings(migrated.achievements),
  }
}

export const loadGame = () => {
  try {
    const state = migrateGameState(readJson(SAVE_KEY))
    return state ? hydrateGameState(state) : null
  } catch {
    return null
  }
}

export const saveGame = (state: GameState) => writeJson(SAVE_KEY, { ...state, version: CURRENT_SAVE_VERSION })
export const clearGame = () => removeJson(SAVE_KEY)

export const loadMeta = () => migrateMetaState(readJson(META_KEY))

export const saveMeta = (meta: MetaState) => writeJson(META_KEY, migrateMetaState({ ...meta, version: CURRENT_META_VERSION }))

export const resetAllData = () => {
  removeJson(SAVE_KEY)
  removeJson(META_KEY)
}
