import { endings } from '../data/endings'
import { actions } from '../data/actions'
import { milestones } from '../data/milestones'
import { getWorld } from '../data/worlds'
import { getMainRoute, statLabels } from '../game/engine'
import type { GameAction, GameState, MetaState, PanelId } from '../game/types'
import { Panels } from './Panels'

type GameScreenProps = {
  game: GameState
  meta: MetaState
  activePanel: PanelId
  onPanel: (panel: PanelId) => void
  onNext: () => void
  onChoose: (index: number) => void
  onAction: (action: GameAction) => void
  onSave: () => void
  onLoad: () => void
  onRestart: () => void
  onHome: () => void
  onToggleAutoSave: () => void
}

const panels: PanelId[] = ['属性', '路线', '背包', '技能', '关系', '成就', '图鉴', '设置']

export function GameScreen({
  game,
  meta,
  activePanel,
  onPanel,
  onNext,
  onChoose,
  onAction,
  onSave,
  onLoad,
  onRestart,
  onHome,
  onToggleAutoSave,
}: GameScreenProps) {
  const world = getWorld(game.worldId)
  const ending = endings.find((item) => item.id === game.endingId)
  const mainRoute = getMainRoute(game)
  const highlights = Array.from(new Set(['money', 'health', 'reputation', ...world.featuredStats.slice(0, 4)])) as (keyof typeof game.stats)[]
  const worldActions = actions.filter((action) => action.world === game.worldId)
  const worldMilestones = milestones.filter((item) => item.world === game.worldId)
  const worldEndings = endings.filter((item) => item.world === game.worldId)
  const unlockedWorldEndings = worldEndings.filter((item) => meta.endings.includes(item.id) || game.endingId === item.id)
  const closestEndings = worldEndings
    .filter((item) => !unlockedWorldEndings.some((endingItem) => endingItem.id === item.id))
    .map((item) => ({
      ...item,
      score: Object.entries(item.condition).reduce((sum, [key, value]) => sum + Math.min(1, game.stats[key as keyof typeof game.stats] / Math.max(1, value)), 0) / Math.max(1, Object.keys(item.condition).length),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return (
    <main className={`game-shell ${world.theme}`}>
      <header className="game-header">
        <div>
          <span>{world.name}</span>
          <strong>{game.character.name}</strong>
          <small>{game.character.gender} · {game.character.origin} · {game.character.talent}</small>
        </div>
        <div className="header-actions">
          <button onClick={onSave}>保存</button>
          <button onClick={onLoad}>读取</button>
          <button onClick={onRestart}>重新开始</button>
          <button onClick={onHome}>返回主页</button>
        </div>
      </header>

      <section className="hud">
        <div>
          <span>{world.ageLabel}</span>
          <b>{game.stats.age}</b>
        </div>
        {highlights.map((key) => (
          <div key={key}>
            <span>{statLabels[key]}</span>
            <b>{game.stats[key]}</b>
          </div>
        ))}
      </section>

      <section className="route-strip">
        <article>
          <span>当前路线</span>
          <strong>{mainRoute.route.name}</strong>
          <p>{mainRoute.route.desc}</p>
        </article>
        <article>
          <span>路线阶段</span>
          <strong>{mainRoute.stage.title}</strong>
          <p>{mainRoute.points} 点 · 第 {game.stage} 阶段，继续行动和选择会推进路线树。</p>
        </article>
        <article>
          <span>本世界图鉴</span>
          <strong>{unlockedWorldEndings.length}/{worldEndings.length}</strong>
          <p>{world.name} 当前共有 {worldEndings.length} 种结局，包括失败、普通、稀有和隐藏路线。</p>
        </article>
        <article>
          <span>最近可追</span>
          <strong>{closestEndings[0]?.title ?? '已全收集'}</strong>
          <p>{closestEndings[0] ? `${closestEndings[0].rarity}路线，进度约 ${Math.round(closestEndings[0].score * 100)}%` : '这个世界的结局都已解锁。'}</p>
        </article>
      </section>

      <section className="play-layout">
        <article className="event-panel">
          {ending ? (
            <div className="ending-screen">
              <span>{ending.rarity}结局</span>
              <h1>{ending.title}</h1>
              <p>{ending.desc}</p>
              <button className="primary" onClick={onRestart}>再开一局</button>
            </div>
          ) : game.pendingEvent ? (
            <>
              <span className="eyebrow">随机事件</span>
              <h1>{game.pendingEvent.title}</h1>
              <p>{game.pendingEvent.text}</p>
              <div className="choice-list">
                {game.pendingEvent.options.map((option, index) => (
                  <button key={option.text} onClick={() => onChoose(index)}>
                    <strong>{option.text}</strong>
                    <small>{formatEffects(option.effects)}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">阶段推进</span>
              <h1>命运暂时安静</h1>
              <p>点击下一年/下一阶段，生成新的随机事件。自动保存开启时，每次推进都会写入存档。</p>
              <button className="primary big-action" onClick={onNext}>下一年/下一阶段</button>
            </>
          )}
        </article>

        <aside className="side-panel">
          <nav className="panel-tabs">
            {panels.map((panel) => (
              <button className={panel === activePanel ? 'active' : ''} key={panel} onClick={() => onPanel(panel)}>{panel}</button>
            ))}
          </nav>
          <Panels active={activePanel} game={game} meta={meta} onToggleAutoSave={onToggleAutoSave} />
        </aside>
      </section>

      <section className="action-board">
        <div className="section-title">
          <strong>本阶段可做的事</strong>
          <span>行动会立刻改变属性，也可能获得物品、技能、关系或成就；每次行动后通常需要推进阶段刷新。</span>
        </div>
        <div className="action-grid">
          {worldActions.map((action) => {
            const blocked = action.requirement && !Object.entries(action.requirement).every(([key, value]) => game.stats[key as keyof typeof game.stats] >= value)
            const cooling = (game.actionCooldowns[action.id] ?? 0) > 0
            return (
              <button key={action.id} disabled={Boolean(game.endingId || blocked || cooling)} onClick={() => onAction(action)}>
                <span>{action.category}</span>
                <strong>{action.name}</strong>
                <small>{blocked ? `需要：${formatEffects(action.requirement ?? {})}` : cooling ? '本阶段已行动，推进后刷新' : action.desc}</small>
                <em>{formatEffects(action.effects)}</em>
              </button>
            )
          })}
        </div>
      </section>

      <section className="milestone-board">
        <div className="section-title">
          <strong>人生目标</strong>
          <span>这些不是强制任务，但会给你明确路线：财富、家庭、飞升、宗门、擂台、军团都能玩出不同结局。</span>
        </div>
        <div className="milestone-grid">
          {worldMilestones.map((milestone) => {
            const done = Object.entries(milestone.condition).every(([key, value]) => game.stats[key as keyof typeof game.stats] >= value)
            return (
              <article key={milestone.id} className={done ? 'done' : ''}>
                <span>{done ? '已达成' : '进行中'}</span>
                <strong>{milestone.title}</strong>
                <p>{milestone.desc}</p>
                <small>{milestone.reward}</small>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ending-radar">
        <div className="section-title">
          <strong>结局雷达</strong>
          <span>根据当前属性估算最接近的路线，方便你决定下一阶段行动。</span>
        </div>
        <div className="radar-grid">
          {closestEndings.map((item) => (
            <article key={item.id}>
              <span>{item.rarity}</span>
              <strong>{item.title}</strong>
              <meter min={0} max={1} value={item.score} />
              <small>{Math.round(item.score * 100)}% · {item.desc}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="log-panel">
        <div className="log-title">人生经历</div>
        {game.logs.map((log, index) => (
          <p key={`${log.year}-${index}`}><span>{log.year}</span>{log.text}</p>
        ))}
      </section>
    </main>
  )
}

function formatEffects(effects: Record<string, number | undefined>) {
  return Object.entries(effects)
    .map(([key, value]) => `${statLabels[key as keyof typeof statLabels] ?? key}${value && value > 0 ? '+' : ''}${value}`)
    .join(' · ')
}
