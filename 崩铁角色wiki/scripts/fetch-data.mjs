/**
 * 崩铁角色 Wiki —— 官方 Wiki 数据抓取脚本
 *
 * 数据源：bbs.mihoyo.com/sr/wiki （官方 Wiki 静态 API）
 *   - 角色列表: /sr_wiki/v1/home/content/list?channel_id=18
 *   - 角色详情: /sr_wiki/v1/content/info?content_id=<id>
 *
 * 详情页正文位于 content.rpg_new_tmp_content.modules[]，每个 module 有
 *   { id, name, components[ { componentId, data(JSON 字符串) } ] }
 *
 * 保留的 module：
 *   11 角色信息   character_info      → 阵营 / 实装日期
 *   19 角色故事   character_story     → 简介 + 故事段落（含解锁条件）
 *   21 角色关系   character_relation  → 官方人物关系（部分角色有）
 *
 * 明确剔除（用户要求：去掉强度相关）：
 *   12 角色晋阶 / 13 角色行迹 / 14 角色星魂 / 15 光锥推荐 /
 *   16 遗器推荐 / 17 配队推荐 / 18 角色攻略推荐 / 20 角色语音 / 23 角色考据
 *
 * 产出：
 *   scripts/raw/character-index.json   角色索引
 *   scripts/raw/characters-raw.json    规范化角色原始数据
 *   public/avatars/<id>.png            角色头像
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW_DIR = path.join(__dirname, 'raw')
const AVATAR_DIR = path.join(ROOT, 'public', 'avatars')

const API = 'https://act-api-takumi-static.mihoyo.com/common/blackboard/sr_wiki/v1'
const CHANNEL_CHARACTER = 18
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** 保留 / 剔除的 module name（用于统计与自检） */
const KEEP_MODULES = ['角色信息', '角色故事', '角色关系']
const DROP_MODULES = [
  '角色晋阶',
  '角色行迹',
  '角色星魂',
  '光锥推荐',
  '遗器推荐',
  '配队推荐',
  '角色攻略推荐',
  '角色语音',
  '角色考据',
  '角色解析',
  '角色画廊',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (i === tries - 1) throw err
      await sleep(600 * (i + 1))
    }
  }
}

/** 安全解析「JSON 字符串」字段（官方 API 大量双层编码） */
function parseMaybeJSON(value) {
  if (value == null) return null
  if (typeof value !== 'string') return value
  const s = value.trim()
  if (!s || (s[0] !== '{' && s[0] !== '[')) return value
  try {
    return JSON.parse(s)
  } catch {
    return value
  }
}

/**
 * 规范化世界观文本：
 *   - 把字面量 `\n`（源码里的 \\n）还原成真正的换行
 *   - 统一全角空格 / 去掉首尾空白
 *   - 保留 <i>…</i> 斜体标记（渲染层会转成 <em>，用于内心独白）
 */
function normalizeText(input) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\u3000/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

/** module 的 components[0].data 解析成对象 */
function moduleData(mod) {
  const comp = Array.isArray(mod?.components) ? mod.components[0] : null
  if (!comp) return null
  return parseMaybeJSON(comp.data)
}

/** 从 ext.c_18.filter.text 取 属性 / 命途 / 星级 */
function parseFilters(extRaw) {
  const ext = parseMaybeJSON(extRaw)
  const arr = parseMaybeJSON(ext?.c_18?.filter?.text)
  const out = { element: null, path: null, rarity: null, tags: [] }
  if (!Array.isArray(arr)) return out
  for (const item of arr) {
    if (typeof item !== 'string') continue
    out.tags.push(item)
    const [kind, val] = item.split('/')
    if (kind === '属性') out.element = val
    else if (kind === '命途') out.path = val
    else if (kind === '星级') out.rarity = val
  }
  return out
}

