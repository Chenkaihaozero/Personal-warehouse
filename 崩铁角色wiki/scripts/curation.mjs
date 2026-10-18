/**
 * curation.mjs — 全部人工策展信息集中在此文件。
 *
 * 这里是整个项目唯一需要「人来判断」的地方：板块归属、阵营归一化、
 * 关系类型判定、策展关系边、主题色。build-data.mjs 只负责机械地把
 * characters-raw.json + 本文件合并成 src/data/**。
 *
 * 所有硬编码的名字都使用官方 wiki 的原始写法（注意「•」U+2022 与
 * 「·」U+00B7 两种中点都真实存在），这样 build-data 可以直接做字符串匹配。
 */

/* ------------------------------------------------------------------ *
 * 1. 板块（首页纵向排列顺序 = order 升序）
 * ------------------------------------------------------------------ */

export const BOARDS = [
  {
    id: 'express',
    name: '星穹列车',
    nameEn: 'Astral Express',
    kind: 'faction-line',
    order: 0,
    description:
      '修复的列车上，无名客们沿着星轨驶向一个又一个世界。他们没有故乡，只有彼此——列车所至之处，便是新的故事开始的地方。',
    theme: {
      primary: '#fbbf24',
      accent: '#fde68a',
      glow: 'rgba(251,191,36,0.35)',
      pattern: 'tex-express',
      tagline: '银轨绵延，无名客的旅途没有终点',
    },
  },
  {
    id: 'herta',
    name: '黑塔空间站',
    nameEn: 'Herta Space Station',
    kind: 'region',
    order: 1,
    description:
      '天才俱乐部第 83 位成员黑塔的私人造物，宇宙中的一座巨型实验室。故事的起点：星核在此被植入，开拓者在此睁开双眼。',
    theme: {
      primary: '#7dd3fc',
      accent: '#a5f3fc',
      glow: 'rgba(125,211,252,0.35)',
      pattern: 'tex-herta',
      tagline: '环形回廊与永远不会安静下来的观测室',
    },
  },
  {
    id: 'belobog',
    name: '贝洛伯格',
    nameEn: 'Belobog',
    kind: 'region',
    order: 2,
    description:
      '雅利洛-VI 上最后的人类城邦。永冻的寒潮封死了地表，上下层区的裂缝割开了七百年的历史，而柴可夫斯基的雪落在每个人肩上。',
    theme: {
      primary: '#a5d8ff',
      accent: '#e0f2fe',
      glow: 'rgba(165,216,255,0.35)',
      pattern: 'tex-belobog',
      tagline: '冰雪封锁的城邦，与不肯熄灭的炉火',
    },
  },
  {
    id: 'xianzhou',
    name: '仙舟「罗浮」',
    nameEn: 'The Xianzhou Luofu',
    kind: 'region',
    order: 3,
    description:
      '六艘巨舰载着「丰饶」赐予的长生之躯航行星海。云骑军镇守长乐天，太卜司窥测天机，而长生种要面对的敌人，往往是自己活过的那些年。',
    theme: {
      primary: '#5eead4',
      accent: '#fcd34d',
      glow: 'rgba(94,234,212,0.35)',
      pattern: 'tex-xianzhou',
      tagline: '云海行舟，长生是恩赐也是枷锁',
    },
  },
  {
    id: 'penacony',
    name: '匹诺康尼',
    nameEn: 'Penacony',
    kind: 'region',
    order: 4,
    description:
      '「家族」经营的梦境之城，现实中最华丽的度假胜地。客人们在此做梦，却有人在梦里醒来——十二场梦境之后，「秩序」的美梦结束了。',
    theme: {
      primary: '#f0abfc',
      accent: '#fbbf24',
      glow: 'rgba(240,171,252,0.35)',
      pattern: 'tex-penacony',
      tagline: '欢迎来到梦境，请务必记住要醒来',
    },
  },
  {
    id: 'amphoreus',
    name: '翁法罗斯',
    nameEn: 'Amphoreus',
    kind: 'region',
    order: 5,
    description:
      '记忆与黄金的国度，黑潮自海角涌来，泰坦疯狂。十三位黄金裔执掌火种，踏上逐火之旅，只为在永夜之后为世界留下第一缕曙光。',
    theme: {
      primary: '#fcd34d',
      accent: '#c4b5fd',
      glow: 'rgba(252,211,77,0.35)',
      pattern: 'tex-amphoreus',
      tagline: '逐火之旅，此身即为明日的薪柴',
    },
  },
  {
    id: 'erxiang',
    name: '二相乐园',
    nameEn: 'Twin-Faced Paradise',
    kind: 'region',
    order: 6,
    description:
      '名为「欢愉」的乐园，梦核废墟、稀有蘑菇妖怪与永远不会结束的直播。谁被看见，谁被喜欢，谁就是正确答案。',
    theme: {
      primary: '#c084fc',
      accent: '#22d3ee',
      glow: 'rgba(192,132,252,0.35)',
      pattern: 'tex-erxiang',
      tagline: '流量即真理，狂欢直到世界尽头',
    },
  },
  {
    id: 'fate',
    name: 'Fate 联动线',
    nameEn: 'Fate Collaboration',
    kind: 'crossover',
    order: 7,
    description:
      '来自宇宙之外，那个存在着魔法与魔术的世界。圣杯战争的参加者因次元裂隙来到星穹铁道——与翁法罗斯无关，他们是另一条线上的来客。',
    theme: {
      primary: '#ef4444',
      accent: '#fbbf24',
      glow: 'rgba(239,68,68,0.35)',
      pattern: 'tex-fate',
      tagline: '来自异界的英灵，与另一场圣杯战争',
    },
  },
];

