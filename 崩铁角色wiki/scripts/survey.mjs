import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw', 'characters-raw.json'), 'utf8'))

console.log(`总计 ${data.length} 个角色\n`)

console.log('== 阵营为空的角色 ==')
data
  .filter((c) => !c.faction)
  .forEach((c) => {
    const intro = String(c.intro || '').replace(/\n/g, ' ').slice(0, 56)
    console.log(`  id=${String(c.id).padStart(5)}  ${c.name.padEnd(12)} ${intro}`)
  })

console.log('\n== 有官方角色关系的角色 ==')
data
  .filter((c) => c.relations.length)
  .forEach((c) => {
    console.log(`  ${c.name} (${c.relations.length})`)
    c.relations.forEach((r) => console.log(`      → ${r.name || '(无名)'}  [${r.relation}]`))
  })

console.log('\n== 无故事的角色 ==')
data.filter((c) => !c.stories.length).forEach((c) => console.log(`  id=${c.id} ${c.name}`))

console.log('\n== 全量清单 ==')
data.forEach((c) => {
  console.log(
    `${String(c.id).padStart(5)} | ${c.name.padEnd(14)} | ${String(c.faction).padEnd(14)} | ${
      c.rarity || '-'
    } | ${String(c.element || '-').padEnd(3)} | ${String(c.path || '-').padEnd(4)} | 故事${String(c.stories.length).padStart(2)} | 关系${c.relations.length}`
  )
})
