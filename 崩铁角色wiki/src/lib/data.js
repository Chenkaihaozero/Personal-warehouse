/**
 * 数据访问层。
 *
 * 所有页面都从这里取数，绝不各自 import JSON 路径 —— 这样换数据源时只改一个文件。
 * 轻量数据（名册 / 板块 / 阵营 / 关系）直接内联进主包；
 * 单个角色的完整故事体量大，走 import.meta.glob 懒加载，只有进角色页才下载。
 */

import indexJson from '../data/characters/index.json';
import relationsJson from '../data/relations.json';
import regionsJson from '../data/regions.json';
import factionsJson from '../data/factions.json';

/** 全量角色「轻量条目」，已按出场顺序排序。 */
export const characters = indexJson;
export const relations = relationsJson;
export const regions = regionsJson;
export const factions = factionsJson;

const N = (v) => String(v);

export const charById = new Map(characters.map((c) => [N(c.id), c]));
export const charByName = new Map(characters.map((c) => [c.name, c]));
export const regionById = new Map(regions.map((r) => [r.id, r]));
export const factionById = new Map(factions.map((f) => [f.id, f]));
export const nodeById = new Map(relations.nodes.map((n) => [N(n.id), n]));
export const nodeByName = new Map(relations.nodes.map((n) => [n.name, n]));

export const getCharacter = (id) => charById.get(N(id)) || null;
export const getRegion = (id) => regionById.get(id) || null;
export const getFaction = (id) => factionById.get(id) || null;
export const getNode = (id) => nodeById.get(N(id)) || null;

/** 按 id 取「轻量条目」数组（保持全局出场顺序）。 */
export const pickCharacters = (ids) => ids.map((id) => charById.get(N(id))).filter(Boolean);

export const boardMembers = (boardId) => characters.filter((c) => c.board === boardId);
export const factionMembers = (factionId) => characters.filter((c) => c.faction === factionId);

/* ------------------------------------------------------------------ *
 * 单个角色的完整数据（懒加载）
 * ------------------------------------------------------------------ */

// 路径形如 '../data/characters/5107-白厄.json'，用「文件名开头的数字 id」定位。
const charModules = import.meta.glob('../data/characters/*.json');
const moduleKeyById = new Map();
for (const key of Object.keys(charModules)) {
  const m = /\/(\d+)-[^/]*\.json$/.exec(key);
  if (m) moduleKeyById.set(m[1], key);
}

const detailCache = new Map();

/** @returns {Promise<object|null>} 完整角色数据（含 stories） */
export async function loadCharacterDetail(id) {
  const key = moduleKeyById.get(N(id));
  if (!key) return null;
  if (!detailCache.has(key)) {
    detailCache.set(
      key,
      charModules[key]().then((mod) => mod.default || mod),
    );
  }
  return detailCache.get(key);
}

/* ------------------------------------------------------------------ *
 * 关系
 * ------------------------------------------------------------------ */

const linksByNode = new Map();
for (const link of relations.links) {
  for (const end of [link.source, link.target]) {
    if (!linksByNode.has(end)) linksByNode.set(end, []);
    linksByNode.get(end).push(link);
  }
}

/**
 * 一个角色的全部关系。
 * @returns {{other: object, link: object, outgoing: boolean}[]}
 */
export function relationsOf(id) {
  const node = getNode(id);
  if (!node) return [];
  return (linksByNode.get(node.name) || [])
    .map((link) => {
      const otherName = link.source === node.name ? link.target : link.source;
      const other = nodeByName.get(otherName) || null;
      return { other, link, outgoing: link.source === node.name };
    })
    .filter((r) => r.other)
    .sort((a, b) => (b.other.degree || 0) - (a.other.degree || 0));
}

/** 同一角色的其他形态（用于角色页互相跳转）。 */
export const variantsOf = (id) => {
  const c = getCharacter(id);
  if (!c) return [];
  return characters.filter((x) => x.variantOf === c.name);
};

export const baseVariantOf = (id) => {
  const c = getCharacter(id);
  if (!c || !c.variantOf) return null;
  return charByName.get(c.variantOf) || null;
};

/* ------------------------------------------------------------------ *
 * 主题
 * ------------------------------------------------------------------ */

export const RELATION_STYLE = {
  family: { label: '血缘 / 家人', color: '#fb7185', dash: 'solid', arrow: 'none' },
  ally: { label: '同盟 / 同伴', color: '#5eead4', dash: 'solid', arrow: 'none' },
  superior: { label: '上下 / 归属', color: '#fbbf24', dash: 'dashed', arrow: 'forward' },
  mentor: { label: '师生 / 传承', color: '#a78bfa', dash: 'dashed', arrow: 'forward' },
  enemy: { label: '敌对 / 冲突', color: '#f87171', dash: 'dotted', arrow: 'both' },
};

const DEFAULT_GLOW = 'rgba(125, 211, 252, 0.35)';

/** 主题里的 glow 有两种写法（rgba() 字符串 / "r g b"），统一成 rgba()。 */
function toGlow(value) {
  if (!value) return DEFAULT_GLOW;
  const s = String(value).trim();
  if (s.startsWith('rgb')) return s;
  const parts = s.split(/[\s,]+/).map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 0.35)`;
  }
  return DEFAULT_GLOW;
}

/**
 * 生成一组 CSS 自定义属性，挂到任意容器的 style 上，
 * 站点里所有 .glass / .card-hover / .text-glow 就会自动跟着变色。
 */
export function themeVars(theme) {
  if (!theme) return {};
  return {
    '--c-primary': theme.primaryColor || theme.primary || '#7dd3fc',
    '--c-accent': theme.accentColor || theme.accent || '#a78bfa',
    '--c-glow': toGlow(theme.glow),
  };
}

export const rarityStars = (n) => '★'.repeat(n || 0);

/** 稀有度 → 卡片金框强度。 */
export const rarityRing = (n) => (n >= 5 ? 'ring-2' : 'ring-1');