/* ------------------------------------------------------------------ *
 * 2. 角色 → 板块（94 人全覆盖）
 *
 * 依据：官方「阵营」字段 + 简介/故事正文的地名实证 + 用户决策。
 * 说明写进注释，便于日后复核。
 * ------------------------------------------------------------------ */

export const BOARD_OF = {
  // ── 星穹列车（官方阵营「星穹列车」全员，用户指定独立成板块）──
  '姬子': 'express',
  '姬子•启行': 'express',
  '瓦尔特': 'express',
  '丹恒': 'express',
  '三月七': 'express',
  '仙舟三月七': 'express',
  '星期日': 'express', // 官方阵营「星穹列车」，匹诺康尼篇后登车
  '开拓者•欢愉': 'express',
  '开拓者•记忆': 'express',
  '开拓者•同谐': 'express',
  '开拓者•存护': 'express',
  '开拓者·毁灭': 'express',

  // ── 黑塔空间站（空间站「黑塔」+ 开场即在空间站登场的星核猎手）──
  '黑塔': 'herta',
  '大黑塔': 'herta',
  '阮•梅': 'herta',
  '艾丝妲': 'herta',
  '阿兰': 'herta',
  '卡芙卡': 'herta', // 游戏开场在空间站植入星核
  '银狼': 'herta',
  '银狼LV.999': 'herta',

  // ── 贝洛伯格 ──
  '希儿': 'belobog',
  '克拉拉': 'belobog',
  '杰帕德': 'belobog',
  '布洛妮娅': 'belobog',
  '卢卡': 'belobog',
  '玲可': 'belobog',
  '虎克': 'belobog',
  '桑博': 'belobog',
  '佩拉': 'belobog',
  '娜塔莎': 'belobog',
  '希露瓦': 'belobog',
  '托帕&账账': 'belobog', // 代表公司赴雅利洛-VI 追讨债务，故事发生在贝洛伯格

  // ── 仙舟（罗浮/玉阙/朱明/曜青/仙舟联盟）──
  '爻光': 'xianzhou',
  '飞霄': 'xianzhou',
  '灵砂': 'xianzhou',
  '藿藿': 'xianzhou',
  '忘归人': 'xianzhou',
  '镜流': 'xianzhou',
  '云璃': 'xianzhou',
  '景元': 'xianzhou',
  '丹恒•饮月': 'xianzhou',
  '白露': 'xianzhou',
  '彦卿': 'xianzhou',
  '符玄': 'xianzhou',
  '罗刹': 'xianzhou',
  '貊泽': 'xianzhou',
  '寒鸦': 'xianzhou',
  '雪衣': 'xianzhou',
  '桂乃芬': 'xianzhou',
  '驭空': 'xianzhou',
  '素裳': 'xianzhou',
  '停云': 'xianzhou',
  '青雀': 'xianzhou',
  '椒丘': 'xianzhou', // 官方阵营为空，实为仙舟角色
  '刃': 'xianzhou', // 官方阵营「星核猎手」，但云上五骁的过往发生在仙舟
  '千冶•刃': 'xianzhou', // 故事正文：「他想起初至朱明不久」

  // ── 匹诺康尼 ──
  '知更鸟': 'penacony',
  '知更鸟•晴歌': 'penacony',
  '米沙': 'penacony',
  '加拉赫': 'penacony',
  '流萤': 'penacony',
  '花火': 'penacony',
  '黑天鹅': 'penacony',
  '黄泉': 'penacony',
  '波提欧': 'penacony',
  '乱破': 'penacony', // 简介原文：「如丑时三刻的闪光弹一般现身『在匹诺康尼』」
  '银枝': 'penacony',
  '砂金': 'penacony',
  '砂金•戏浪': 'penacony',
  '翡翠': 'penacony',
  '真理医生': 'penacony',
  '大丽花': 'penacony', // 故事：「美梦燃烧了永火官邸」「忆者大丽花，你为何叛离忆庭？」

  // ── 翁法罗斯（13 位黄金裔）──
  '风堇': 'amphoreus',
  '刻律德菈': 'amphoreus',
  '那刻夏': 'amphoreus',
  '丹恒•腾荒': 'amphoreus',
  '长夜月': 'amphoreus',
  '昔涟': 'amphoreus',
  '白厄': 'amphoreus',
  '缇宝': 'amphoreus',
  '遐蝶': 'amphoreus',
  '海瑟音': 'amphoreus',
  '阿格莱雅': 'amphoreus',
  '赛飞儿': 'amphoreus',
  '万敌': 'amphoreus',

  // ── 二相乐园 ──
  '绯英': 'erxiang',
  '星神★阿哈': 'erxiang',
  '火花': 'erxiang', // 故事：「《探秘二相乐园的梦核废弃学校》」
  '不死途': 'erxiang', // 与火花/真珠同批实装，命途「欢愉」
  '真珠': 'erxiang',

  // ── Fate 联动线（官方阵营「异界」）──
  '远坂凛': 'fate',
  '吉尔伽美什': 'fate',
  'Saber': 'fate',
  'Archer': 'fate',
};

/* ------------------------------------------------------------------ *
 * 3. 阵营（17 个）
 * ------------------------------------------------------------------ */

