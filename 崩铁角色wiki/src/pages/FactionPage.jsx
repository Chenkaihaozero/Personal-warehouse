import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import CharacterCard from '../components/CharacterCard.jsx';
import RichText from '../components/RichText.jsx';
import NotFound from './NotFound.jsx';
import {
  factions,
  getFaction,
  factionMembers,
  relations,
  nodeByName,
  getRegion,
  themeVars,
} from '../lib/data.js';

/**
 * 阵营专栏。
 *
 * 用户要求「同阵营角色分类整合也要有风格化差异」——
 * 这里用阵营自己的主色 + 徽记字形给整页定调，17 个阵营各不相同。
 */
export default function FactionPage() {
  const { id } = useParams();
  const faction = getFaction(id);

  const members = useMemo(() => (faction ? factionMembers(faction.id) : []), [faction && faction.id]);
  const board = faction && faction.boardId ? getRegion(faction.boardId) : null;

  /** 阵营内部的关系（两端都在本阵营） */
  const internal = useMemo(() => {
    if (!faction) return [];
    const names = new Set(members.map((m) => m.name));
    return relations.links
      .filter((l) => names.has(l.source) && names.has(l.target))
      .map((link) => {
        const otherA = nodeByName.get(link.source);
        const otherB = nodeByName.get(link.target);
        return { link, a: otherA, b: otherB };
      })
      .filter((x) => x.a && x.b);
  }, [faction && faction.id, members]);

  if (!faction) return <NotFound />;

  const theme = {
    primaryColor: faction.color,
    accentColor: faction.color,
    glow: hexToGlow(faction.color),
  };

  return (
    <div style={themeVars(theme)} className="pb-20">
      <header className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: faction.color }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{ background: faction.color }}
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
            <Link to="/" className="hover:text-white">首页</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-300">阵营</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-200">{faction.name}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <span
              className="grid h-16 w-16 place-items-center rounded-2xl border text-3xl"
              style={{
                borderColor: `${faction.color}66`,
                color: faction.color,
                background: `${faction.color}12`,
                boxShadow: `0 0 40px -10px ${faction.color}`,
              }}
              aria-hidden="true"
            >
              {faction.crest}
            </span>
            <div className="min-w-0">
              <p className="eyebrow" style={{ color: faction.color }}>{faction.nameEn || 'FACTION'}</p>
              <h1 className="title-display mt-1 text-4xl font-bold text-slate-50">{faction.name}</h1>
            </div>
            <div className="ml-auto flex gap-6 text-right">
              <div>
                <p className="font-mono text-2xl" style={{ color: faction.color }}>{members.length}</p>
                <p className="text-[11px] text-slate-500">位成员</p>
              </div>
              <div>
                <p className="font-mono text-2xl" style={{ color: faction.color }}>{internal.length}</p>
                <p className="text-[11px] text-slate-500">条内部关系</p>
              </div>
            </div>
          </div>

          {faction.blurb ? (
            <RichText text={faction.blurb} className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300" />
          ) : null}

          {board ? (
            <p className="mt-4 text-[11px] text-slate-500">
              主要出场板块：
              <Link to={`/?board=${board.id}`} className="ml-1 text-slate-300 underline decoration-dotted hover:text-white">
                {board.name}
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-[11px] text-slate-500">
              该阵营的成员分布在多个板块，无单一主场。
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto mt-10 grid w-full max-w-6xl gap-8 px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <h2 className="title-display mb-4 text-lg font-semibold text-slate-200">
            成员 <span className="text-xs font-normal text-slate-500">按出场顺序</span>
          </h2>
          {members.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {members.map((c) => (
                <CharacterCard key={c.id} char={c} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">该阵营暂无可玩角色收录。</p>
          )}
        </div>

        <aside className="space-y-5">
          <section className="glass rounded-2xl border border-white/10 p-5">
            <h2 className="title-display mb-3 text-sm font-semibold text-slate-200">阵营内部关系</h2>
            {internal.length ? (
              <ul className="space-y-2.5">
                {internal.slice(0, 18).map(({ link, a, b }, i) => (
                  <li key={`${link.source}-${link.target}-${i}`} className="text-xs leading-snug">
                    <span className="text-slate-200">{link.source}</span>
                    <span className="mx-1 font-mono" style={{ color: faction.color }}>
                      {link.dir === 'none' ? '—' : link.dir === 'both' ? '↔' : '→'}
                    </span>
                    <span className="text-slate-200">{link.target}</span>
                    <span className="ml-1.5 text-slate-400">{link.relation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">本阵营成员之间暂无记录在案的关系。</p>
            )}
          </section>

          <section className="glass rounded-2xl border border-white/10 p-5">
            <h2 className="title-display mb-2 text-sm font-semibold text-slate-200">其他阵营</h2>
            <ul className="flex flex-wrap gap-1.5">
              {factions.map((f) => (
                <li key={f.id}>
                  <Link
                    to={`/faction/${f.id}`}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                    style={
                      f.id === faction.id
                        ? { color: f.color, borderColor: f.color }
                        : { borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                    }
                  >
                    <span style={{ color: f.color }}>{f.crest}</span>
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** '#fbbf24' → 'rgba(251, 191, 36, 0.35)' */
function hexToGlow(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length < 6) return undefined;
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, 0.35)`;
}
