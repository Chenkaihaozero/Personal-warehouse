import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RelationGraph from '../components/RelationGraph.jsx';
import { relations, RELATION_STYLE, factions, getCharacter, factionById } from '../lib/data.js';

const TYPES = Object.keys(RELATION_STYLE);

/**
 * 人物关系总览页。
 *
 * 上图可交互、可筛选；下面给出同一份数据的**文字速查**——
 * 图适合看结构，文字适合查「谁和谁到底什么关系」。
 */
export default function RelationPage() {
  const [openType, setOpenType] = useState(null);

  const byType = useMemo(() => {
    const map = new Map(TYPES.map((t) => [t, []]));
    for (const l of relations.links) {
      if (map.has(l.type)) map.get(l.type).push(l);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.arrow || a.source).localeCompare(b.arrow || b.source, 'zh-Hans-CN'));
    }
    return map;
  }, []);

  const hubNodes = useMemo(
    () => [...relations.nodes].sort((a, b) => b.degree - a.degree).slice(0, 12),
    [],
  );

  const factionCount = useMemo(() => {
    const m = new Map();
    for (const n of relations.nodes) {
      if (!n.faction) continue;
      m.set(n.faction, (m.get(n.faction) || 0) + 1);
    }
    return [...m.entries()]
      .map(([id, n]) => ({ faction: factionById.get(id), n }))
      .filter((x) => x.faction)
      .sort((a, b) => b.n - a.n);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-12">
      <header className="mb-8">
        <p className="eyebrow">RELATIONSHIP GRAPH · 人物关系网络</p>
        <h1 className="title-display mt-3 text-4xl font-bold text-slate-50 md:text-5xl">
          谁与谁，因何相连
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
          共 {relations.nodes.length} 个节点、{relations.links.length} 条关系。
          其中 <strong className="font-semibold text-slate-100">{relations.links.filter((l) => l.origins.includes('official')).length} 条</strong>
          直接来自官方 Wiki 的「角色关系」模块，其余由本站依据主线剧情整理。
          节点头像一律取自官方条目，名称与图像同源，不存在错配。
          连线上不印文字，整张网靠颜色与线型读类型（实线家人同伴 / 虚线上下师生 / 点线敌对）；
          想看某一条关系到底写了什么，<strong className="font-semibold text-slate-100">双击那条连线</strong>，
          弹出的详情卡会把关系文字完整写出来（字号是提示框的两倍，看得清）。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {TYPES.map((t) => {
            const st = RELATION_STYLE[t];
            return (
              <span
                key={t}
                className="glass flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"
                style={{ color: st.color }}
              >
                <span
                  className="inline-block h-[2px] w-5"
                  style={{
                    background:
                      st.dash === 'dotted'
                        ? `repeating-linear-gradient(90deg, ${st.color} 0 2px, transparent 2px 4px)`
                        : st.dash === 'dashed'
                          ? `repeating-linear-gradient(90deg, ${st.color} 0 5px, transparent 5px 8px)`
                          : st.color,
                  }}
                />
                {st.label}
                <span className="text-slate-500">{byType.get(t).length}</span>
              </span>
            );
          })}
        </div>
      </header>

      <RelationGraph height={900} />

      {/* ------------------------- 关系枢纽 ------------------------- */}
      <section className="mt-14">
        <h2 className="title-display mb-4 text-xl font-semibold text-slate-200">关系枢纽</h2>
        <p className="mb-4 text-sm text-slate-400">
          连接数最多的角色——他们往往是一个地区或一条主线的交汇点。
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hubNodes.map((n) => {
            const c = n.external ? null : getCharacter(n.id);
            const inner = (
              <>
                {n.avatar ? (
                  <img
                    src={n.avatar}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 rounded-full bg-void-900/70 ring-1"
                    style={{ '--tw-ring-color': n.factionColor }}
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-slate-500 text-slate-500">
                    ?
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-slate-200">{n.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {n.factionName}
                    {n.external ? ' · 未实装' : ''}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-xl leading-none" style={{ color: n.factionColor }}>
                    {n.degree}
                  </span>
                  <span className="text-xs text-slate-500">条关系</span>
                </span>
              </>
            );
            return c ? (
              <Link
                key={n.id}
                to={`/character/${c.id}`}
                className="glass card-hover flex items-center gap-3 rounded-xl border border-white/10 p-3"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={n.id}
                className="glass flex items-center gap-3 rounded-xl border border-white/10 p-3 opacity-80"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------- 阵营分布 ------------------------- */}
      <section className="mt-14">
        <h2 className="title-display mb-4 text-xl font-semibold text-slate-200">阵营分布</h2>
        <div className="flex flex-wrap gap-2">
          {factionCount.map(({ faction, n }) => (
            <Link
              key={faction.id}
              to={`/faction/${faction.id}`}
              className="glass flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm transition-colors hover:border-[var(--c-primary)]"
              style={{ '--c-primary': faction.color }}
            >
              <span style={{ color: faction.color }}>{faction.crest}</span>
              <span className="text-slate-200">{faction.name}</span>
              <span className="text-slate-500">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------- 文字速查 ------------------------- */}
      <section className="mt-14">
        <h2 className="title-display mb-4 text-xl font-semibold text-slate-200">关系速查表</h2>
        <p className="mb-4 text-sm text-slate-400">
          和上图是同一份数据。点开一类关系，逐条读「谁 → 谁，什么关系」。
        </p>

        <div className="space-y-2">
          {TYPES.map((t) => {
            const st = RELATION_STYLE[t];
            const list = byType.get(t);
            const open = openType === t;
            return (
              <div key={t} className="glass overflow-hidden rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenType(open ? null : t)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  aria-expanded={open}
                >
                  <span className="inline-block h-[2px] w-5" style={{ background: st.color }} />
                  <span className="text-lg text-slate-200">{st.label}</span>
                  <span className="text-[13px] text-slate-500">{list.length} 条</span>
                  <span className="ml-auto text-slate-500">{open ? '−' : '+'}</span>
                </button>

                {open ? (
                  <ul className="divide-y divide-white/5 border-t border-white/5">
                    {list.map((l, i) => {
                      const a = getCharacter(relations.nodes.find((n) => n.name === l.source)?.id);
                      const b = getCharacter(relations.nodes.find((n) => n.name === l.target)?.id);
                      return (
                        <li key={`${l.source}-${l.target}-${i}`} className="px-4 py-2.5">
                          <p className="text-lg text-slate-200">
                            <NameCell name={l.source} char={a} />
                            <span className="mx-1.5 font-mono" style={{ color: st.color }}>
                              {l.dir === 'none' ? '—' : l.dir === 'both' ? '↔' : '→'}
                            </span>
                            <NameCell name={l.target} char={b} />
                            <span className="ml-2 text-slate-400">{l.relation}</span>
                          </p>
                          {l.notes && l.notes.length ? (
                            <p className="mt-1 text-[15px] leading-relaxed text-slate-400">{l.notes.join(' / ')}</p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function NameCell({ name, char }) {
  if (!char) return <span className="text-slate-400">{name}</span>;
  return (
    <Link to={`/character/${char.id}`} className="text-slate-100 underline decoration-dotted underline-offset-2 hover:text-white">
      {name}
    </Link>
  );
}