export const FACTIONS = [
  { id: 'express', name: '星穹列车', nameEn: 'Astral Express', color: '#fbbf24', crest: '✦', order: 1, boardId: 'express', blurb: '沿着银轨航行的无名客。' },
  { id: 'stellar-hunters', name: '星核猎手', nameEn: 'Stellaron Hunters', color: '#f472b6', crest: '✧', order: 2, boardId: 'herta', blurb: '被银河通缉的危险分子，按「剧本」行动。' },
  { id: 'galaxy-rangers', name: '巡海游侠', nameEn: 'Galaxy Rangers', color: '#38bdf8', crest: '➶', order: 3, boardId: 'penacony', blurb: '游走星海的侠客，惩奸除恶不问出身。' },
  { id: 'xianzhou-alliance', name: '仙舟联盟', nameEn: 'Xianzhou Alliance', color: '#5eead4', crest: '☯', order: 4, boardId: 'xianzhou', blurb: '六艘仙舟结成的联盟，与「丰饶」的孽物世代相争。' },
  { id: 'genius-society', name: '天才俱乐部', nameEn: 'Genius Society', color: '#a78bfa', crest: '⌘', order: 5, boardId: 'herta', blurb: '「智识」星神博识尊选中的天才们。' },
  { id: 'ipc', name: '星际和平公司', nameEn: 'Interastral Peace Corporation', color: '#facc15', crest: '⬢', order: 6, boardId: 'penacony', blurb: '以信用点丈量宇宙的庞大财团。' },
  { id: 'penacony-family', name: '匹诺康尼家族', nameEn: 'The Family', color: '#f0abfc', crest: '✵', order: 7, boardId: 'penacony', blurb: '经营梦境之城「匹诺康尼」的家族，信奉「同谐」。' },
  { id: 'masked-fools', name: '假面愚者', nameEn: 'Masked Fools', color: '#fb7185', crest: '☺', order: 8, boardId: 'penacony', blurb: '追随「欢愉」星神阿哈的乐子人。' },
  { id: 'garden-of-recollection', name: '流光忆庭', nameEn: 'Garden of Recollection', color: '#c4b5fd', crest: '❂', order: 9, boardId: 'penacony', blurb: '收藏记忆的忆者们，替「记忆」星神保存宇宙的过往。' },
  { id: 'intelligentsia-guild', name: '博识学会', nameEn: 'Intelligentsia Guild', color: '#7dd3fc', crest: '⚕', order: 10, boardId: 'penacony', blurb: '以「知识应当流通」为信条的学者组织。' },
  { id: 'knights-of-beauty', name: '纯美骑士团', nameEn: 'Knights of Beauty', color: '#fca5a5', crest: '❀', order: 11, boardId: 'penacony', blurb: '追寻「纯美」伊德莉拉的骑士。' },
  { id: 'cremators', name: '焚化工', nameEn: 'Cremators', color: '#fb923c', crest: '✹', order: 12, boardId: 'penacony', blurb: '燃烧「记忆」，在毁灭与遗忘之间行走。' },
  { id: 'belobog', name: '贝洛伯格', nameEn: 'Belobog', color: '#a5d8ff', crest: '❄', order: 13, boardId: 'belobog', blurb: '永冻城邦雅利洛-VI 的人们。' },
  { id: 'herta-station', name: '空间站「黑塔」', nameEn: 'Herta Space Station', color: '#67e8f9', crest: '◎', order: 14, boardId: 'herta', blurb: '黑塔的私人实验室与它的科员们。' },
  { id: 'chrysos-heirs', name: '翁法罗斯黄金裔', nameEn: 'Chrysos Heirs', color: '#fcd34d', crest: '☀', order: 15, boardId: 'amphoreus', blurb: '执掌十二枚火种、踏上逐火之旅的半神。' },
  { id: 'erxiang-residents', name: '二相乐园', nameEn: 'Twin-Faced Paradise', color: '#c084fc', crest: '◉', order: 16, boardId: 'erxiang', blurb: '乐园的原住民与它的直播观众。' },
  { id: 'fate-collab', name: 'Fate 联动线', nameEn: 'Fate Collaboration', color: '#ef4444', crest: '⚔', order: 17, boardId: 'fate', blurb: '来自宇宙之外的英灵与魔术师。' },
];

/**
 * 官方阵营字段 → 归一化 faction id。
 * 只有官方值为空时才需要在这里兜底（黄金裔）。
 */
export const FACTION_RULES = [
  { match: ['仙舟「罗浮」', '仙舟「玉阙」', '仙舟「朱明」', '仙舟「曜青」', '仙舟联盟'], faction: 'xianzhou-alliance' },
  { match: ['巡海游侠', '巡海游侠/自灭者'], faction: 'galaxy-rangers' },
  { match: ['匹诺康尼'], faction: 'penacony-family' },
  { match: ['异界'], faction: 'fate-collab' },
  { match: ['星穹列车'], faction: 'express' },
  { match: ['星核猎手'], faction: 'stellar-hunters' },
  { match: ['星际和平公司'], faction: 'ipc' },
  { match: ['假面愚者'], faction: 'masked-fools' },
  { match: ['流光忆庭'], faction: 'garden-of-recollection' },
  { match: ['博识学会'], faction: 'intelligentsia-guild' },
  { match: ['纯美骑士团'], faction: 'knights-of-beauty' },
  { match: ['焚化工'], faction: 'cremators' },
  { match: ['贝洛伯格'], faction: 'belobog' },
  { match: ['二相乐园'], faction: 'erxiang-residents' },
];

/**
 * 唯一一处对官方阵营的人为覆盖：
 * 黑塔 / 大黑塔 / 阮•梅 的官方阵营是「空间站「黑塔」」（那是地点的名字），
 * 但用户点名要求「天才俱乐部」，且此三人确为该组织成员。
 * 被覆盖的官方值会保留在 affiliation 字段里，不会丢失信息。
 */