/** 11 角色信息 → { faction, releaseDate } */
function extractInfo(data) {
  const out = { faction: '', releaseDate: '' }
  const list = Array.isArray(data?.list) ? data.list : []
  for (const row of list) {
    const key = String(row?.rightKey ?? row?.textMapMeta?.rightKey?.data ?? '').trim()
    const value = String(row?.rightValue ?? row?.textMapMeta?.rightValue?.data ?? '').trim()
    if (!key) continue
    if (key === '阵营') out.faction = value
    else if (key === '实装日期') out.releaseDate = value
  }
  return out
}

/** 19 角色故事 → { intro, stories[] } */
function extractStory(data) {
  const out = { intro: '', stories: [] }
  if (!data || typeof data !== 'object') return out

  const detail = data?.textMapMeta?.detail?.data
  if (typeof detail === 'string') out.intro = normalizeText(detail)

  const list = Array.isArray(data.list) ? data.list : []
  for (const entry of list) {
    const text = entry?.desc ?? entry?.textMapMeta?.desc?.data
    if (typeof text !== 'string' || !text.trim()) continue
    const title = entry?.tabName ?? entry?.textMapMeta?.tabName?.data ?? ''
    const unlock = entry?.append ?? entry?.textMapMeta?.append?.data ?? ''
    out.stories.push({
      title: String(title).trim(),
      unlock: String(unlock).trim(),
      text: normalizeText(text),
    })
  }
  return out
}

/** 21 角色关系 → [{ name, icon, relation, desc }] （部分角色为空） */
function extractRelations(data) {
  const rows = []
  const list = Array.isArray(data?.list) ? data.list : []
  for (const tab of list) {
    const table = Array.isArray(tab?.table) ? tab.table : []
    for (const row of table) {
      const name = String(row?.role?.title ?? '').trim()
      const relation = String(row?.relation ?? row?.textMapMeta?.relation?.data ?? '').trim()
      if (!name && !relation) continue
      rows.push({
        name,
        icon: String(row?.role?.icon ?? '').trim(),
        relation,
        desc: normalizeText(row?.desc ?? row?.textMapMeta?.desc?.data ?? ''),
      })
    }
  }
  return rows
}

/** 遍历 modules，分类提取 + 记录被剔除的模块 */
function parseModules(modulesRaw) {
  const rpg = parseMaybeJSON(modulesRaw)
  const modules = Array.isArray(rpg?.modules) ? rpg.modules : []
  const result = {
    faction: '',
    releaseDate: '',
    intro: '',
    stories: [],
    relations: [],
    keptModules: [],
    droppedModules: [],
  }
  for (const mod of modules) {
    const name = String(mod?.name ?? '').trim()
    const data = moduleData(mod)
    if (name === '角色信息') {
      const info = extractInfo(data)
      result.faction = info.faction
      result.releaseDate = info.releaseDate
      result.keptModules.push(name)
    } else if (name === '角色故事') {
      const story = extractStory(data)
      result.intro = story.intro
      result.stories = story.stories
      result.keptModules.push(name)
    } else if (name === '角色关系') {
      result.relations = extractRelations(data)
      result.keptModules.push(name)
    } else if (DROP_MODULES.includes(name)) {
      result.droppedModules.push(name)
    } else if (name) {
      result.droppedModules.push(name)
    }
  }
  return result
}

async function downloadAvatar(url, id) {
  if (!url) return null
  const dest = path.join(AVATAR_DIR, `${id}.png`)
  try {
    await fs.access(dest)
    return `${id}.png` // 已存在，跳过
  } catch {}
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://bbs.mihoyo.com/' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 200) throw new Error('image too small')
      await fs.writeFile(dest, buf)
      return `${id}.png`
    } catch (err) {
      if (i === 2) {
        console.warn(`  ! 头像下载失败 ${id}: ${err.message}`)
        return null
      }
      await sleep(700 * (i + 1))
    }
  }
}

