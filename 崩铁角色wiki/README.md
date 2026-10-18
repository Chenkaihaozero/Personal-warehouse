# 崩铁角色 Wiki · ASTRAL ARCHIVE

一个把《崩坏：星穹铁道》**角色故事**与**人物关系**重新梳理成册的网页端。

**只读故事，不谈强度。** 全站收录角色简介、角色故事、人物关系与阵营归属，
已剔除行迹升级材料、遗器推荐、星魂提升、配队推荐、光锥推荐等一切强度内容，也不收录语音。

---

## 怎么打开（推荐：双击）

**直接双击项目根目录的 `启动网站.bat`。** 它会自己完成这些事：

1. 检查依赖（缺 `node_modules` 时自动用 `pnpm` / `corepack pnpm` / `npm` 装一次）；
2. 从 5173 起找一个空闲端口（如果网站已经在跑，就直接打开浏览器，不会重复启动）；
3. 启动开发服务器，**等到首页真的能打开之后**再自动弹出浏览器；
4. 窗口里会打印确切地址；**关闭这个窗口（或按 Ctrl+C）= 停止网站**。

> 唯一的外部依赖是 Node.js 18 以上（Node 在哪都行，脚本用它直接跑 `node_modules/vite/bin/vite.js`，
> 不经过 `npm run`，因此也绕开了下面那个 npm 的毛病）。

---

## 快速开始（命令行）

```bash
# 依赖安装（推荐 pnpm，见下方「关于 npm install」）
pnpm install

# 启动开发服务器
npm run dev          # → http://localhost:5173
```

