import type { StatKey, WorldId } from '../game/types'

export type Milestone = {
  id: string
  world: WorldId
  title: string
  desc: string
  reward: string
  condition: Partial<Record<StatKey, number>>
}

export const milestones: Milestone[] = [
  { id: 'modern-first-job', world: 'modern', title: '站稳职场', desc: '职业达到 40。', reward: '解锁更高薪资想象', condition: { career: 40 } },
  { id: 'modern-assets', world: 'modern', title: '资产起飞', desc: '投资与房产同时达到 60。', reward: '更容易走向财富结局', condition: { investment: 60, property: 60 } },
  { id: 'modern-balance', world: 'modern', title: '生活平衡', desc: '家庭、恋爱、健康都达到 60。', reward: '稳定通向温暖结局', condition: { family: 60, love: 60, health: 60 } },
  { id: 'xianxia-foundation', world: 'xianxia', title: '筑基可期', desc: '境界、灵力、根骨达到 50。', reward: '秘境和渡劫路线更稳', condition: { realm: 50, spiritPower: 50, bone: 50 } },
  { id: 'xianxia-sect-core', world: 'xianxia', title: '宗门核心', desc: '宗门与声望达到 70。', reward: '通向开宗立派', condition: { sect: 70, reputation: 70 } },
  { id: 'xianxia-dao-heart', world: 'xianxia', title: '道心通明', desc: '悟性与心性达到 90。', reward: '隐藏大道路线显现', condition: { comprehension: 90, mind: 90 } },
  { id: 'wuxia-city-rank', world: 'wuxia', title: '城市级武者', desc: '气血与战力达到 60。', reward: '擂台和军团路线打开', condition: { blood: 60, combat: 60 } },
  { id: 'wuxia-limit', world: 'wuxia', title: '极限门槛', desc: '突破与武技达到 80。', reward: '冲击武道神话', condition: { breakthrough: 80, martial: 80 } },
  { id: 'wuxia-guardian', world: 'wuxia', title: '边境守望', desc: '军团、声望、战力达到 80。', reward: '军团脊梁路线成熟', condition: { legion: 80, reputation: 80, combat: 80 } },
]
