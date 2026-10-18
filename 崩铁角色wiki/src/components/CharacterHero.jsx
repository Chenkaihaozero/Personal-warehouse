import { Link } from 'react-router-dom';
import MetaBadge from './MetaBadge.jsx';
import SilhouetteAvatar from './SilhouetteAvatar.jsx';
import { loadCharacterDetail } from '../lib/data.js';
import { useEffect, useState } from 'react';

const ELEMENT_GLYPH = { 冰: '❄', 火: '🔥', 雷: '⚡', 风: '🌪', 物理: '⚔', 量子: '◈', 虚数: '✧' };

/**
 * 角色页的头部。
 *
 * 官方立绘单张 3.6 MB、99 张约 360 MB，本站不下载立绘，
 * 改用官方头像 + 角色主色的光晕/几何装饰撑起视觉。
 */
export default function CharacterHero({ char }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let alive = true;
    loadCharacterDetail(char.id).then((d) => alive && setDetail(d));
    return () => {
      alive = false;
    };
  }, [char.id]);

  const stars = '★'.repeat(char.rarityNum) + '☆'.repeat(Math.max(0, 5 - char.rarityNum));

  return (
    <header className={`relative overflow-hidden ${char.theme.backgroundStyle}`}>
      {/* 命途纹理 + 主色光晕 */}
      <div className={`pointer-events-none absolute inset-0 opacity-[0.14] ${char.theme.pattern}`} aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--c-primary)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--c-accent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400" aria-label="面包屑">
          <Link to="/" className="hover:text-white">首页</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/?board=${char.board}`} className="hover:text-white">{char.boardName}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-300">{char.name}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative shrink-0 self-start md:self-center">
            {char.avatar ? (
              <img
                src={char.avatar}
                alt={`${char.name} 头像`}
                width={148}
                height={148}
                className="h-[148px] w-[148px] rounded-2xl bg-void-900/60 ring-2"
                style={{ '--tw-ring-color': 'var(--c-primary)', boxShadow: '0 0 60px -12px var(--c-glow)' }}
              />
            ) : (
              <div className="glass rounded-2xl p-3">
                <SilhouetteAvatar name="" size={124} stroke="var(--c-primary)" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="eyebrow" style={{ color: 'var(--c-accent)' }}>
              {char.nameEn || char.factionName}
              {char.aliases.length ? ` · 亦称 ${char.aliases.join('、')}` : ''}
            </p>

            <h1
              className="title-display mt-2 text-4xl font-bold text-slate-50 md:text-5xl"
              style={{ textShadow: '0 0 30px var(--c-glow)' }}
            >
              {char.name}
            </h1>

            {char.title ? (
              <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-slate-300">{char.title}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <MetaBadge tone="rarity" value={stars} />
              <MetaBadge
                tone="element"
                value={`${ELEMENT_GLYPH[char.element] || ''} ${char.element || '未知'}`}
                color="var(--c-primary)"
              />
              {char.path ? <MetaBadge tone="path" label="命途" value={char.path} /> : null}
              <Link to={`/faction/${char.faction}`} className="transition-transform hover:scale-105">
                <MetaBadge tone="faction" label="阵营" value={char.factionName} color="var(--c-accent)" />
              </Link>
              <Link to={`/?board=${char.board}`} className="transition-transform hover:scale-105">
                <MetaBadge tone="board" label="出场" value={char.boardName} />
              </Link>
              {char.subFaction ? <MetaBadge tone="muted" value={char.subFaction} /> : null}
              {char.variantOf ? <MetaBadge tone="muted" value={`${char.variantOf} 的其他形态`} /> : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