export const FACTION_OVERRIDE = {
  '黑塔': 'genius-society',
  '大黑塔': 'genius-society',
  '阮•梅': 'genius-society',
};

/**
 * 官方阵营为空时的兜底。
 *
 * 只有这两个板块满足「属于该板块 ⇒ 必属该阵营」：
 *  - 翁法罗斯全员是执掌火种的黄金裔
 *  - 仙舟各舰（罗浮/玉阙/朱明/曜青）全员隶属仙舟联盟
 * 其余的板块阵营混杂（匹诺康尼/黑塔空间站里有多个组织），故不设兜底，让构建直接报错。
 */
export const FACTION_FALLBACK_BY_BOARD = {
  amphoreus: 'chrysos-heirs',
  xianzhou: 'xianzhou-alliance',
};

/* ------------------------------------------------------------------ *
 * 4. 同一角色的其他形态（仅供关系图折叠与页面互链，不合并专栏）
 * ------------------------------------------------------------------ */

export const VARIANT_OF = {
  '砂金•戏浪': '砂金',
  '知更鸟•晴歌': '知更鸟',
  '姬子•启行': '姬子',
  '银狼LV.999': '银狼',
  '千冶•刃': '刃',
  '仙舟三月七': '三月七',
  '丹恒•饮月': '丹恒',
  '大黑塔': '黑塔',
};

/* ------------------------------------------------------------------ *
 * 5. 关系类型判定
 *
 * 先跑 AMBIGUOUS，再依次跑 family / enemy / mentor / superior，
 * 全部未命中则落回 ally。
 * ------------------------------------------------------------------ */

/** 看似敌对实为战友的措辞，必须优先于 enemy 规则命中。 */
export const AMBIGUOUS_AS_ALLY = /旗鼓相当的对手|势均力敌的对手|竞争对手|惺惺相惜|亦敌亦友|切磋/;

export const RELATION_TYPE_RULES = [
  { type: 'family', re: /妹|姐|兄|弟|父|母|家人|血脉|女儿|儿子|孙女|血亲|养女|养子|侄子|外甥/ },
  { type: 'enemy', re: /敌人|宿敌|仇|叛|对立|死敌|恨|背叛|理念不合|死斗|威胁|憎恶|杀父|骗局/ },
  { type: 'mentor', re: /老师|教授|导师|学生|传授|指引|前辈|教导|启蒙|弟子|徒弟|教诲|授業/ },
  { type: 'superior', re: /领袖|领导|上司|部下|属下|下属|女皇|将军|统帅|长官|同僚|座下|追随|效忠|上司|麾下|属下|上司|司鼎|司舵|太卜/ },
];

/** 官方关系文案在个别组合上会误判，这里按「来源→目标」精确覆盖。 */
export const RELATION_TYPE_OVERRIDES = {
  // 形如 `'阿格莱雅→白厄': 'superior'` 可在此追加
};

/** 极少数「长辈是谁」判反的组合，在这里按「来源→目标」硬指定箭头方向。 */
export const RELATION_DIRECTION_OVERRIDE = {
  // 形如 `'缇宝→阿格莱雅': 's2t'` 可在此追加
};

/**
 * 箭头方向。
 *
 * 语义：`s2t` = 箭头 source→target，`t2s` = 箭头 target→source，
 * `both` = 双向箭头，`none` = 无箭头（family / ally 用）。
 *
 * 规则：
 *  - family / ally        → none
 *  - enemy                → both
 *  - mentor / superior    → 由「谁是长辈」决定，见下面的两个正则
 *
 * 官方「角色关系」模块的文案描述的是**目标相对来源的身份**
 * （例：阿格莱雅 的条目里写着 缇宝 =「逐火之旅的老师」），
 * 所以命中 SENIOR_ROLE 时长辈是 target（t2s），命中 JUNIOR_ROLE 时长辈是 source（s2t）。
 * 两者都不命中时官方数据默认 t2s（因为它总是从「来源」视角描述对方）。
 */
export const SENIOR_ROLE = /老师|师父|导师|教授|前辈|首领|领袖|上司|女皇|将军|统帅|长官|司鼎|司舵|太卜|家主|城主|王|殿下|主人|宿主|领航员/;
export const JUNIOR_ROLE = /学生|弟子|徒弟|后辈|部下|属下|下属|麾下|云骑|卜者|判官|见习|追随|手下|成员|受教/;

/**
 * 策展关系的默认方向是 s2t（作者按「长辈在前」书写）。
 * 只有下列少数几条的书写顺序不是长辈在前，才需要单独翻转。
 */
export const SEED_DIR = {
  '貊泽|飞霄': 't2s',
  '佩拉|杰帕德': 't2s',
  '杰帕德|布洛妮娅': 't2s',
};
export const SEED_DIR_DEFAULT = 's2t';

/** 官方关系文案里偶尔只写简称，这里映射回名册里的正式名。 */
export const ALIAS_TO_NAME = {
  '开拓者': '开拓者·毁灭', // 五种形态共用一个人格，取基础形态作为图上的落点
  '托帕': '托帕&账账',
  '黑塔女士': '黑塔',
};

/* ------------------------------------------------------------------ *
 * 6. 策展关系边
 *
 * 官方「角色关系」模块只覆盖翁法罗斯的 13 人（40 个角色里 39 个是翁法罗斯），
 * 其余 50 多人必须靠这张表才能织出关系网。每条都写明剧情依据。
 * s / t 使用角色名（可指向 EXTERNAL_NODES 的 id）。
 * ------------------------------------------------------------------ */

