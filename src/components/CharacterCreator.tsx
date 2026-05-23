import { motion } from 'framer-motion'
import { ArrowLeft, Dices, Play, Sparkles, Shield, User, Globe } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getWorldRoutes } from '../data/routes'
import { talents } from '../data/talents'
import { getWorld } from '../data/worlds'
import { randomCharacter } from '../game/engine'
import type { CharacterDraft, Difficulty, Gender, WorldId } from '../game/types'

type CharacterCreatorProps = {
  worldId: WorldId
  cheatNext: boolean
  onCreate: (draft: CharacterDraft) => void
  onBack: () => void
}

export function CharacterCreator({ worldId, cheatNext, onCreate, onBack }: CharacterCreatorProps) {
  const world = getWorld(worldId)
  const initial = useMemo(() => randomCharacter(worldId), [worldId])
  const [draft, setDraft] = useState<CharacterDraft>(initial)
  const talent = talents.find((item) => item.name === draft.talent)
  const routes = getWorldRoutes(worldId)

  const set = <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => setDraft((prev) => ({ ...prev, [key]: value }))

  return (
    <motion.main 
      className={`creator ${world.theme}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="topbar">
        <button onClick={onBack}><ArrowLeft size={18} /> 返回主页</button>
        <div>
          <span>角色创建</span>
          <strong>{world.name}</strong>
        </div>
      </header>

      <section className="creator-layout">
        <motion.div 
          className="form-panel"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <label>
            姓名
            <input value={draft.name} onChange={(event) => set('name', event.target.value)} placeholder="输入姓名" />
          </label>
          <label>
            性别/称号
            <select value={draft.gender} onChange={(event) => set('gender', event.target.value as Gender)}>
              {(['男', '女', '无定'] as const).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            出身
            <select value={draft.origin} onChange={(event) => set('origin', event.target.value)}>
              {world.origins.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            天赋
            <select value={draft.talent} onChange={(event) => set('talent', event.target.value)}>
              {talents.map((talent) => <option key={talent.id}>{talent.name}</option>)}
            </select>
          </label>
          <label>
            难度
            <select value={draft.difficulty} onChange={(event) => set('difficulty', event.target.value as Difficulty)}>
              {(['轻松', '普通', '残酷'] as const).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="creator-hints">
            <article>
              <span><User size={14} /> 开局定位</span>
              <strong>{draft.origin}</strong>
              <p>{getOriginHint(draft.origin)}</p>
            </article>
            <article>
              <span><Shield size={14} /> 难度节奏</span>
              <strong>{draft.difficulty}</strong>
              <p>{getDifficultyHint(draft.difficulty)}</p>
            </article>
          </div>
          <div className="button-row">
            <button onClick={() => setDraft(randomCharacter(worldId))}><Dices size={18} /> 随机角色</button>
            <button className="primary" onClick={() => onCreate(draft)} disabled={!draft.name.trim()}>
              <Play size={18} fill="currentColor" /> 开始此生
            </button>
          </div>
        </motion.div>

        <motion.aside 
          className="preview-panel"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div>
            <h1>{draft.name || '未命名'}</h1>
            <p>{draft.gender} · {draft.origin} · {draft.talent} · {draft.difficulty}</p>
            <p className="talent-desc"><Sparkles size={14} /> {talent?.desc}</p>
          </div>
          {cheatNext && (
            <motion.strong 
              className="cheat-badge"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
            >
              <Sparkles size={14} /> 本局将以满资源开局，生效后自动关闭。
            </motion.strong>
          )}
          <div className="world-note">
            <span><Globe size={14} /> {world.name}</span>
            <strong>{world.subtitle}</strong>
          </div>
          <div className="creator-routes">
            <span className="route-label">预设路线</span>
            {routes.map((route) => (
              <article key={route.id}>
                <span>{route.name}</span>
                <p>{route.stages.map((stage) => stage.title).join(' -> ')}</p>
              </article>
            ))}
          </div>
        </motion.aside>
      </section>
    </motion.main>
  )
}

function getOriginHint(origin: string) {
  if (origin.includes('负债') || origin.includes('寒门') || origin.includes('底层')) return '前期压力大，但翻盘路线更容易触发高收益事件。'
  if (origin.includes('中产') || origin.includes('小镇') || origin.includes('武馆')) return '开局稳定，适合长线经营属性和关系。'
  if (origin.includes('豪门') || origin.includes('世家') || origin.includes('宗门')) return '资源起点高，更适合冲稀有结局和隐藏路线。'
  if (origin.includes('散修') || origin.includes('荒野') || origin.includes('流浪')) return '随机性强，容易遇到极端事件。'
  return '路线弹性高，可以根据随机事件及时转向。'
}

function getDifficultyHint(difficulty: Difficulty) {
  if (difficulty === '轻松') return '数值压力较低，适合收集图鉴和熟悉路线。'
  if (difficulty === '残酷') return '事件惩罚更明显，失败结局更近，但稀有路线更刺激。'
  return '标准节奏，平均一局更适合完整体验。'
}

