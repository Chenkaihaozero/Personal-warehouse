import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import FactionRail from '../components/FactionRail.jsx';
import BoardSection from '../components/BoardSection.jsx';
import { characters, regions, factions, relations, boardMembers } from '../lib/data.js';

const STATS = [
  { key: 'characters', label: '收录角色', value: characters.length, unit: '位' },
  { key: 'regions', label: '剧情板块', value: regions.length, unit: '个' },
  { key: 'factions', label: '阵营', value: factions.length, unit: '个' },
  { key: 'relations', label: '人物关系', value: relations.links.length, unit: '条' },
];

export default function Home({ onOpenSearch }) {
  const [params, setParams] = useSearchParams();
  const target = params.get('board');

  // 搜索面板点板块结果 → /?board=xxx → 平滑滚到该板块
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setParams({}, { replace: true });
    }
  }, [target, setParams]);

  const sections = useMemo(
    () => regions.map((r) => ({ board: r, members: boardMembers(r.id) })),
    [],
  );

  return (
    <div>
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-16 md:pt-24">
        <div className="stagger">
          <p className="eyebrow rise">ASTRAL ARCHIVE · 崩坏：星穹铁道</p>

          <h1 className="title-display rise mt-3 text-4xl font-bold leading-tight text-slate-50 md:text-6xl">
            崩铁角色 <span className="text-glow" style={{ color: 'var(--c-primary)' }}>Wiki</span>
          </h1>

          <p className="rise mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            沿着银轨把故事重新排一遍：从黑塔空间站醒来的那一刻，到贝洛伯格的永冻、
            仙舟的云骑、匹诺康尼的梦、翁法罗斯的逐火，直到二相乐园与来自宇宙之外的旅人。
            <br />
            这里只收录<strong className="font-semibold text-slate-100">角色故事与人物关系</strong>，
            已剔除行迹材料、遗器推荐、星魂提升等一切强度内容。
          </p>

          <div className="rise mt-7">
            <SearchBar onOpenSearch={onOpenSearch} />
          </div>

          <dl className="rise mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.key} className="glass rounded-xl border border-white/10 px-4 py-3">
                <dt className="text-[11px] tracking-wide text-slate-400">{s.label}</dt>
                <dd className="title-display mt-1 text-2xl font-semibold text-slate-100">
                  {s.value}
                  <span className="ml-1 text-xs font-normal text-slate-500">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          {/* 板块速览：颜色即板块气质 */}
          <nav className="rise mt-9 flex flex-wrap gap-2" aria-label="板块速览">
            {regions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => document.getElementById(r.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{ '--c-primary': r.theme.primary }}
                className="glass rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:border-[var(--c-primary)] hover:text-white"
              >
                <span className="mr-1.5 font-mono text-[10px]" style={{ color: r.theme.primary }}>
                  {String(r.order).padStart(2, '0')}
                </span>
                {r.name}
                <span className="ml-1.5 text-slate-500">{r.characters.length}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* --------------------------- 阵营长廊 --------------------------- */}
      <FactionRail />

      {/* --------------------------- 八大板块 --------------------------- */}
      <div className="mt-16">
        {sections.map(({ board, members }) => (
          <BoardSection key={board.id} board={board} members={members} />
        ))}
      </div>

      {/* ----------------------------- 页脚 ----------------------------- */}
      <footer className="relative mt-8 border-t border-white/10 bg-void-900/60 py-10">
        <div className="mx-auto w-full max-w-7xl px-5 text-xs leading-relaxed text-slate-400">
          <p className="text-slate-300">
            数据来源：
            <a
              href="https://bbs.mihoyo.com/sr/wiki/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:text-white"
            >
              米游社 · 崩坏：星穹铁道 Wiki
            </a>
            中的角色条目（简介、角色故事、角色关系、角色信息）。
          </p>
          <p className="mt-2">
            本站<strong className="font-semibold text-slate-300">仅收录角色故事、简介与人物关系</strong>，
            已剔除行迹升级材料、遗器推荐、星魂提升、配队推荐、光锥推荐等全部强度相关内容；亦不收录角色语音。
            头像取自官方 Wiki 托管资源，版权归米哈游所有，本站仅用于剧情梳理与学习交流。
          </p>
          <p className="mt-4 text-slate-500">
            共 {characters.length} 位角色 · {regions.length} 个板块 · {factions.length} 个阵营 ·{' '}
            {relations.links.length} 条人物关系
          </p>
        </div>
      </footer>
    </div>
  );
}