export const RELATION_SEED = [
  // ── 星穹列车 ──
  { s: '姬子', t: '瓦尔特', rel: '并肩多年的列车伙伴', type: 'ally', note: '两人自列车修复后共同航行至今。' },
  { s: '姬子', t: '丹恒', rel: '列车同僚', type: 'ally', note: '丹恒以护卫身份登上星穹列车。' },
  { s: '姬子', t: '三月七', rel: '列车同僚', type: 'ally', note: '三月七自冰封中醒来后由姬子照料。' },
  { s: '姬子', t: '开拓者', rel: '引领新无名客的领航员', type: 'mentor', note: '姬子把开拓者带上列车并教会他何为「开拓」。' },
  { s: '瓦尔特', t: '开拓者', rel: '列车上最年长的前辈', type: 'mentor', note: '瓦尔特以逆熵盟主的阅历指点年轻的无名客。' },
  { s: '瓦尔特', t: '三月七', rel: '列车同僚', type: 'ally', note: '同在列车上旅行的伙伴。' },
  { s: '丹恒', t: '三月七', rel: '列车同僚', type: 'ally', note: '常年同行的伙伴。' },
  { s: '丹恒', t: '开拓者', rel: '列车同僚', type: 'ally', note: '并肩穿越数個世界的同行者。' },
  { s: '星期日', t: '知更鸟', rel: '亲生兄妹', type: 'family', note: '橡木家系的双子，匹诺康尼篇的核心羁绊。' },
  { s: '星期日', t: '开拓者', rel: '同行于匹诺康尼的旅伴', type: 'ally', note: '「秩序」的美梦落幕后的同行者。' },
  { s: '姬子•启行', t: '瓦尔特', rel: '共同见证列车再度启行', type: 'ally', note: '姬子的另一形态，与瓦尔特同在列车上。' },

  // ── 星核猎手 ──
  { s: '卡芙卡', t: '银狼', rel: '长期搭档', type: 'ally', note: '两人常一同执行剧本中的任务。' },
  { s: '卡芙卡', t: '刃', rel: '同行者', type: 'ally', note: '同属星核猎手。' },
  { s: '卡芙卡', t: '流萤', rel: '同行者', type: 'ally', note: '同属星核猎手。' },
  { s: '银狼', t: '流萤', rel: '游戏搭子', type: 'ally', note: '银狼把每一次任务都当成游戏。' },
  { s: '刃', t: '流萤', rel: '同行者', type: 'ally', note: '同属星核猎手。' },

  // ── 云上五骁的旧账 ──
  { s: '刃', t: '镜流', rel: '旧日同袍，恩怨难解', type: 'enemy', note: '云上五骁凋零后，两人在罗浮兵刃相向。' },
  { s: '丹恒', t: '刃', rel: '纠缠不散的宿怨', type: 'enemy', note: '刃把饮月君留下的债记在丹恒身上。' },
  { s: '镜流', t: '景元', rel: '同为云上五骁', type: 'ally', note: '五骁曾在罗浮并肩。' },
  { s: '镜流', t: '丹恒•饮月', rel: '同为云上五骁', type: 'ally', note: '饮月君与镜流同为五骁成员。' },
  { s: '刃', t: '丹恒•饮月', rel: '同为云上五骁', type: 'ally', note: '应星与饮月君曾是最要好的同伴。' },
  { s: '景元', t: '丹恒•饮月', rel: '云上五骁旧识', type: 'ally', note: '将军与饮月君相识于数百年前。' },

  // ── 贝洛伯格 ──
  { s: '希儿', t: '布洛妮娅', rel: '地火与大守护者，一同守护雅利洛-VI', type: 'ally', note: '上下层区和解后并肩重建城邦。' },
  { s: '杰帕德', t: '希露瓦', rel: '姐弟', type: 'family', note: '朗道家的三姐弟之一。' },
  { s: '杰帕德', t: '玲可', rel: '兄妹', type: 'family', note: '朗道家的三姐弟之一。' },
  { s: '希露瓦', t: '玲可', rel: '姐妹', type: 'family', note: '朗道家的三姐弟之一。' },
  { s: '杰帕德', t: '布洛妮娅', rel: '银鬃铁卫戍卫官效忠于大守护者', type: 'superior', note: '铁卫的最高指挥官听命于大守护者。' },
  { s: '佩拉', t: '杰帕德', rel: '银鬃铁卫情报官', type: 'superior', note: '佩拉担任铁卫的情报工作，向戍卫官汇报。' },
  { s: '娜塔莎', t: '虎克', rel: '照看鼹鼠党的地下医生', type: 'mentor', note: '下层区的孩子们都在娜塔莎的诊所里长大。' },
  { s: '卢卡', t: '希儿', rel: '地火同僚', type: 'ally', note: '两人都是下层区「地火」的成员。' },
  { s: '桑博', t: '开拓者', rel: '贝洛伯格的老熟人', type: 'ally', note: '自称「蓝弟弟」的行商，屡次与开拓者打交道。' },
  { s: '托帕&账账', t: '布洛妮娅', rel: '代表公司向雅利洛-VI 追讨债务', type: 'enemy', note: '星际和平公司的债务清算使团，与贝洛伯格一度剑拔弩张。' },

  // ── 仙舟 ──
  { s: '景元', t: '彦卿', rel: '亲授剑术的师徒', type: 'mentor', note: '神策府将军景元亲自教导少年彦卿。' },
  { s: '景元', t: '符玄', rel: '将军与太卜', type: 'superior', note: '太卜司太卜辅佐神策府将军。' },
  { s: '景元', t: '灵砂', rel: '将军与丹鼎司司鼎', type: 'superior', note: '丹鼎司司鼎听命于云骑军统领。' },
  { s: '飞霄', t: '景元', rel: '同为仙舟将军', type: 'ally', note: '曜青与罗浮的两位将军。' },
  { s: '貊泽', t: '飞霄', rel: '曜青的云骑', type: 'superior', note: '貊泽是曜青将军飞霄的部下。' },
  { s: '椒丘', t: '飞霄', rel: '曜青的策士与将军', type: 'ally', note: '椒丘常为飞霄筹谋。' },
  { s: '驭空', t: '停云', rel: '天舶司司舵与接渡使', type: 'superior', note: '停云在天舶司任职。' },
  { s: '符玄', t: '青雀', rel: '太卜司太卜与卜者', type: 'superior', note: '青雀名义上是太卜司的卜者。' },
  { s: '雪衣', t: '藿藿', rel: '十王司的判官与见习判官', type: 'superior', note: '藿藿由十王司判官雪衣带着办差。' },
  { s: '寒鸦', t: '雪衣', rel: '姐妹', type: 'family', note: '十王司的两位判官是亲姐妹。' },
  { s: '素裳', t: '桂乃芬', rel: '一见如故的好友', type: 'ally', note: '云骑少女与罗浮杂技艺人成了好友。' },
  { s: '桂乃芬', t: '开拓者', rel: '罗浮的熟人', type: 'ally', note: '在罗浮与开拓者结识。' },
  { s: '停云', t: '开拓者', rel: '天舶司的接渡使', type: 'ally', note: '负责接待初到罗浮的旅客。' },
  { s: '白露', t: '丹恒•饮月', rel: '龙尊传承的先代与今人', type: 'ally', note: '现任龙尊与饮月君的转世。' },
  { s: '罗刹', t: '景元', rel: '被罗浮羁押的异邦旅人', type: 'enemy', note: '罗刹在罗浮的行动让云骑军损失惨重。' },
  { s: '云璃', t: '彦卿', rel: '剑术上的好友与对手', type: 'ally', note: '朱明少女与罗浮少年在切磋中结识。' },

  // ── 匹诺康尼 ──
  { s: '星期日', t: '加拉赫', rel: '橡木家系与猎犬家系', type: 'superior', note: '加拉赫是橡木家系的猎犬。' },
  { s: '砂金', t: '翡翠', rel: '同为石心十人', type: 'ally', note: '战略投资部的同侪。' },
  { s: '砂金', t: '托帕&账账', rel: '石心十人同僚', type: 'ally', note: '同属战略投资部。' },
  { s: '砂金', t: '真理医生', rel: '匹诺康尼事件的合作者', type: 'ally', note: '真理医生受雇参与砂金的赌局。' },
  { s: '黑天鹅', t: '花火', rel: '忆者与假面愚者', type: 'ally', note: '两位在匹诺康尼各自下注的看客。' },
  { s: '花火', t: '开拓者', rel: '匹诺康尼的看客与主角', type: 'ally', note: '花火一路观察开拓者的选择。' },
  { s: '黑天鹅', t: '开拓者', rel: '指尖的忆者', type: 'ally', note: '黑天鹅从开拓者的记忆里寻找答案。' },
  { s: '黄泉', t: '开拓者', rel: '自灭者的同行', type: 'ally', note: '黄泉在匹诺康尼多次出手相助。' },
  { s: '流萤', t: '开拓者', rel: '约定一同看海的旅伴', type: 'ally', note: '匹诺康尼篇中最深的羁绊之一。' },
  { s: '波提欧', t: '黄泉', rel: '同为巡海游侠', type: 'ally', note: '两人都在追猎公司的爪牙。' },
  { s: '乱破', t: '波提欧', rel: '同为巡海游侠', type: 'ally', note: '忍侠与牛仔在匹诺康尼碰头。' },
  { s: '银枝', t: '开拓者', rel: '纯美骑士团的旧识', type: 'ally', note: '银枝始终把开拓者当作值得赞美的对象。' },
  { s: '大丽花', t: '黑天鹅', rel: '叛离流光忆庭的忆者', type: 'enemy', note: '大丽花烧尽同她有关的记忆后离开忆庭。' },

  // ── 翁法罗斯（官方关系之外的补充）──
  { s: '白厄', t: '开拓者', rel: '逐火之旅的同行者', type: 'ally', note: '无名的英雄与天外来客一同走过翁法罗斯。' },
  { s: '昔涟', t: '开拓者', rel: '共同写下诗篇的人', type: 'ally', note: '哀丽秘榭的女儿与开拓者约定写下不同以往的诗。' },

  // ── 星神 ──
  // 名册里已有角色「星神★阿哈」（id 8099），这里直接把欢愉的两条线连到该角色节点上，
  // 不再像以前那样另建一个同名的外部人影节点。
  { s: '星神★阿哈', t: '花火', rel: '「欢愉」的星神', type: 'superior', note: '假面愚者追随阿哈。' },
  { s: '星神★阿哈', t: '桑博', rel: '「欢愉」的星神', type: 'superior', note: '桑博的所作所为皆以「欢愉」为名。' },

  // ── Fate 联动线 ──
  { s: '远坂凛', t: 'Archer', rel: '御主与从者', type: 'superior', note: 'Archer 是凛在圣杯战争中召唤的从者。' },
  { s: '远坂凛', t: '吉尔伽美什', rel: '圣杯战争中敌对的英灵', type: 'enemy', note: '同为圣杯战争参加者，立场对立。' },
  { s: '吉尔伽美什', t: 'Saber', rel: '圣杯战争中的宿敌', type: 'enemy', note: '英雄王对骑士王的执念贯穿整场战争。' },
  { s: 'Saber', t: '远坂凛', rel: '圣杯战争中结盟的从者与御主', type: 'ally', note: '失去御主后与凛缔结契约、并肩作战。' },
  { s: 'Archer', t: '吉尔伽美什', rel: '同为弓兵职阶的生死对手', type: 'enemy', note: '终局中两人以弓兵之名对决。' },
];

