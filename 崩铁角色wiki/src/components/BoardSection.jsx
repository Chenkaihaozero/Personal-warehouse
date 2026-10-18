import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterCard from './CharacterCard.jsx';
import BoardOrnament from './BoardOrnament.jsx';
import { getFaction, themeVars } from '../lib/data.js';

/** 每个板块的专属排版：标题对齐、网格密度、是否竖排标题。 */
const LAYOUT = {
  express: { align: 'left', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' },
  herta: { align: 'left', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' },
  belobog: { align: 'left', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' },
  xianzhou: { align: 'left', vertical: true, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' },
  penacony: { align: 'center', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' },
  amphoreus: { align: 'center', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' },
  erxiang: { align: 'left', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' },
  fate: { align: 'center', vertical: false, cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' },
};

const COLLAPSE_OVER = 12;

/**
 * 首页的一个板块。
 *
 * 视觉差异由三层叠加：
 *  1. board.theme.pattern → `.tex-*` 纹理（冰棱 / 回纹 / 扇形 / 故障条…）
 *  2. <BoardOrnament/>    → 该地域的地标线稿
 *  3. LAYOUT              → 标题对齐、网格密度、竖排与否
 * 再加上板块内按阵营分组，用阵营自己的徽记色做二级标题。
 */
export default function BoardSection({ board, members }) {
  const layout = LAYOUT[board.id] || LAYOUT.herta;
  const [expanded, setExpanded] = useState(false);
  const collapsed = !expanded && members.length > COLLAPSE_OVER;

  const groups = useMemo(() => {
    const map = new Map();
    for (const c of members) {
      if (!map.has(c.faction)) map.set(c.faction, []);
      map.get(c.faction).push(c);
    }
    return [...map.entries()]
      .map(([fid, list]) => ({ faction: getFaction(fid), list }))
      .sort((a, b) => (a.faction?.order ?? 99) - (b.faction?.order ?? 99));
  }, [members]);

  const multi = groups.length > 1;
  const centered = layout.align === 'center';

  return (
    <section
      id={board.id}
      style={themeVars(board.theme)}
      className={`relative scroll-mt-20 border-t border-white/5 py-14 ${board.theme.pattern}`}
      aria-labelledby={`board-${board.id}`}
    >
      {/* 板块主色分隔线 */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--c-primary), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5">
        <div
          className={`flex flex-col gap-6 ${
            centered ? 'items-center text-center' : 'md:flex-row md:items-start md:justify-between'
          }`}
        >
          <div className={`flex items-start gap-4 ${layout.vertical ? 'md:gap-5' : ''}`}>
            <span
              className="title-display select-none text-5xl font-bold leading-none opacity-30"
              style={{ color: 'var(--c-primary)' }}
              aria-hidden="true"
            >
              {String(board.order).padStart(2, '0')}
            </span>

            <div className={layout.vertical ? 'md:[writing-mode:vertical-rl]' : ''}>
              <h2
                id={`board-${board.id}`}
                className="title-display text-3xl font-semibold text-slate-50 md:text-4xl"
                style={{ textShadow: '0 0 26px var(--c-glow)' }}
              >
                {board.name}
              </h2>
              {layout.vertical ? null : (
                <p className="mt-1 text-[11px] tracking-[0.3em] text-slate-500">{board.nameEn}</p>
              )}
            </div>

            <span
              className={`mt-1 shrink-0 rounded-full border px-2 py-[2px] text-[10px] ${
                board.kind === 'region' ? 'text-slate-300' : 'text-slate-400'
              }`}
              style={{ borderColor: 'var(--c-primary)' }}
            >
              {board.kind === 'region' ? '地域' : '阵营线'}
            </span>
          </div>

          <div className={centered ? 'max-w-3xl' : 'max-w-2xl md:text-right'}>
            <p className="text-sm leading-relaxed text-slate-300">{board.description}</p>
            <p className="mt-2 text-xs italic text-slate-500" style={{ color: 'var(--c-accent)' }}>
              {board.theme.tagline}
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              {members.length} 位角色
              {multi ? ` · ${groups.length} 个阵营` : ''} · 依出场顺序排列
            </p>
          </div>
        </div>

        <div className={`mt-6 text-[var(--c-primary)] ${centered ? 'mx-auto max-w-2xl' : 'max-w-3xl'}`}>
          <BoardOrnament boardId={board.id} />
        </div>

        <div className="mt-8 space-y-9">
          {groups.map(({ faction, list }) => {
            const shown = collapsed ? list.slice(0, Math.max(4, Math.floor(COLLAPSE_OVER / groups.length))) : list;
            return (
              <div key={faction?.id || 'none'}>
                {multi && faction ? (
                  <div className="mb-3 flex items-center gap-2">
                    <Link
                      to={`/faction/${faction.id}`}
                      className="group flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors"
                      style={{ borderColor: `${faction.color}66` }}
                      title={`查看「${faction.name}」阵营专栏`}
                    >
                      <span className="text-sm leading-none" style={{ color: faction.color }} aria-hidden="true">
                        {faction.crest}
                      </span>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {faction.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{list.length}</span>
                    </Link>
                    <span
                      className="h-px flex-1"
                      style={{ background: `linear-gradient(90deg, ${faction.color}55, transparent)` }}
                      aria-hidden="true"
                    />
                  </div>
                ) : null}

                <div className={`grid gap-3 ${layout.cols}`}>
                  {shown.map((c) => (
                    <CharacterCard key={c.id} char={c} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {members.length > COLLAPSE_OVER ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="glass rounded-full border border-white/15 px-5 py-2 text-xs text-slate-300 transition-colors hover:border-[var(--c-primary)] hover:text-white"
            >
              {expanded ? '收起' : `展开全部 ${members.length} 位角色`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
