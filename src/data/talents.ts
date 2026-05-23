import type { Talent } from '../game/types'

export const talents: Talent[] = [
  { id: 'steady', name: '稳扎稳打', desc: '健康和能力更稳定。', effects: { health: 12, ability: 8 } },
  { id: 'golden', name: '天生财运', desc: '开局资金与投资眼光更强。', effects: { money: 30, investment: 12, luck: 8 } },
  { id: 'social', name: '八面玲珑', desc: '魅力、关系和名望更容易增长。', effects: { charm: 18, reputation: 10, love: 8 } },
  { id: 'dao', name: '近道之心', desc: '修仙路线获得悟性与灵力。', effects: { comprehension: 22, spiritPower: 16, karma: 6 } },
  { id: 'iron', name: '钢骨热血', desc: '高武路线获得气血与战力。', effects: { blood: 24, combat: 16, martial: 8 } },
  { id: 'lucky', name: '命不该绝', desc: '幸运高，失败事件损失较低。', effects: { luck: 25, health: 8 } },
]
