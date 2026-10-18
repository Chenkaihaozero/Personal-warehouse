import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CharacterHero from '../components/CharacterHero.jsx';
import StorySection from '../components/StorySection.jsx';
import RelationList from '../components/RelationList.jsx';
import VariantLinks from '../components/VariantLinks.jsx';
import MetaBadge from '../components/MetaBadge.jsx';
import CharacterCard from '../components/CharacterCard.jsx';
import RichText from '../components/RichText.jsx';
import NotFound from './NotFound.jsx';
import {
  getCharacter,
  boardMembers,
  factionMembers,
  relationsOf,
  variantsOf,
  baseVariantOf,
  loadCharacterDetail,
  themeVars,
} from '../lib/data.js';

const FACTION_LIKE = new Set(['faction-line']);

export default function CharacterPage() {
  const { id } = useParams();
  const char = getCharacter(id);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!char) return;
    let alive = true;
    setDetail(null);
    loadCharacterDetail(char.id).then((d) => {
      if (alive) setDetail(d);
    });
    return () => {
      alive = false;
    };
  }, [char && char.id]);

  const rels = useMemo(() => (char ? relationsOf(char.id) : []), [char && char.id]);
  const variants = useMemo(() => (char ? variantsOf(char.id) : []), [char && char.id]);
  const base = useMemo(() => (char ? baseVariantOf(char.id) : null), [char && char.id]);

  const neighbors = useMemo(() => {
    if (!char) return { prev: null, next: null };
    const list = boardMembers(char.board);
    const i = list.findIndex((c) => c.id === char.id);
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
    };
  }, [char && char.id]);

  const sameFaction = useMemo(
    () => (char ? factionMembers(char.faction).filter((c) => c.id !== char.id).slice(0, 8) : []),
    [char && char.id],
  );

  if (!char) return <NotFound />;

  const stories = detail ? detail.stories : [];

  return (
    <div style={themeVars(char.theme)} className="pb-16">
      <CharacterHero char={char} />

      <div className="mx-auto mt-10 grid w-full max-w-6xl gap-8 px-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* --------------------------- 正文 --------------------------- */}
        <div className="min-w-0 space-y-8">
          <section className="glass rounded-2xl border border-white/10 p-6">
            <h2 className="title-display mb-3 text-lg font-semibold text-slate-200">角色简介</h2>
            {detail ? (
              detail.intro ? (
                <RichText text={detail.intro} className="text-[15px] leading-[1.95] text-slate-300" />
              ) : (
                <p className="text-sm text-slate-400">官方条目暂未收录简介。</p>
              )
            ) : (
              <div className="space-y-2" aria-busy="true">
                <div className="h-3 w-11/12 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-10/12 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-8/12 animate-pulse rounded bg-white/5" />
              </div>
            )}
          </section>

          {detail ? (
            <StorySection stories={stories} name={char.name} />
          ) : (
            <section className="glass rounded-2xl border border-white/10 p-6" aria-busy="true">
              <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-24 animate-pulse rounded bg-white/5" />
            </section>
          )}

          <RelationList
            items={rels}
            title="人物关系"
            emptyHint="官方 Wiki 该条目未收录角色关系，本站策展表也未补充独立关系。"
          />
        </div>

        {/* --------------------------- 侧栏 --------------------------- */}
        <aside className="space-y-5">
          <section className="glass rounded-2xl border border-white/10 p-5">
            <h2 className="title-display mb-3 text-sm font-semibold text-slate-200">基本信息</h2>
            <dl className="space-y-2 text-xs">
              <Row label="稀有度">
                <span className="text-amber-300">
                  {'★'.repeat(char.rarityNum)}
                  <span className="text-slate-600">{'★'.repeat(Math.max(0, 5 - char.rarityNum))}</span>
                </span>
              </Row>
              <Row label="属性">
                <MetaBadge tone="element" value={char.element || '未知'} color="var(--c-primary)" />
              </Row>
              <Row label="命途">
                <MetaBadge tone="path" value={char.path || '未知'} />
              </Row>
              <Row label="阵营">
                <Link to={`/faction/${char.faction}`}>
                  <MetaBadge tone="faction" value={char.factionName} color="var(--c-accent)" />
                </Link>
              </Row>
              {char.affiliation ? <Row label="所属">{char.affiliation}</Row> : null}
              <Row label="出场板块">
                <Link to={`/?board=${char.board}`} className="text-slate-200 hover:text-white">
                  {char.boardName}
                </Link>
              </Row>
              <Row label="实装日期">
                {char.releaseDate ? (
                  <span className="text-slate-300">{char.releaseDate}</span>
                ) : (
                  <span
                    className="text-slate-400"
                    title="官方 Wiki 未标注该角色的实装日期，此处按条目编号在已实装角色之间就近估算"
                  >
                    ≈ {char.orderDate || '未知'}
                    <span className="ml-1 text-[10px] text-slate-500">（按登场顺序估算）</span>
                  </span>
                )}
              </Row>
              {detail && detail.tags && detail.tags.length ? (
                <Row label="标签">
                  <span className="flex flex-wrap gap-1">
                    {detail.tags.map((t) => (
                      <MetaBadge key={t} tone="muted" value={t.split('/').pop()} />
                    ))}
                  </span>
                </Row>
              ) : null}
            </dl>
          </section>

          <VariantLinks base={base} variants={variants} />

          {sameFaction.length ? (
            <section className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="title-display mb-3 text-sm font-semibold text-slate-200">
                同为「{char.factionName}」
              </h2>
              <ul className="space-y-2">
                {sameFaction.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/character/${c.id}`}
                      className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-white/5"
                    >
                      <img
                        src={c.avatar}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-8 w-8 rounded-full bg-void-900/70"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-300">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.element}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      {/* --------------------------- 上/下一位 --------------------------- */}
      <nav className="mx-auto mt-12 flex w-full max-w-6xl items-stretch gap-3 px-5" aria-label="板块内导航">
        <NeighborLink char={neighbors.prev} dir="prev" boardName={char.boardName} />
        <NeighborLink char={neighbors.next} dir="next" boardName={char.boardName} />
      </nav>

      {/* 同板块其他角色 */}
      <section className="mx-auto mt-12 w-full max-w-6xl px-5">
        <h2 className="title-display mb-4 text-lg font-semibold text-slate-200">
          {char.boardName}的其他角色
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {boardMembers(char.board)
            .filter((c) => c.id !== char.id)
            .slice(0, 8)
            .map((c) => (
              <CharacterCard key={c.id} char={c} compact />
            ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="flex flex-wrap items-center justify-end gap-1 text-right text-slate-300">{children}</dd>
    </div>
  );
}

function NeighborLink({ char, dir, boardName }) {
  if (!char) {
    return (
      <div className="glass flex flex-1 items-center rounded-xl border border-dashed border-white/10 p-3 text-[11px] text-slate-600">
        {dir === 'prev' ? '已是该板块第一位' : '已是该板块最后一位'}
      </div>
    );
  }
  return (
    <Link
      to={`/character/${char.id}`}
      className="glass card-hover flex flex-1 items-center gap-3 rounded-xl border border-white/10 p-3"
    >
      {dir === 'prev' ? <span className="text-slate-500">←</span> : null}
      <img src={char.avatar} alt="" width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full" />
      <span className="min-w-0">
        <span className="block text-[10px] text-slate-500">
          {dir === 'prev' ? `${boardName} · 上一位` : `${boardName} · 下一位`}
        </span>
        <span className="block truncate text-sm text-slate-200">{char.name}</span>
      </span>
      {dir === 'next' ? <span className="ml-auto text-slate-500">→</span> : null}
    </Link>
  );
}
