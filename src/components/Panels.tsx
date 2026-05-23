import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Settings as SettingsIcon, Package, Zap, Users, Trophy, BookOpen, BarChart3, Map } from 'lucide-react'
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="panel-content"
      >
        {active === '属性' && (
          <div className="panel-grid">
            {(['money', 'ability', 'health', 'reputation', 'charm', 'mind', 'luck', ...world.featuredStats] as (keyof Stats)[]).map((key) => {
              const val = game.stats[key]
              const max = key === 'money' ? 300 : 150
              return (
                <div className="stat-row" key={key}>
                  <div className="stat-info">
                    <span>{statLabels[key]}</span>
                    <b>{val}</b>
                  </div>
                  <div className="meter-container">
                    <motion.div 
                      className="meter-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (val / max) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {active === '路线' && (
          <div className="route-panel">
            {getWorldRoutes(game.worldId).map((route) => {
              const routeProgress = { ...baseRoutes(game.worldId), ...(game.routes ?? {}) }
              const points = routeProgress[route.id] ?? 0
              const stageIndex = getRouteStageIndex(route.id, points)
              const nextStage = route.stages[stageIndex + 1]
              const maxPoints = route.stages.at(-1)?.points ?? 1
              return (
                <article key={route.id} className="route-card">
                  <header>
                    <span><Map size={14} /> {route.name}</span>
                    <strong>{route.stages[stageIndex].title}</strong>
                    <b>{points} 点</b>
                  </header>
                  <div className="meter-container">
                    <motion.div 
                      className="meter-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (points / maxPoints) * 100)}%` }}
                    />
                  </div>
                  <div className="route-stage-list">
                    {route.stages.map((stage, index) => (
                      <small className={index <= stageIndex ? 'done' : ''} key={stage.title}>
                        {index <= stageIndex ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                        <em>{stage.title}</em>
                      </small>
                    ))}
                  </div>
                  <p>{nextStage ? `下一阶段：${nextStage.title} · 需要 ${nextStage.points} 点` : '该路线已抵达最高阶段。'}</p>
                </article>
              )
            })}
          </div>
        )}

        {active === '背包' && <ListPanel title="背包物品" icon={<Package size={18} />} items={game.inventory} empty="还没有获得物品。" />}
        {active === '技能' && <ListPanel title="技能与天赋" icon={<Zap size={18} />} items={game.skills} empty="还没有额外技能。" />}
        {active === '关系' && <ListPanel title="重要关系" icon={<Users size={18} />} items={game.relations} empty="尚未建立关键关系。" />}
        {active === '成就' && <ListPanel title="本局成就" icon={<Trophy size={18} />} items={Array.from(new Set([...game.achievements, ...meta.achievements]))} empty="暂无成就。" />}

        {active === '图鉴' && (
          <div className="ending-list">
            <div className="section-title"><BookOpen size={18} /> 结局图鉴</div>
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
        )}

        {active === '设置' && (
          <div className="settings-panel">
            <div className="section-title"><SettingsIcon size={18} /> 游戏设置</div>
            <label className="toggle-line">
              <input type="checkbox" checked={meta.settings.autoSave} onChange={onToggleAutoSave} />
              自动保存
            </label>
            <p className="setting-note">当前存档使用浏览器 localStorage，本地游玩不需要联网。</p>
            <p className="setting-note">开挂模式状态：{meta.cheatNext ? '下一局生效' : '未开启'}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function ListPanel({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: string[]; empty: string }) {
  return (
    <div className="list-panel">
      <h3>{icon} {title}</h3>
      {items.length ? (
        <div className="item-tag-list">
          {items.map((item) => (
            <motion.span 
              key={item} 
              className="item-tag"
              whileHover={{ scale: 1.05 }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      ) : (
        <p className="empty-hint">{empty}</p>
      )}
    </div>
  )
}
