import type { LifeRoute, RouteId, WorldId } from '../game/types'

const thresholds = [0, 35, 80, 140, 220]

const makeStages = (titles: string[]) => titles.map((title, index) => ({ title, points: thresholds[index] }))

export const routes: LifeRoute[] = [
  {
    id: 'modern-education',
    world: 'modern',
    name: '学历深造',
    desc: '用持续学习打开更高职业和知识天花板。',
    stages: makeStages(['旁听学员', '进修生', '专业骨干', '城市学者', '行业智库']),
  },
  {
    id: 'modern-career',
    world: 'modern',
    name: '职场晋升',
    desc: '在组织中积累能力、履历和影响力。',
    stages: makeStages(['实习生', '骨干员工', '部门主管', '城市精英', '商界领袖']),
  },
  {
    id: 'modern-business',
    world: 'modern',
    name: '创业投资',
    desc: '通过资产、公司和周期判断积累财富版图。',
    stages: makeStages(['理财新手', '副业操盘手', '创业合伙人', '资本玩家', '城市巨擘']),
  },
  {
    id: 'modern-family',
    world: 'modern',
    name: '家庭经营',
    desc: '经营亲密关系、家人支持和长期生活稳定性。',
    stages: makeStages(['独立生活者', '亲密伴侣', '家庭支柱', '烟火掌灯人', '家族守望者']),
  },
  {
    id: 'modern-fame',
    world: 'modern',
    name: '名望权力',
    desc: '把声望、人脉和公共表达转化为社会影响力。',
    stages: makeStages(['社交新人', '圈层熟面孔', '公众人物', '城市名片', '权力中心']),
  },
  {
    id: 'xianxia-sect',
    world: 'xianxia',
    name: '宗门修行',
    desc: '依托宗门资源，从弟子走到传承源头。',
    stages: makeStages(['外门弟子', '内门弟子', '真传弟子', '长老', '开山祖师']),
  },
  {
    id: 'xianxia-wanderer',
    world: 'xianxia',
    name: '散修历练',
    desc: '远离山门束缚，在秘境和红尘中磨出自己的道。',
    stages: makeStages(['山野修士', '游方散修', '秘境行者', '四海剑仙', '逍遥真君']),
  },
  {
    id: 'xianxia-craft',
    world: 'xianxia',
    name: '炼丹炼器',
    desc: '以丹器技艺积累资源、名望和护道手段。',
    stages: makeStages(['炉火学徒', '丹器师', '仙坊供奉', '丹器宗师', '造化圣手']),
  },
  {
    id: 'xianxia-karma',
    world: 'xianxia',
    name: '因果悟道',
    desc: '在恩怨、心魔和凡尘牵连中参悟大道流转。',
    stages: makeStages(['因果旁观者', '红尘行者', '劫数参悟者', '因果棋手', '大道执笔人']),
  },
  {
    id: 'xianxia-ascension',
    world: 'xianxia',
    name: '飞升突破',
    desc: '不断突破境界，直至叩开上界天门。',
    stages: makeStages(['炼气求道', '筑基修士', '金丹真人', '渡劫大能', '飞升仙尊']),
  },
  {
    id: 'wuxia-dojo',
    world: 'wuxia',
    name: '武馆修炼',
    desc: '从基础训练到经营武馆，沉淀传承体系。',
    stages: makeStages(['武馆学徒', '精英学员', '助教教练', '一城馆主', '开派宗师']),
  },
  {
    id: 'wuxia-arena',
    world: 'wuxia',
    name: '擂台争霸',
    desc: '在一场场实战里赢下奖金、名声和王座。',
    stages: makeStages(['擂台新人', '连胜拳手', '城市冠军', '全国霸主', '擂台皇帝']),
  },
  {
    id: 'wuxia-legion',
    world: 'wuxia',
    name: '军团晋升',
    desc: '加入军团、守住边境，从兵卒走向统帅。',
    stages: makeStages(['新兵', '校尉', '统领', '战区主将', '镇国武神']),
  },
  {
    id: 'wuxia-secret',
    world: 'wuxia',
    name: '秘境探索',
    desc: '深入荒区和星门，在危险中寻找突破资源。',
    stages: makeStages(['荒区新手', '巡猎者', '秘境先锋', '星门行者', '秘境之主']),
  },
  {
    id: 'wuxia-grandmaster',
    world: 'wuxia',
    name: '宗师传承',
    desc: '钻研武技、拜访名师，最终留下自己的武道体系。',
    stages: makeStages(['拆招学生', '武技专精者', '宗师门徒', '武道导师', '传承宗师']),
  },
]

export const getWorldRoutes = (worldId: WorldId) => routes.filter((route) => route.world === worldId)

export const getRoute = (routeId: RouteId) => routes.find((route) => route.id === routeId)!