/* ------------------------------------------------------------------ *
 * 7. 关系图里的外部节点（未实装人物）
 *
 * 按用户决策 4：用「空白圆图框 + 黑色人影 + 名称」渲染，不出现在角色专栏里。
 * ------------------------------------------------------------------ */

export const EXTERNAL_NODES = [
  { id: 'EXT:elio', name: '艾利欧', faction: 'stellar-hunters', reason: '星核猎手的首领，写下所有人的「剧本」。' },
  { id: 'EXT:diamond', name: '钻石', faction: 'ipc', reason: '星际和平公司战略投资部主管，「石心十人」之首。' },
  { id: 'EXT:cocolia', name: '可可利亚', faction: 'belobog', reason: '贝洛伯格前大守护者，布洛妮娅的养母。' },
  { id: 'EXT:svarog', name: '史瓦罗', faction: 'belobog', reason: '古代遗迹守卫，克拉拉的家人。' },
  { id: 'EXT:baiheng', name: '白珩', faction: 'xianzhou-alliance', reason: '云上五骁之一，其死改变了其余四人的命运。' },
  // 「欢愉」星神阿哈不再单独建外部节点：名册里已有角色「星神★阿哈」（id 8099），
  // 关系直接连到那个角色节点上，见 RELATION_SEED 的「星神」一节。
];