其他脚本：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run fetch:data` | 从官方 Wiki 重新抓取原始数据（含头像下载，已存在则跳过） |
| `npm run build:data` | 由原始数据 + 策展表生成 `src/data/**`（带自检断言） |

### 关于 `npm install`

本机（Windows / Node 24）的 **npm 自带的依赖是坏的**，`npm install` 会直接报：

```
npm error Class extends value undefined is not a constructor or null
    at .../npm/node_modules/minipass-flush/index.js:5:21
```

原因：`npm/node_modules/minipass-flush/node_modules/minipass` 残留了旧版 **3.3.6**
（CJS 默认导出），遮蔽了外层可用的 **7.1.3**，而 `minipass-flush@1.0.6` 写的是
`const { Minipass } = require('minipass')`，解构得到 `undefined`。
修复需要写 Node 安装目录下的 `node_modules`（Windows 默认是
`%ProgramFiles%\nodejs\node_modules`），普通权限做不到。

**`npm run` 不加载 cacache，所以完全正常** —— `npm run dev` / `npm run build` 不受影响。
换 `pnpm install` 即可（本仓库即由 pnpm 安装，`node_modules` 与 `pnpm-lock.yaml` 都在）。

---

## 页面与功能

| 路由 | 内容 |
| --- | --- |
| `/` | **首页**：银河背景；顶部全局搜索；八大板块按**出场顺序**纵向排列，每块独立配色与纹理；板块内再按**阵营**分组；横向阵营长廊（17 个阵营）。 |
| `/character/:id` | **角色专栏**：头图用角色主题色 + 该角色所在板块纹理 + 命途纹理；基本信息表、简介、角色故事分页、人物关系列表、同阵营成员、外观变体互链、板块内上/下一位。 |
| `/relations` | **人物关系网络**：ECharts 力导向图，**头像节点 + 方向箭头**，**双击连线**看这条关系的详情卡（字号加倍），按阵营与关系类型筛选、关键词聚焦、只看一度关系；下接关系枢纽、阵营分布、关系速查表。 |
| `/faction/:id` | **阵营专栏**：徽记、阵营底色、成员网格、阵营内部关系。 |
| `Ctrl + K` | 全局搜索面板（任意页面可用）：角色 / 板块 / 阵营分组结果，支持中文名、官方别名、英文名。 |

---

## 目录结构

```
启动网站.bat               # 双击这个：检查依赖 → 挑端口 → 起服务 → 开浏览器
src/
├── data/
│   ├── characters/        # 每个角色一个 JSON + index.json（轻量索引）
│   ├── relations.json     # 人物关系（节点 + 边 + 箭头方向）
│   ├── regions.json       # 八大板块
│   ├── factions.json      # 十七个阵营
│   └── search-index.json  # 搜索索引（懒加载）
├── lib/data.js            # 唯一数据访问层（取数、关系、主题变量、懒加载）
├── components/            # SearchPalette / RelationGraph / CharacterCard / BoardSection …
├── pages/                 # Home / CharacterPage / RelationPage / FactionPage / NotFound
└── App.jsx
public/avatars/            # 94 张官方头像（本地文件，全站无远程图片外链）
scripts/
├── launch.mjs             # 启动器本体（启动网站.bat 调它）
├── fetch-data.mjs         # 抓取官方 Wiki → scripts/raw/
├── curation.mjs           # 唯一人工策展文件（板块归属、阵营、关系补全、英文名…）
├── build-data.mjs         # raw + curation → src/data/**
├── survey.mjs             # 打印全量清单，方便核对
└── raw/                   # 原始抓取结果（character-index.json / characters-raw.json / roster.txt）
```

---

## 数据来源与取舍

数据来自《崩坏：星穹铁道》官方 Wiki 的静态接口（`bbs.mihoyo.com/sr/wiki/` 背后的
`act-api-takumi-static.mihoyo.com`）：

- **角色列表**：`/common/blackboard/sr_wiki/v1/home/content/list?channel_id=18`
- **角色详情**：`/common/blackboard/sr_wiki/v1/content/info?content_id=<id>`

只取用其中的三个模块 —— `角色信息`（阵营、实装日期）、`角色故事`（简介 + 各段故事）、
`角色关系`（官方人物关系）。其余模块（晋阶 / 行迹 / 星魂 / 光锥推荐 / 遗器推荐 / 配队推荐 /
攻略 / 语音 / 考据 / 解析 / 画廊）一律丢弃，`keptModules` 与 `droppedModules` 会写进原始数据留痕。

头像同样来自官方条目，**与名称同源**，因此不存在「名字配错图」的问题。

### 已知边界

- **椒丘**（`3058`）的官方条目暂无故事正文，角色页会显示占位说明，但仍在板块、阵营与关系网中。
- **22 位角色**（主要是翁法罗斯黄金裔）官方未标注实装日期，首页排序与角色页的
  `≈ 日期（按登场顺序估算）` 由条目编号在已实装角色之间就近估算。
- **立绘未下载**：官方立绘单张约 3.6 MB，94 张会到 360 MB；角色页头图改用大头像 + CSS 光晕与纹理。
- `{NICKNAME}` 在正文中统一渲染为「开拓者」。
- 官方 wiki 里的 `<i>` `<b>` `<s>` `<u>` `<color=…>` `<align=…>` 会被转成安全标签渲染
  （先 HTML 转义再白名单还原，不会执行注入内容）。

---

## 八大板块

按**出场顺序**排列，每块有自己的配色、纹理与版式：

| # | id | 板块 | 主色 | 纹理 |
| --- | --- | --- | --- | --- |
| 00 | `express` | 星穹列车 | 铜金 | 铁轨与车窗 |
| 01 | `herta` | 黑塔空间站 | 冷青 | 六边形舱格 |
| 02 | `belobog` | 贝洛伯格 | 冰银 | 冰棱与雪裂 |
| 03 | `xianzhou` | 仙舟「罗浮」 | 青玉鎏金 | 回纹与灯笼 |
| 04 | `penacony` | 匹诺康尼 | 金红紫罗兰 | 装饰艺术扇形放射 |
| 05 | `amphoreus` | 翁法罗斯 | 圣金 | 十二火种与希腊回纹 |
| 06 | `erxiang` | 二相乐园 | 赛博粉紫 | 故障条与扫描线 |
| 07 | `fate` | Fate 联动线 | 深红金 | 令咒圆阵 |

---

## 关系图的读法

- **节点**：角色头像，圆环取所属阵营底色；官方 Wiki 尚无头像的角色（白珩、艾利欧、钻石等）
  用空心圆 + 黑色人影占位。
- **连线上不印文字**：整张网只靠颜色与线型读类型，几十条关系叠在一起也不会糊成一团。
- **双击一条连线**弹出这条关系的详情卡（关系文字、类型、来源、备注），
  字号是普通提示框的两倍；以前是鼠标一碰线就弹框，太容易误触，所以改成双击。
- **箭头方向**：`长辈 / 上级 → 晚辈 / 下级`；相互敌对为双向箭头；家人与同伴不设方向。
- **线型与颜色**双重编码，避免只靠颜色区分：

| 类型 | 含义 | 颜色 | 线型 | 箭头 |
| --- | --- | --- | --- | --- |
| `family` | 血缘 / 家人 | 玫瑰 | 实线 | 无 |
| `ally` | 同盟 / 同伴 | 青 | 实线 | 无 |
| `superior` | 上下 / 归属 | 金 | 虚线 | 单向 |
| `mentor` | 师生 / 传承 | 紫 | 虚线 | 单向 |
| `enemy` | 敌对 / 冲突 | 红 | 点线 | 双向 |

关系的两个来源会写进每条边的 `origins`：`official`（官方 Wiki 的「角色关系」模块）
与 `curated`（官方缺失时在 `scripts/curation.mjs` 里按剧情补全）。

**布局是 ECharts 的内建力导向**（`layout: 'force'`）。力导向会让同一阵营、同一条故事线上的人
自然聚成一团，读图时的「逻辑感」就来自这个；代价是节点位置由 ECharts 内部决定，
所以头像拖动、滚轮缩放都交给它，连线上的文字也就不印了 —— 只有双击取详情这一条路。
力导向的起始区域在画布四周留了 52 / 46 的余量，但它会把节点继续往外推，
所以最外圈偶尔还是会有头像被画布边缘切掉一点（内建行为）。

---

## 想加人或改设定？

1. **改归属**：编辑 `scripts/curation.mjs`（板块归属 `BOARD_OF`、阵营规则、关系补全、英文名…）。
2. **重新生成**：`npm run build:data`，脚本会跑一整套断言（角色数、板块非空、头像存在、
   关系两端都在节点集、关系类型合法…），不通过就直接报错而不是写出坏数据。
3. **换头像 / 补故事**：`npm run fetch:data` 重新抓取官方数据（已存在的头像会跳过下载）。
