import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, Settings, RotateCcw, BookOpen, ChevronRight, Play } from 'lucide-react'
import { endings } from '../data/endings'
import { worlds } from '../data/worlds'
import { statLabels } from '../game/engine'
import type { MetaState, WorldId } from '../game/types'

type HomeProps = {
  meta: MetaState
  hasSave: boolean
  onStart: (worldId: WorldId) => void
  onContinue: () => void
  onOpenLibrary: () => void
  onOpenAchievements: () => void
  onOpenSettings: () => void
  onReset: () => void
  onLogoClick: () => void
  onToggleAutoSave: () => void
  dialog: '图鉴' | '成就' | '设置' | null
  onCloseDialog: () => void
  logoClicks: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function Home({
  meta,
  hasSave,
  onStart,
  onContinue,
  onOpenLibrary,
  onOpenAchievements,
  onOpenSettings,
  onReset,
  onLogoClick,
  onToggleAutoSave,
  dialog,
  onCloseDialog,
  logoClicks,
}: HomeProps) {
  return (
    <motion.main 
      className="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section className="brand-panel" variants={itemVariants}>
        <button className="logo-button" onClick={onLogoClick} aria-label="游戏 logo">
          <motion.span 
            className="logo-mark"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            命
          </motion.span>
          <span>
            <strong>文字人生模拟器</strong>
            <small>三界人生 · 随机命运 · 多结局图鉴</small>
          </span>
        </button>
        <div className="home-copy">
          <p>选择一个世界，创建角色，然后在每一年、每次渡劫、每场试炼里决定自己的人生走向。</p>
          <div className="status-line">
            <span><BookOpen size={14} /> 已收集结局 {meta.endings.length}/{endings.length}</span>
            <span><Trophy size={14} /> 成就 {meta.achievements.length}</span>
            {meta.cheatNext ? <span className="cheat-badge"><Sparkles size={14} /> 下一局开挂已开启</span> : <span>隐藏点击 {logoClicks}/3</span>}
          </div>
        </div>
        <div className="home-brief" aria-label="游玩信息">
          <article>
            <span>长线局</span>
            <strong>18+阶段结算</strong>
            <p>前期攒属性，中期转路线，后期冲稀有与隐藏结局。</p>
          </article>
          <article>
            <span>三世界</span>
            <strong>都市 / 修仙 / 高武</strong>
            <p>每个世界都有独立事件、行动、目标和结局池。</p>
          </article>
          <article>
            <span>局内功能</span>
            <strong>行动 · 雷达 · 图鉴</strong>
            <p>事件选择、阶段行动和结局雷达会共同影响人生走向。</p>
          </article>
        </div>
        <div className="home-actions">
          <button className="primary" onClick={() => onStart('modern')}>
            <Play size={18} fill="currentColor" /> 开始新人生
          </button>
          <button disabled={!hasSave} onClick={onContinue}>继续游戏</button>
          <button onClick={onOpenLibrary}><BookOpen size={18} /> 结局图鉴</button>
          <button onClick={onOpenAchievements}><Trophy size={18} /> 成就</button>
          <button onClick={onOpenSettings}><Settings size={18} /> 设置</button>
          <button className="danger" onClick={onReset}><RotateCcw size={18} /> 数据重置</button>
        </div>
      </motion.section>

      <motion.section className="world-grid" variants={itemVariants}>
        {worlds.map((world) => (
          <motion.button 
            className={`world-tile ${world.theme}`} 
            key={world.id} 
            onClick={() => onStart(world.id)}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{world.name}</span>
            <small>{world.subtitle}</small>
            <b>进入 <ChevronRight size={16} /></b>
          </motion.button>
        ))}
      </motion.section>

      <motion.section className="home-dock" variants={itemVariants} aria-label="主页功能面板">
        <article>
          <h2><BookOpen size={20} /> 结局图鉴</h2>
          <div className="mini-list">
            {endings.slice(0, 10).map((ending) => {
              const unlocked = meta.endings.includes(ending.id)
              return (
                <p key={ending.id} className={unlocked ? 'unlocked' : 'locked'}>
                  <span>{ending.rarity}</span>
                  <strong>{unlocked ? ending.title : '未解锁结局'}</strong>
                  <small>{unlocked ? ending.desc : `${ending.world} · ${Object.keys(ending.condition).map((key) => statLabels[key as keyof typeof statLabels] ?? key).join(' / ')}`}</small>
                </p>
              )
            })}
            {endings.length > 10 && <p className="more-hint" onClick={onOpenLibrary}>查看全部 {endings.length} 个结局...</p>}
          </div>
        </article>
        <article>
          <h2><Trophy size={20} /> 成就</h2>
          <div className="mini-list">
            {meta.achievements.length ? meta.achievements.map((item) => <p className="unlocked" key={item}><strong>{item}</strong></p>) : <p className="locked"><strong>暂无成就</strong><small>完成特殊选择或结局后永久记录。</small></p>}
          </div>
        </article>
        <article>
          <h2><Settings size={20} /> 设置</h2>
          <label className="toggle-line">
            <input type="checkbox" checked={meta.settings.autoSave} onChange={onToggleAutoSave} />
            自动保存
          </label>
          <p className="setting-note">存档、图鉴、成就都保存在浏览器 localStorage。开挂模式：{meta.cheatNext ? '下一局生效' : '未开启'}。</p>
        </article>
      </motion.section>

      <AnimatePresence>
        {dialog && (
          <motion.div 
            className="modal-backdrop" 
            role="presentation" 
            onClick={onCloseDialog}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section 
              className="home-modal" 
              role="dialog" 
              aria-modal="true" 
              aria-label={dialog === '图鉴' ? '结局图鉴' : dialog} 
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <header>
                <h2>{dialog === '图鉴' ? <BookOpen size={24} /> : dialog === '成就' ? <Trophy size={24} /> : <Settings size={24} />} {dialog}</h2>
                <button onClick={onCloseDialog}>关闭</button>
              </header>
              {dialog === '图鉴' && (
                <div className="modal-list">
                  {endings.map((ending) => {
                    const unlocked = meta.endings.includes(ending.id)
                    return (
                      <article key={ending.id} className={unlocked ? 'unlocked' : 'locked'}>
                        <span>{ending.rarity}</span>
                        <strong>{unlocked ? ending.title : '未解锁结局'}</strong>
                        <p>{unlocked ? ending.desc : `来自 ${worlds.find((world) => world.id === ending.world)?.name}，条件与属性、关键选择和随机事件有关。`}</p>
                      </article>
                    )
                  })}
                </div>
              )}
              {dialog === '成就' && (
                <div className="modal-list">
                  {meta.achievements.length ? (
                    meta.achievements.map((item) => (
                      <article className="unlocked" key={item}>
                        <strong>{item}</strong>
                        <p>已永久记录。</p>
                      </article>
                    ))
                  ) : (
                    <article className="locked">
                      <strong>暂无成就</strong>
                      <p>完成稀有选择、隐藏开挂或达成结局后会写入这里。</p>
                    </article>
                  )}
                </div>
              )}
              {dialog === '设置' && (
                <div className="modal-list">
                  <article className="unlocked">
                    <strong>自动保存</strong>
                    <label className="toggle-line">
                      <input type="checkbox" checked={meta.settings.autoSave} onChange={onToggleAutoSave} />
                      {meta.settings.autoSave ? '已开启' : '已关闭'}
                    </label>
                  </article>
                  <article className={meta.cheatNext ? 'unlocked' : 'locked'}>
                    <strong>开挂模式</strong>
                    <p>{meta.cheatNext ? '下一局会满资源开局，生效后自动关闭。' : '连续点击主页 logo 三次可开启下一局开挂。'}</p>
                  </article>
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