export const EXTERNAL_LINKS = [
  { s: 'EXT:elio', t: '卡芙卡', rel: '星核猎手的首领', type: 'superior', note: '卡芙卡按艾利欧的剧本行动。' },
  { s: 'EXT:elio', t: '银狼', rel: '星核猎手的首领', type: 'superior', note: '银狼加入星核猎手时接受艾利欧的邀请。' },
  { s: 'EXT:elio', t: '刃', rel: '星核猎手的首领', type: 'superior', note: '刃在艾利欧的剧本中扮演自己的角色。' },
  { s: 'EXT:elio', t: '流萤', rel: '星核猎手的首领', type: 'superior', note: '流萤为寻找「生」的机会加入星核猎手。' },
  { s: 'EXT:diamond', t: '砂金', rel: '石心十人之首', type: 'superior', note: '砂金是战略投资部的高级干部。' },
  { s: 'EXT:diamond', t: '翡翠', rel: '石心十人之首', type: 'superior', note: '翡翠同为石心十人成员。' },
  { s: 'EXT:diamond', t: '托帕&账账', rel: '石心十人之首', type: 'superior', note: '托帕隶属战略投资部。' },
  { s: 'EXT:cocolia', t: '布洛妮娅', rel: '养母与女儿', type: 'family', note: '可可利亚将布洛妮娅抚养成人。' },
  { s: 'EXT:cocolia', t: '希儿', rel: '贝洛伯格内乱的对立者', type: 'enemy', note: '下层区地火与大守护者长期对抗。' },
  { s: 'EXT:svarog', t: '克拉拉', rel: '守护克拉拉的家人', type: 'family', note: '史瓦罗把克拉拉当作自己的家人。' },
  { s: 'EXT:baiheng', t: '景元', rel: '同为云上五骁', type: 'ally', note: '五人的名字被一同写进罗浮的旧史。' },
  { s: 'EXT:baiheng', t: '镜流', rel: '同为云上五骁', type: 'ally', note: '白珩之死是镜流转向的起点。' },
  { s: 'EXT:baiheng', t: '刃', rel: '同为云上五骁', type: 'ally', note: '应星因白珩之死而踏上不归路。' },
  { s: 'EXT:baiheng', t: '丹恒•饮月', rel: '同为云上五骁', type: 'ally', note: '饮月君与白珩同为五骁。' },
];

/* ------------------------------------------------------------------ *
 * 7.5 角色节点在关系图里的一句话说明
 *
 * 外部人影节点用 EXTERNAL_NODES.reason；角色节点的 reason 默认是 null，
 * 需要时在这里补一句（用于关系图的聚焦卡 / 悬停卡 / 关键词搜索）。
 * ------------------------------------------------------------------ */

export const CHARACTER_REASON = {
  '星神★阿哈': '「欢愉」星神，把整个宇宙当成一场玩笑。',
};

/* ------------------------------------------------------------------ *
 * 8. 角色主题：属性色 × 命途纹理 × 板块纹样 × 稀有度光泽
 * ------------------------------------------------------------------ */

export const ELEMENT_THEME = {
  冰: { primary: '#a5d8ff', accent: '#e0f2fe' },
  火: { primary: '#fb923c', accent: '#fbbf24' },
  雷: { primary: '#c084fc', accent: '#f0abfc' },
  风: { primary: '#5eead4', accent: '#a7f3d0' },
  物理: { primary: '#cbd5e1', accent: '#f1f5f9' },
  量子: { primary: '#a78bfa', accent: '#c4b5fd' },
  虚数: { primary: '#fcd34d', accent: '#fde68a' },
};

