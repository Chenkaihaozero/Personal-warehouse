import { Link } from 'react-router-dom';
import { factions } from '../lib/data.js';

/**
 * 阵营横向长廊。
 *
 * 用户要求「对同阵营角色进行分类整合，并做出风格化差异」——
 * 这里给出 17 个阵营的第一层入口（徽记字形 + 专属颜色 + 人数），
 * 点进去是 /faction/:id 的独立阵营页（横幅、成员、内部关系）。
 */
export default function FactionRail() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pt-14" aria-label="阵营">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">FACTIONS</p>
          <h2 className="title-display mt-1 text-2xl font-semibold text-slate-100">
            阵营 · 以信念划分的十七种立场
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            同一个阵营的人共享一种底色：星穹列车的铜金、星核猎手的品红、仙舟联盟的青玉……
            点击徽记进入阵营专栏。
          </p>
        </div>
      </header>

      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3">
        {factions.map((f) => (
          <Link
            key={f.id}
            to={`/faction/${f.id}`}
            style={{ '--c-primary': f.color, '--c-accent': f.color, '--c-glow': `${f.color}59` }}
            className="glass card-hover group relative w-[186px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 p-3"
            title={f.blurb}
          >
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25 blur-xl transition-opacity group-hover:opacity-45"
              style={{ background: f.color }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg"
                style={{ borderColor: `${f.color}80`, color: f.color }}
                aria-hidden="true"
              >
                {f.crest}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{f.name}</p>
                <p className="truncate text-[10px] text-slate-500">{f.nameEn}</p>
              </div>
            </div>
            <p className="clamp-2 mt-2 text-[11px] leading-snug text-slate-400">{f.blurb}</p>
            <p className="mt-2 text-[10px] text-slate-500">
              成员 <span style={{ color: f.color }}>{f.members.length}</span> 人
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
