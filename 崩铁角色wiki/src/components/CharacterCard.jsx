import { Link } from 'react-router-dom';
import SilhouetteAvatar from './SilhouetteAvatar.jsx';
import { themeVars } from '../lib/data.js';

const ELEMENT_GLYPH = {
  冰: '❄',
  火: '🔥',
  雷: '⚡',
  风: '🌪',
  物理: '⚔',
  量子: '◈',
  虚数: '✧',
};

/**
 * 角色卡片。
 *
 * 每张卡的边框、头像环、名字辉光都由该角色自己的属性色驱动
 * （style 里注入 --c-primary），所以同一屏里 20 个角色是 20 种颜色，
 * 而同一角色在任何板块、任何页面都是同一种颜色。
 */
export default function CharacterCard({ char, compact = false }) {
  if (!char) return null;
  const vars = themeVars(char.theme);
  const unavailable = !char.avatar;

  return (
    <Link
      to={`/character/${char.id}`}
      style={vars}
      className="card-hover group relative block overflow-hidden rounded-xl border border-white/10 bg-void-800/60 p-3 backdrop-blur-sm"
      title={`${char.name} · ${char.title || ''}`}
    >
      {/* 顶部属性色光带 */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, var(--c-primary), transparent)' }}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {unavailable ? (
            <SilhouetteAvatar name="" size={compact ? 48 : 56} stroke="var(--c-primary)" />
          ) : (
            <img
              src={char.avatar}
              alt={char.name}
              loading="lazy"
              width={compact ? 48 : 56}
              height={compact ? 48 : 56}
              className="rounded-full bg-void-900/70 ring-2 transition-transform duration-500 group-hover:scale-105"
              style={{ '--tw-ring-color': 'var(--c-primary)', width: compact ? 48 : 56, height: compact ? 48 : 56 }}
            />
          )}
          <span
            className="absolute -right-1 -bottom-1 rounded-full border border-white/15 bg-void-900 px-1 text-[9px] leading-4 text-[var(--c-primary)]"
            aria-label={`${char.rarity}`}
          >
            {char.rarityNum}★
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3
              className="title-display truncate text-[15px] font-semibold text-slate-100 transition-colors"
              style={{ textShadow: '0 0 14px var(--c-glow)' }}
            >
              {char.name}
            </h3>
            {char.nameEn ? (
              <span className="hidden truncate text-[10px] tracking-wide text-slate-500 sm:inline">
                {char.nameEn}
              </span>
            ) : null}
          </div>

          {char.title && !compact ? (
            <p className="clamp-2 mt-1 text-[11px] leading-snug text-slate-400">{char.title}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className="rounded border px-1.5 py-[1px]"
              style={{ borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}
            >
              {ELEMENT_GLYPH[char.element] || ''} {char.element || '未知'}
            </span>
            {char.path ? (
              <span className="rounded border border-white/15 px-1.5 py-[1px] text-slate-400">
                {char.path}
              </span>
            ) : null}
            {char.variantOf ? (
              <span className="rounded border border-white/10 px-1.5 py-[1px] text-slate-500">
                异格
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 32px -12px var(--c-primary)' }}
        aria-hidden="true"
      />
    </Link>
  );
}
