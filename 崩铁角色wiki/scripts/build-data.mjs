/**
 * build-data.mjs — 把 scripts/raw/characters-raw.json + scripts/curation.mjs
 * 编译成前端直接消费的 src/data/**。
 *
 * 运行： npm run build:data
 *
 * 设计原则：任何一条不满足的断言都直接 exit 1，绝不生成半成品数据。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './curation.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const RAW_FILE = path.join(ROOT, 'scripts/raw/characters-raw.json');
const DATA_DIR = path.join(ROOT, 'src/data');
const CHAR_DIR = path.join(DATA_DIR, 'characters');
const AVATAR_DIR = path.join(ROOT, 'public/avatars');

const problems = [];
const warn = (msg) => problems.push(msg);

/* ================================================================== *
 * 工具
 * ================================================================== */

/** 名称归一化：两种中点统一成 U+2022，去掉空白。 */
const key = (s) => String(s || '').replace(/[·・‧]/g, '•').replace(/\s+/g, '').trim();

const stripTags = (s) =>
  String(s || '')
    .replace(/<\/?(i|b|s|em|strong|align|color|size)[^>]*>/gi, '')
    .replace(/\{NICKNAME\}/g, '开拓者');

/** 正文归一化：把抓取时留下的字面量 \n 还原成真换行，压掉多余空行。 */
function normalizeText(s) {
  return String(s || '')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t\u3000]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseReleaseDate(raw) {
  if (!raw) return null;
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(String(raw).trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const t = Date.UTC(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(t) ? null : { iso: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`, ms: t };
}

function fileSlug(name) {
  return name.replace(/[\\/:*?"<>|&]/g, '').replace(/\s+/g, '_');
}

/** 简介首句 → 角色标语（官方没有「称号」字段，只能派生）。 */
function inferTitle(intro, name) {
  const flat = stripTags(intro).replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!flat) return `${name} · 星穹列车的同行者`;
  let t = flat.split(/[。！？!?]/)[0].trim();
  if (!t) t = flat;
  if (t.length > 40) t = t.slice(0, 40).trim();
  return t || name;
}

/** 官方 content.summary 形如「角色-三月七（冰三月七、存护三月七）」→ 括号内为别名。 */
function parseAliases(summary) {
  const m = /[（(]([^）)]+)[）)]/.exec(String(summary || ''));
  if (!m) return [];
  return m[1]
    .split(/[、,，/]/)
    .map((s) => s.trim())
    .filter((s) => s && s !== '角色');
}

/* ================================================================== *
 * 1. 读原始数据并去重
 * ================================================================== */

const raw = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
const byName = new Map();
const duplicates = [];
for (const item of raw) {
  if (byName.has(item.name)) {
    duplicates.push(`${item.name}(保留 ${byName.get(item.name).id}，丢弃 ${item.id})`);
    continue;
  }
  byName.set(item.name, item);
}
const baseChars = [...byName.values()];

const allNames = baseChars.map((c) => c.name);
const byKey = new Map(allNames.map((n) => [key(n), n]));

/* ================================================================== *
 * 2. 实装/出场顺序（发布日期缺失时用 content_id 就近插值）
 * ================================================================== */

const dated = [];
for (const c of baseChars) {
  const p = parseReleaseDate(c.releaseDate);
  if (p) dated.push({ cid: c.id, ms: p.ms, iso: p.iso, name: c.name });
}
dated.sort((a, b) => a.ms - b.ms);
const byCid = [...dated].sort((a, b) => a.cid - b.cid);

function orderFor(char) {
  const own = parseReleaseDate(char.releaseDate);
  if (own) return { ms: own.ms, iso: own.iso, estimated: false };
  const prev = [...byCid].reverse().find((d) => d.cid <= char.id);
  const next = byCid.find((d) => d.cid > char.id);
  const anchor = prev || next;
  if (!anchor) return { ms: 0, iso: null, estimated: true };
  return { ms: anchor.ms, iso: anchor.iso, estimated: true };
}

/* ================================================================== *
 * 3. 关系类型与方向
 * ================================================================== */

const TYPE_PRIORITY = { family: 5, enemy: 4, mentor: 3, superior: 2, ally: 1 };

function classify(text, overrideKey, official) {
  if (C.RELATION_TYPE_OVERRIDES[overrideKey]) return C.RELATION_TYPE_OVERRIDES[overrideKey];
  const t = String(text || '');
  if (C.AMBIGUOUS_AS_ALLY.test(t)) return 'ally';
  for (const rule of C.RELATION_TYPE_RULES) {
    if (rule.re.test(t)) return rule.type;
  }
  return official ? 'ally' : 'ally';
}

function directionOf(type, text, overrideKey, curated, seedKey) {
  if (type === 'family' || type === 'ally') return 'none';
  if (type === 'enemy') return 'both';
  const override = C.RELATION_DIRECTION_OVERRIDE ? C.RELATION_DIRECTION_OVERRIDE[overrideKey] : null;
  if (override) return override;
  if (curated) return C.SEED_DIR[seedKey] || C.SEED_DIR_DEFAULT;
  const t = String(text || '');
  if (C.SENIOR_ROLE.test(t)) return 't2s';
  if (C.JUNIOR_ROLE.test(t)) return 's2t';
  return 't2s'; // 官方文案默认是从「来源」视角描述对方，故对方为长辈
}

/* ================================================================== *
 * 4. 关系名 → 名册名
 * ================================================================== */

const unresolved = new Set();

function resolveName(rawName) {
  const r = String(rawName || '').trim();
  if (!r) return null;
  if (byKey.has(key(r))) return byKey.get(key(r));
  if (C.ALIAS_TO_NAME[r]) return C.ALIAS_TO_NAME[r];
  const k = key(r);
  const cands = allNames.filter((n) => key(n).startsWith(k));
  if (cands.length === 1) return cands[0];
  unresolved.add(r);
  return null;
}

/* ================================================================== *
 * 5. 建角色对象
 * ================================================================== */

const boardById = new Map(C.BOARDS.map((b) => [b.id, b]));
const factionById = new Map(C.FACTIONS.map((f) => [f.id, f]));

function factionOf(char) {
  if (C.FACTION_OVERRIDE[char.name]) {
    return { faction: C.FACTION_OVERRIDE[char.name], affiliation: char.faction || null, subFaction: null };
  }
  const officialFaction = (char.faction || '').trim();
  for (const rule of C.FACTION_RULES) {
    if (rule.match.includes(officialFaction)) {
      const sub = officialFaction.startsWith('仙舟') ? officialFaction : null;
      return { faction: rule.faction, affiliation: officialFaction || null, subFaction: sub };
    }
  }
  if (officialFaction) {
    const direct = C.FACTIONS.find((f) => f.name === officialFaction);
    if (direct) return { faction: direct.id, affiliation: officialFaction, subFaction: null };
  }
  return { faction: null, affiliation: officialFaction || null, subFaction: null };
}

const characters = baseChars.map((src) => {
  const boardId = C.BOARD_OF[src.name];
  const board = boardById.get(boardId);
  if (!board) throw new Error(`curation.BOARD_OF 缺少「${src.name}」的板块归属`);

  const factionInfo = factionOf(src);
  const factionId = factionInfo.faction || C.FACTION_FALLBACK_BY_BOARD[boardId] || null;
  const faction = factionById.get(factionId);
  if (!faction) throw new Error(`「${src.name}」解析不出阵营（官方值：${src.faction || '(空)'}）`);

  const el = C.ELEMENT_THEME[src.element] || { primary: board.theme.primary, accent: board.theme.accent };
  const pathTheme = C.PATH_THEME[src.path] || { pattern: C.DEFAULT_PATTERN };

  const order = orderFor(src);
  const rarityNum = C.RARITY_FIX[src.name] || src.rarityNum || 4;

  const intro = normalizeText(src.intro);
  const stories = (src.stories || [])
    .map((s) => ({
      title: normalizeText(s.title),
      unlock: normalizeText(s.unlock),
      text: normalizeText(s.text),
    }))
    .filter((s) => s.text);

  return {
    id: src.id,
    name: src.name,
    nameEn: C.NAME_EN[src.name] || null,
    title: inferTitle(intro, src.name),
    aliases: parseAliases(src.summary),
    rarity: `${rarityNum}星`,
    rarityNum,
    element: src.element || null,
    path: src.path || null,
    board: boardId,
    boardName: board.name,
    region: boardId, // 用户 schema 里的 region 字段
    faction: faction.id,
    factionName: faction.name,
    affiliation: factionInfo.affiliation,
    subFaction: factionInfo.subFaction,
    avatar: `/avatars/${src.id}.png`,
    intro,
    stories,
    theme: {
      primaryColor: el.primary,
      accentColor: C.CHARACTER_ACCENT_OVERRIDE[src.name] || el.accent,
      backgroundStyle: board.theme.pattern,
      pattern: pathTheme.pattern,
      glow: `45 212 191`, // 占位，下面覆盖
    },
    tags: src.tags || [],
    releaseDate: src.releaseDate || null,
    orderDate: order.iso,
    orderDateEstimated: order.estimated,
    _orderMs: order.ms,
    variantOf: C.VARIANT_OF[src.name] ? (byKey.get(key(C.VARIANT_OF[src.name])) || null) : null,
  };
});

// glow 用角色主色生成，方便 CSS 直接消费
for (const c of characters) {
  const hex = c.theme.primaryColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  c.theme.glow = `${r} ${g} ${b}`;
}

const charByName = new Map(characters.map((c) => [c.name, c]));
const charById = new Map(characters.map((c) => [c.id, c]));

/* ================================================================== *
 * 6. 关系图
 * ================================================================== */

/** 把变体折叠到基础角色 */
function fold(nameOrId) {
  const c = charById.get(nameOrId) || charByName.get(nameOrId);
  if (!c) return null;
  return c.variantOf || c.name;
}

const edgeMap = new Map();
let officialEdges = 0;
let curatedEdges = 0;

function addEdge({ from, to, rel, explicitType, note, curated }) {
  const a = fold(from);
  const b = fold(to);
  if (!a || !b || a === b) return;

  const sortedKey = [a, b].sort().join('|');
  const type = explicitType || classify(rel, `${from}→${to}`, !curated);
  const dir = directionOf(type, rel, `${from}→${to}`, !!curated, `${from}|${to}`);

  const incoming = { a, b, rel: rel || '', note: note || '', type, dir, curated: !!curated };
  const existing = edgeMap.get(sortedKey);
  if (!existing) {
    edgeMap.set(sortedKey, { people: [a, b], variants: [incoming] });
    if (curated) curatedEdges++;
    else officialEdges++;
    return;
  }
  existing.variants.push(incoming);
}

// 官方关系（走原始条目，因为角色对象本身不保留 relations 字段）
for (const src of baseChars) {
  for (const r of src.relations || []) {
    const rel = normalizeText(r.relation);
    if (!rel || rel === '待更新') continue;
    const target = resolveName(r.name);
    if (!target) continue;
    addEdge({ from: src.name, to: target, rel, note: normalizeText(r.desc), curated: false });
  }
}

// 策展关系
for (const s of C.RELATION_SEED) {
  const a = resolveName(s.s);
  const b = resolveName(s.t);
  if (!a) warn(`RELATION_SEED 的来源「${s.s}」不在名册里`);
  if (!b) warn(`RELATION_SEED 的目标「${s.t}」不在名册里`);
  if (!a || !b) continue;
  addEdge({ from: a, to: b, rel: s.rel, explicitType: s.type, note: s.note, curated: true });
}

// 外部（未实装）节点
const externalById = new Map(C.EXTERNAL_NODES.map((n) => [n.id, n]));
for (const l of C.EXTERNAL_LINKS) {
  const ext = externalById.get(l.s);
  if (!ext) {
    warn(`EXTERNAL_LINKS 引用了未声明的外部节点「${l.s}」`);
    continue;
  }
  const target = resolveName(l.t);
  if (!target) {
    warn(`EXTERNAL_LINKS 的目标「${l.t}」不在名册里`);
    continue;
  }
  const a = ext.name;
  const b = fold(target);
  if (!a || !b || a === b) continue;
  const sortedKey = [a, b].sort().join('|');
  const incoming = { a, b, rel: l.rel, note: l.note, type: l.type, dir: l.dir || (l.type === 'family' || l.type === 'ally' ? 'none' : l.type === 'enemy' ? 'both' : 's2t'), curated: true, external: a };
  const existing = edgeMap.get(sortedKey);
  if (existing) existing.variants.push(incoming);
  else edgeMap.set(sortedKey, { people: [a, b], variants: [incoming] });
}

/* 汇总成最终 links */
const links = [];
const degree = new Map();
for (const { people, variants } of edgeMap.values()) {
  const [a, b] = people;
  // 主变体：类型优先级最高，其次策展优先
  const best = [...variants].sort((x, y) => {
    const d = (TYPE_PRIORITY[y.type] || 0) - (TYPE_PRIORITY[x.type] || 0);
    if (d !== 0) return d;
    return (y.curated ? 1 : 0) - (x.curated ? 1 : 0);
  })[0];

  // 方向：优先保留有方向的写法
  const dirs = new Set(variants.map((v) => v.dir));
  let dir = best.dir;
  if (dirs.has('both')) dir = 'both';
  else if (dirs.size > 1) dir = best.dir;

  const link = {
    source: a,
    target: b,
    relation: best.rel,
    type: best.type,
    dir,
    arrow:
      dir === 'none' ? 'none'
      : dir === 'both' ? 'both'
      : dir === 's2t' ? `${a}→${b}`
      : `${b}→${a}`,
    from: dir === 'none' ? null : dir === 'both' ? null : dir === 's2t' ? a : b,
    to: dir === 'none' ? null : dir === 'both' ? null : dir === 's2t' ? b : a,
    notes: [...new Set(variants.map((v) => (v.note ? `${v.rel}：${v.note}` : v.rel)).filter(Boolean))],
    origins: [...new Set(variants.map((v) => (v.curated ? 'curated' : 'official')))],
  };
  links.push(link);
  degree.set(a, (degree.get(a) || 0) + 1);
  degree.set(b, (degree.get(b) || 0) + 1);
}

/* 节点：94 位角色里被折叠掉的变体不出节点，加上有连线的外部节点 */
const foldedAway = new Set();
for (const c of characters) {
  if (c.variantOf) foldedAway.add(c.name);
}
const nodeNames = new Set();
for (const l of links) {
  nodeNames.add(l.source);
  nodeNames.add(l.target);
}
for (const c of characters) {
  if (!c.variantOf) nodeNames.add(c.name);
}

const nodes = [...nodeNames].map((n) => {
  const ext = [...externalById.values()].find((e) => e.name === n);
  if (ext) {
    const f = factionById.get(ext.faction);
    return {
      id: ext.id,
      name: ext.name,
      avatar: null,
      external: true,
      reason: ext.reason,
      faction: ext.faction,
      factionName: f ? f.name : null,
      factionColor: f ? f.color : '#94a3b8',
      element: null,
      board: null,
      degree: degree.get(n) || 0,
    };
  }
  const c = charByName.get(n);
  const f = factionById.get(c.faction);
  const b = boardById.get(c.board);
  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    external: false,
    // 角色节点默认没有 reason；个别角色（如「星神★阿哈」）在 curation 里补一句说明。
    reason: (C.CHARACTER_REASON || {})[n] || null,
    faction: c.faction,
    factionName: c.factionName,
    factionColor: f.color,
    element: c.element,
    board: c.board,
    boardName: b.name,
    degree: degree.get(n) || 0,
  };
});

/* ================================================================== *
 * 7. 板块 / 阵营 / 搜索索引
 * ================================================================== */

const boardOrderKey = new Map(characters.map((c) => [c.name, c._orderMs]));

const regions = C.BOARDS.map((b) => {
  const members = characters
    .filter((c) => c.board === b.id)
    .sort((x, y) => boardOrderKey.get(x.name) - boardOrderKey.get(y.name) || key(x.name).localeCompare(key(y.name)))
    .map((c) => c.id);
  return {
    id: b.id,
    name: b.name,
    nameEn: b.nameEn,
    kind: b.kind,
    order: b.order,
    description: b.description,
    theme: b.theme,
    characters: members,
  };
}).sort((a, b) => a.order - b.order);

const factions = C.FACTIONS.map((f) => ({
  id: f.id,
  name: f.name,
  nameEn: f.nameEn,
  color: f.color,
  crest: f.crest,
  blurb: f.blurb,
  order: f.order,
  boardId: f.boardId,
  boardName: boardById.get(f.boardId) ? boardById.get(f.boardId).name : null,
  members: characters
    .filter((c) => c.faction === f.id)
    .sort((x, y) => boardOrderKey.get(x.name) - boardOrderKey.get(y.name) || key(x.name).localeCompare(key(y.name)))
    .map((c) => c.id),
}));

const lightChar = (c) => ({
  id: c.id,
  name: c.name,
  nameEn: c.nameEn,
  title: c.title,
  aliases: c.aliases,
  rarity: c.rarity,
  rarityNum: c.rarityNum,
  element: c.element,
  path: c.path,
  board: c.board,
  boardName: c.boardName,
  faction: c.faction,
  factionName: c.factionName,
  avatar: c.avatar,
  theme: c.theme,
  releaseDate: c.releaseDate,
  orderDate: c.orderDate,
  variantOf: c.variantOf,
});

const index = characters
  .slice()
  .sort((x, y) => x._orderMs - y._orderMs || key(x.name).localeCompare(key(y.name)))
  .map(lightChar);

const searchIndex = characters.map((c) => ({
  id: c.id,
  name: c.name,
  nameEn: c.nameEn,
  aliases: c.aliases,
  title: c.title,
  intro: c.intro.replace(/\s+/g, ' ').slice(0, 400),
  faction: c.faction,
  factionName: c.factionName,
  board: c.board,
  boardName: c.boardName,
  path: c.path,
  element: c.element,
  avatar: c.avatar,
  theme: c.theme,
}));

/* ================================================================== *
 * 8. 断言
 * ================================================================== */

const assert = (cond, msg) => {
  if (!cond) problems.push(`断言失败：${msg}`);
};

assert(characters.length === 94, `角色数应为 94，实际 ${characters.length}`);
assert(new Set(characters.map((c) => c.id)).size === characters.length, 'id 存在重复');

for (const b of C.BOARDS) {
  const n = characters.filter((c) => c.board === b.id).length;
  assert(n > 0, `板块「${b.name}」没有成员`);
  if (b.kind === 'region') assert(n >= 5, `地域板块「${b.name}」成员过少（${n}）`);
}
assert(characters.filter((c) => c.board === 'fate').length === 4, 'Fate 联动线应恰为 4 人');

for (const c of characters) {
  assert(!c.faction || factionById.has(c.faction), `「${c.name}」的阵营 ${c.faction} 不在 factions 列表里`);
  assert(fs.existsSync(path.join(AVATAR_DIR, `${c.id}.png`)), `缺少头像 public/avatars/${c.id}.png`);
  assert(c.stories.length > 0 || c.name === '椒丘', `「${c.name}」没有角色故事`);
}

const nodeNamesAll = new Set(nodes.map((n) => n.name));
for (const l of links) {
  assert(nodeNamesAll.has(l.source), `关系边端點 ${l.source} 不在节点集里`);
  assert(nodeNamesAll.has(l.target), `关系边端點 ${l.target} 不在节点集里`);
  assert(['family', 'ally', 'superior', 'enemy', 'mentor'].includes(l.type), `未知关系类型 ${l.type}`);
}

assert(new Set(nodes.map((n) => n.id)).size === nodes.length, '节点 id 重复');

if (problems.length) {
  console.error('\n构建失败：\n' + problems.map((p) => '  • ' + p).join('\n'));
  process.exit(1);
}

/* ================================================================== *
 * 9. 写盘
 * ================================================================== */

fs.mkdirSync(CHAR_DIR, { recursive: true });
for (const old of fs.readdirSync(CHAR_DIR)) {
  if (old.endsWith('.json')) fs.unlinkSync(path.join(CHAR_DIR, old));
}

const fileOf = new Map();
for (const c of characters) {
  const file = `${c.id}-${fileSlug(c.name)}.json`;
  fileOf.set(c.id, file);
  const { _orderMs, ...clean } = c;
  fs.writeFileSync(path.join(CHAR_DIR, file), JSON.stringify(clean, null, 2) + '\n', 'utf8');
}

const indexWithFile = index.map((c) => ({ ...c, file: fileOf.get(c.id) }));
fs.writeFileSync(path.join(DATA_DIR, 'characters/index.json'), JSON.stringify(indexWithFile, null, 1) + '\n', 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'relations.json'), JSON.stringify({ nodes, links }, null, 1) + '\n', 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'regions.json'), JSON.stringify(regions, null, 1) + '\n', 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'factions.json'), JSON.stringify(factions, null, 1) + '\n', 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 0) + '\n', 'utf8');

/* ================================================================== *
 * 10. 报告
 * ================================================================== */

const byType = links.reduce((m, l) => ((m[l.type] = (m[l.type] || 0) + 1), m), {});
console.log('\n=== 崩铁角色 Wiki 数据构建完成 ===\n');
console.log(`角色        ${characters.length}  （去重丢弃 ${duplicates.length} 条）`);
console.log(`角色故事    ${characters.reduce((n, c) => n + c.stories.length, 0)} 段`);
console.log(`板块        ${regions.length}  →  ` + regions.map((r) => `${r.name} ${r.characters.length}`).join(' / '));
console.log(`阵营        ${factions.length}`);
console.log(`关系节点    ${nodes.length}  （其中未实装人影节点 ${nodes.filter((n) => n.external).length}）`);
console.log(`关系边      ${links.length}  官方 ${officialEdges} / 策展 ${curatedEdges}`);
console.log(`关系类型    ` + Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(' / '));
console.log(`方向分布    ` + Object.entries(links.reduce((m, l) => ((m[l.dir] = (m[l.dir] || 0) + 1), m), {})).map(([k, v]) => `${k} ${v}`).join(' / '));
console.log(`折叠变体    ${[...foldedAway].join('、')}`);
if (unresolved.size) console.log(`未匹配人名  ${[...unresolved].join('、')}`);
console.log('');