/** backgroundStyle 的取值即 index.css 里的纹理类名后缀。 */
export const PATH_THEME = {
  毁灭: { pattern: 'pat-destruction', label: '裂纹' },
  巡猎: { pattern: 'pat-hunt', label: '箭矢轨迹' },
  智识: { pattern: 'pat-erudition', label: '数据栅格' },
  同谐: { pattern: 'pat-harmony', label: '声波' },
  虚无: { pattern: 'pat-nihility', label: '暗蚀' },
  存护: { pattern: 'pat-preservation', label: '棱盾' },
  记忆: { pattern: 'pat-remembrance', label: '胶片' },
  欢愉: { pattern: 'pat-elation', label: '彩纸' },
  丰饶: { pattern: 'pat-abundance', label: '藤蔓' },
};

export const DEFAULT_PATTERN = 'pat-erudition';

/** 少数标志性角色追加个人强调色，避免同属性同命途的角色页完全雷同。 */
export const CHARACTER_ACCENT_OVERRIDE = {
  '黑塔': '#e879f9',
  '大黑塔': '#c026d3',
  '花火': '#fb7185',
  '黄泉': '#a78bfa',
  '白厄': '#f59e0b',
  '白露': '#38bdf8',
  '卡芙卡': '#d946ef',
  '流萤': '#22d3ee',
  '知更鸟': '#fda4af',
  '星期日': '#fcd34d',
  '景元': '#fbbf24',
  '镜流': '#93c5fd',
  'Saber': '#fbbf24',
  '吉尔伽美什': '#ef4444',
  '遐蝶': '#c4b5fd',
  '昔涟': '#f9a8d4',
};

/* ------------------------------------------------------------------ *
 * 9. 可以确证的官方英文名
 *
 * 只收录能确认的官方写法；不确定的一律留 null，
 * 搜索主键始终是中文名 / 别名 / 简介。
 * ------------------------------------------------------------------ */

export const NAME_EN = {
  '三月七': 'March 7th',
  '丹恒': 'Dan Heng',
  '丹恒•饮月': 'Dan Heng · Imbibitor Lunae',
  '丹恒•腾荒': 'Dan Heng · Permansor Terrae',
  '姬子': 'Himeko',
  '瓦尔特': 'Welt',
  '开拓者•毁灭': 'Trailblazer · Destruction',
  '开拓者•存护': 'Trailblazer · Preservation',
  '开拓者•同谐': 'Trailblazer · Harmony',
  '开拓者•记忆': 'Trailblazer · Remembrance',
  '开拓者•欢愉': 'Trailblazer · Elation',
  '希儿': 'Seele',
  '布洛妮娅': 'Bronya',
  '杰帕德': 'Gepard',
  '克拉拉': 'Clara',
  '娜塔莎': 'Natasha',
  '佩拉': 'Pela',
  '桑博': 'Sampo',
  '希露瓦': 'Serval',
  '玲可': 'Lynx',
  '卢卡': 'Luka',
  '虎克': 'Hook',
  '黑塔': 'Herta',
  '大黑塔': 'The Herta',
  '艾丝妲': 'Asta',
  '阿兰': 'Arlan',
  '阮•梅': 'Ruan Mei',
  '卡芙卡': 'Kafka',
  '银狼': 'Silver Wolf',
  '银狼LV.999': 'Silver Wolf LV.999',
  '刃': 'Blade',
  '流萤': 'Firefly',
  '镜流': 'Jingliu',
  '景元': 'Jing Yuan',
  '彦卿': 'Yanqing',
  '白露': 'Bailu',
  '符玄': 'Fu Xuan',
  '罗刹': 'Luocha',
  '停云': 'Tingyun',
  '忘归人': 'Fugue',
  '青雀': 'Qingque',
  '素裳': 'Sushang',
  '驭空': 'Yukong',
  '桂乃芬': 'Guinaifen',
  '寒鸦': 'Hanya',
  '雪衣': 'Xueyi',
  '藿藿': 'Huohuo',
  '飞霄': 'Feixiao',
  '灵砂': 'Lingsha',
  '云璃': 'Yunli',
  '椒丘': 'Jiaoqiu',
  '貊泽': 'Moze',
  '知更鸟': 'Robin',
  '星期日': 'Sunday',
  '花火': 'Sparkle',
  '黑天鹅': 'Black Swan',
  '黄泉': 'Acheron',
  '砂金': 'Aventurine',
  '翡翠': 'Jade',
  '托帕&账账': 'Topaz & Numby',
  '真理医生': 'Dr. Ratio',
  '米沙': 'Misha',
  '加拉赫': 'Gallagher',
  '乱破': 'Rappa',
  '波提欧': 'Boothill',
  '银枝': 'Argenti',
  '阿格莱雅': 'Aglaea',
  '白厄': 'Phainon',
  '缇宝': 'Tribbie',
  '遐蝶': 'Castorice',
  '万敌': 'Mydei',
  '那刻夏': 'Anaxa',
  '风堇': 'Hyacine',
  '海瑟音': 'Hysilens',
  '赛飞儿': 'Cipher',
  '昔涟': 'Cyrene',
  '大丽花': 'Dahlia',
  'Saber': 'Saber',
  'Archer': 'Archer',
};

/* ------------------------------------------------------------------ *
 * 10. 极少数官方数据缺失时的人工补正
 * ------------------------------------------------------------------ */

export const RARITY_FIX = {
  '椒丘': 5, // 官方条目缺少「星级」标签
};

/**
 * 板块的展示顺序 = BOARDS.order；
 * 板块内角色顺序 = 实装日期升序（无日期者排在最后，按名字稳定排序）。
 */
export const BOARD_ORDER_FALLBACK = 999999;
