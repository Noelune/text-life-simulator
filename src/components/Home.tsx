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
    <main className="home">
      <section className="brand-panel">
        <button className="logo-button" onClick={onLogoClick} aria-label="游戏 logo">
          <span className="logo-mark">命</span>
          <span>
            <strong>文字人生模拟器</strong>
            <small>三界人生 · 随机命运 · 多结局图鉴</small>
          </span>
        </button>
        <div className="home-copy">
          <p>选择一个世界，创建角色，然后在每一年、每次渡劫、每场试炼里决定自己的人生走向。</p>
          <div className="status-line">
            <span>已收集结局 {meta.endings.length}/{endings.length}</span>
            <span>成就 {meta.achievements.length}</span>
            {meta.cheatNext ? <span className="cheat-badge">下一局开挂已开启</span> : <span>隐藏点击 {logoClicks}/3</span>}
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
          <button className="primary" onClick={() => onStart('modern')}>开始新人生</button>
          <button disabled={!hasSave} onClick={onContinue}>继续游戏</button>
          <button onClick={onOpenLibrary}>结局图鉴</button>
          <button onClick={onOpenAchievements}>成就</button>
          <button onClick={onOpenSettings}>设置</button>
          <button className="danger" onClick={onReset}>数据重置</button>
        </div>
      </section>

      <section className="world-grid">
        {worlds.map((world) => (
          <button className={`world-tile ${world.theme}`} key={world.id} onClick={() => onStart(world.id)}>
            <span>{world.name}</span>
            <small>{world.subtitle}</small>
            <b>进入</b>
          </button>
        ))}
      </section>

      <section className="home-dock" aria-label="主页功能面板">
        <article>
          <h2>结局图鉴</h2>
          <div className="mini-list">
            {endings.map((ending) => {
              const unlocked = meta.endings.includes(ending.id)
              return (
                <p key={ending.id} className={unlocked ? 'unlocked' : 'locked'}>
                  <span>{ending.rarity}</span>
                  <strong>{unlocked ? ending.title : '未解锁结局'}</strong>
                  <small>{unlocked ? ending.desc : `${ending.world} · ${Object.keys(ending.condition).map((key) => statLabels[key as keyof typeof statLabels] ?? key).join(' / ')}`}</small>
                </p>
              )
            })}
          </div>
        </article>
        <article>
          <h2>成就</h2>
          <div className="mini-list">
            {meta.achievements.length ? meta.achievements.map((item) => <p className="unlocked" key={item}><strong>{item}</strong></p>) : <p className="locked"><strong>暂无成就</strong><small>完成特殊选择或结局后永久记录。</small></p>}
          </div>
        </article>
        <article>
          <h2>设置</h2>
          <label className="toggle-line">
            <input type="checkbox" checked={meta.settings.autoSave} onChange={onToggleAutoSave} />
            自动保存
          </label>
          <p className="setting-note">存档、图鉴、成就都保存在浏览器 localStorage。开挂模式：{meta.cheatNext ? '下一局生效' : '未开启'}。</p>
        </article>
      </section>

      {dialog && (
        <div className="modal-backdrop" role="presentation" onClick={onCloseDialog}>
          <section className="home-modal" role="dialog" aria-modal="true" aria-label={dialog === '图鉴' ? '结局图鉴' : dialog} onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>{dialog}</h2>
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
          </section>
        </div>
      )}
    </main>
  )
}