async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true })
  await fs.mkdir(AVATAR_DIR, { recursive: true })

  console.log('→ 拉取角色索引 (channel 18) ...')
  const indexRes = await getJSON(`${API}/home/content/list?app_sn=sr_wiki&channel_id=${CHANNEL_CHARACTER}`)
  const entries = indexRes?.data?.list?.[0]?.list ?? []
  console.log(`  共 ${entries.length} 个角色条目`)

  const index = entries.map((e) => ({
    id: Number(e.content_id),
    name: String(e.title ?? '').trim(),
    icon: e.icon ?? '',
  }))
  await fs.writeFile(path.join(RAW_DIR, 'character-index.json'), JSON.stringify(index, null, 2), 'utf8')

  const characters = []
  const failures = []
  const CONCURRENCY = 5

  for (let i = 0; i < index.length; i += CONCURRENCY) {
    const batch = index.slice(i, i + CONCURRENCY)
    const settled = await Promise.all(
      batch.map(async (item) => {
        try {
          const info = await getJSON(`${API}/content/info?app_sn=sr_wiki&content_id=${item.id}`)
          const c = info?.data?.content
          if (!c) throw new Error('no content')
          const rpg = parseMaybeJSON(c.rpg_new_tmp_content)
          const userInfo = rpg?.base?.userInfo ?? {}
          const filters = parseFilters(c.ext)
          const parsed = parseModules(c.rpg_new_tmp_content)
          const avatar = await downloadAvatar(item.icon, item.id)
          return {
            id: item.id,
            wikiId: item.id,
            name: String(c.title ?? item.name).trim(),
            summary: String(c.summary ?? '').trim(),
            avatarId: userInfo.avatarId ?? '',
            avatar,
            iconUrl: item.icon,
            element: filters.element,
            path: filters.path,
            rarity: filters.rarity,
            elementId: userInfo.elementId ?? '',
            pathType: userInfo.baseType ?? '',
            rarityNum: userInfo.rarity ?? null,
            tags: filters.tags,
            faction: parsed.faction,
            releaseDate: parsed.releaseDate,
            intro: parsed.intro,
            stories: parsed.stories,
            relations: parsed.relations,
            keptModules: parsed.keptModules,
            droppedModules: parsed.droppedModules,
          }
        } catch (err) {
          failures.push({ id: item.id, name: item.name, error: err.message })
          return null
        }
      })
    )
    characters.push(...settled.filter(Boolean))
    process.stdout.write(`\r  已抓取 ${Math.min(i + CONCURRENCY, index.length)}/${index.length}`)
    await sleep(250)
  }
  console.log('')

  await fs.writeFile(path.join(RAW_DIR, 'characters-raw.json'), JSON.stringify(characters, null, 2), 'utf8')

  const withStory = characters.filter((c) => c.stories.length > 0)
  const withIntro = characters.filter((c) => c.intro).length
  const withRelation = characters.filter((c) => c.relations.length > 0)
  console.log('\n✓ 完成')
  console.log(`  角色总数   : ${characters.length}`)
  console.log(`  含简介     : ${withIntro}`)
  console.log(`  含角色故事 : ${withStory.length}  (共 ${characters.reduce((n, c) => n + c.stories.length, 0)} 段)`)
  console.log(`  含官方关系 : ${withRelation.length}`)

  console.log('\n--- 阵营(地区)分布 ---')
  const byFaction = {}
  for (const c of characters) byFaction[c.faction || '(空)'] = (byFaction[c.faction || '(空)'] ?? 0) + 1
  Object.entries(byFaction)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`))

  if (failures.length) {
    console.log(`\n✗ 失败 ${failures.length} 个:`)
    failures.forEach((f) => console.log(`   ${f.id} ${f.name} — ${f.error}`))
  }
  const empty = characters.filter((c) => c.stories.length === 0)
  if (empty.length) {
    console.log(`\n! 无故事正文 (${empty.length}): ${empty.map((c) => `${c.name}(${c.id})`).join('、')}`)
  }
}

main().catch((err) => {
  console.error('抓取失败:', err)
  process.exit(1)
})
