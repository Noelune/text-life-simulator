import { useEffect, useState } from 'react'
import { CharacterCreator } from './components/CharacterCreator'
import { GameScreen } from './components/GameScreen'
import { Home } from './components/Home'
import { endings } from './data/endings'
import { createGame, applyAction, applyOption, nextStage } from './game/engine'
import { clearGame, defaultMeta, loadGame, loadMeta, resetAllData, saveGame, saveMeta } from './game/storage'
import type { CharacterDraft, GameState, MetaState, PanelId, WorldId } from './game/types'

type View = 'home' | 'creator' | 'game'
type HomeDialog = '图鉴' | '成就' | '设置' | null

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('modern')
  const [game, setGame] = useState<GameState | null>(() => loadGame())
  const [meta, setMeta] = useState<MetaState>(() => loadMeta())
  const [activePanel, setActivePanel] = useState<PanelId>('属性')
  const [logoClicks, setLogoClicks] = useState(0)
  const [lastLogoClick, setLastLogoClick] = useState(0)
  const [homeDialog, setHomeDialog] = useState<HomeDialog>(null)

  const hasSave = Boolean(game ?? loadGame())

  useEffect(() => {
    saveMeta(meta)
  }, [meta])

  useEffect(() => {
    if (game && meta.settings.autoSave) saveGame(game)
  }, [game, meta.settings.autoSave])

  useEffect(() => {
    ;(window as unknown as { render_game_to_text: () => string; advanceTime: (ms: number) => void }).render_game_to_text = () =>
      JSON.stringify({
        view,
        selectedWorld,
        cheatNext: meta.cheatNext,
        game: game
          ? {
              worldId: game.worldId,
              character: game.character.name,
              age: game.stats.age,
              pendingEvent: game.pendingEvent?.title ?? null,
              endingId: game.endingId ?? null,
              money: game.stats.money,
              health: game.stats.health,
              reputation: game.stats.reputation,
            }
          : null,
      })
    ;(window as unknown as { advanceTime: (ms: number) => void }).advanceTime = () => undefined
  }, [view, selectedWorld, meta.cheatNext, game])

  const startWorld = (worldId: WorldId) => {
    setSelectedWorld(worldId)
    setView('creator')
  }

  const createLife = (draft: CharacterDraft) => {
    const next = createGame(selectedWorld, { ...draft, name: draft.name.trim() || '无名者' }, meta.cheatNext)
    setGame(next)
    saveGame(next)
    if (meta.cheatNext) setMeta((prev) => ({ ...prev, cheatNext: false }))
    setActivePanel('属性')
    setView('game')
  }

  const updateGame = (updater: (state: GameState) => GameState) => {
    if (!game) return
    const next = updater(game)
    setGame(next)
    if (meta.settings.autoSave) saveGame(next)
    if (next.endingId) {
      const endingId = next.endingId
      const ending = endings.find((item) => item.id === endingId)
      setMeta((prev) => {
        if (prev.endings.includes(endingId)) return prev
        return {
          ...prev,
          endings: Array.from(new Set([...prev.endings, endingId])),
          achievements: Array.from(new Set([...prev.achievements, ...next.achievements, ending ? `${ending.rarity}：${ending.title}` : '结局达成'])),
        }
      })
    }
  }

  const chooseOption = (index: number) => {
    updateGame((state) => {
      const option = state.pendingEvent?.options[index]
      return option ? applyOption(state, option) : state
    })
  }

  const handleLogoClick = () => {
    const now = Date.now()
    const next = now - lastLogoClick <= 3000 ? logoClicks + 1 : 1
    setLastLogoClick(now)
    if (next >= 3) {
      setLogoClicks(0)
      setMeta((prev) => ({ ...prev, cheatNext: true }))
    } else {
      setLogoClicks(next)
    }
  }

  const openSavedGame = () => {
    const saved = loadGame()
    if (saved) {
      setGame(saved)
      setView('game')
    }
  }

  const resetData = () => {
    if (!confirm('确认清空当前存档、成就和结局图鉴吗？此操作不可撤销。')) return
    resetAllData()
    setGame(null)
    setMeta(defaultMeta)
    setView('home')
  }

  if (view === 'creator') {
    return <CharacterCreator worldId={selectedWorld} cheatNext={meta.cheatNext} onCreate={createLife} onBack={() => setView('home')} />
  }

  if (view === 'game' && game) {
    return (
      <GameScreen
        game={game}
        meta={meta}
        activePanel={activePanel}
        onPanel={setActivePanel}
        onNext={() => updateGame(nextStage)}
        onChoose={chooseOption}
        onAction={(action) => updateGame((state) => applyAction(state, action))}
        onSave={() => game && saveGame(game)}
        onLoad={openSavedGame}
        onRestart={() => {
          clearGame()
          setGame(null)
          setView('creator')
        }}
        onHome={() => setView('home')}
        onToggleAutoSave={() => setMeta((prev) => ({ ...prev, settings: { ...prev.settings, autoSave: !prev.settings.autoSave } }))}
      />
    )
  }

  return (
    <Home
      meta={meta}
      hasSave={hasSave}
      onStart={startWorld}
      onContinue={openSavedGame}
      onOpenLibrary={() => {
        if (game) {
          setActivePanel('图鉴')
          setView('game')
        } else {
          setHomeDialog('图鉴')
        }
      }}
      onOpenAchievements={() => {
        if (game) {
          setActivePanel('成就')
          setView('game')
        } else {
          setHomeDialog('成就')
        }
      }}
      onOpenSettings={() => {
        if (game) {
          setActivePanel('设置')
          setView('game')
        } else {
          setHomeDialog('设置')
        }
      }}
      onReset={resetData}
      onLogoClick={handleLogoClick}
      onToggleAutoSave={() => setMeta((prev) => ({ ...prev, settings: { ...prev.settings, autoSave: !prev.settings.autoSave } }))}
      dialog={homeDialog}
      onCloseDialog={() => setHomeDialog(null)}
      logoClicks={logoClicks}
    />
  )
}

export default App
