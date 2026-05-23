import { endings } from '../data/endings'
import { getWorldRoutes } from '../data/routes'
import { getWorld } from '../data/worlds'
import { baseRoutes, getRouteStageIndex, statLabels } from '../game/engine'
import type { GameState, MetaState, PanelId, Stats } from '../game/types'

type PanelsProps = {
  active: PanelId
  game: GameState
  meta: MetaState
  onToggleAutoSave: () => void
}

export function Panels({ active, game, meta, onToggleAutoSave }: PanelsProps) {
  const world = getWorld(game.worldId)

  if (active === '属性') {
    const keys = ['money', 'ability', 'health', 'reputation', 'charm', 'mind', 'luck', ...world.featuredStats] as (keyof Stats)[]
    return (
      <div className="panel-grid">
        {Array.from(new Set(keys)).map((key) => (
          <div className="stat-row" key={key}>
            <span>{statLabels[key]}</span>
            <meter min={0} max={key === 'money' ? 300 : 150} value={game.stats[key]} />
            <b>{game.stats[key]}</b>
          </div>
        ))}
      </div>
    )
  }

  if (active === '路线') {
    const routeProgress = { ...baseRoutes(game.worldId), ...(game.routes ?? {}) }
    return (
      <div className="route-panel">
        {getWorldRoutes(game.worldId).map((route) => {
          const points = routeProgress[route.id] ?? 0
          const stageIndex = getRouteStageIndex(route.id, points)
          const nextStage = route.stages[stageIndex + 1]
          const maxPoints = route.stages.at(-1)?.points ?? 1
          return (
            <article key={route.id}>
              <header>
                <span>{route.name}</span>
                <strong>{route.stages[stageIndex].title}</strong>
                <b>{points}点</b>
              </header>
              <meter min={0} max={maxPoints} value={Math.min(points, maxPoints)} />
              <div className="route-stage-list">
                {route.stages.map((stage, index) => (
                  <small className={index <= stageIndex ? 'done' : ''} key={stage.title}>
                    {index <= stageIndex ? '已达成' : stage.points}
                    <em>{stage.title}</em>
                  </small>
                ))}
              </div>
              <p>{nextStage ? `下一阶段：${nextStage.title} · 需要 ${nextStage.points} 点` : '该路线已抵达最高阶段。'}</p>
            </article>
          )
        })}
      </div>
    )
  }

  if (active === '背包') return <ListPanel title="背包物品" items={game.inventory} empty="还没有获得物品。" />
  if (active === '技能') return <ListPanel title="技能与天赋" items={game.skills} empty="还没有额外技能。" />
  if (active === '关系') return <ListPanel title="重要关系" items={game.relations} empty="尚未建立关键关系。" />
  if (active === '成就') return <ListPanel title="本局成就" items={Array.from(new Set([...game.achievements, ...meta.achievements]))} empty="暂无成就。" />

  if (active === '图鉴') {
    return (
      <div className="ending-list">
        {endings.map((ending) => {
          const unlocked = meta.endings.includes(ending.id) || game.endingId === ending.id
          return (
            <article key={ending.id} className={unlocked ? 'unlocked' : 'locked'}>
              <span>{ending.rarity}</span>
              <strong>{unlocked ? ending.title : '未解锁结局'}</strong>
              <p>{unlocked ? ending.desc : `${getWorld(ending.world).name} · 条件未知`}</p>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="settings-panel">
      <label className="toggle-line">
        <input type="checkbox" checked={meta.settings.autoSave} onChange={onToggleAutoSave} />
        自动保存
      </label>
      <p>当前存档使用浏览器 localStorage，本地游玩不需要联网。</p>
      <p>开挂模式状态：{meta.cheatNext ? '下一局生效' : '未开启'}</p>
    </div>
  )
}

function ListPanel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="list-panel">
      <h3>{title}</h3>
      {items.length ? items.map((item) => <span key={item}>{item}</span>) : <p>{empty}</p>}
    </div>
  )
}
