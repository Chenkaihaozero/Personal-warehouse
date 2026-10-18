import { Link } from 'react-router-dom';
import SilhouetteAvatar from './SilhouetteAvatar.jsx';
import { RELATION_STYLE } from '../lib/data.js';

/**
 * 人物关系清单（角色页 / 阵营页共用）。
 *
 * 箭头语义与关系图保持一致：
 *  `→`  长辈/上级 → 晚辈/下级（单向）
 *  `↔`  相互敌对
 *  `—`  家人、同伴（无向）
 */
export function ArrowMark({ link }) {
  if (link.dir === 'none') return <span className="text-slate-500">—</span>;
  if (link.dir === 'both') return <span className="text-rose-300">↔</span>;
  return <span style={{ color: RELATION_STYLE[link.type]?.color }}>→</span>;
}

export default function RelationList({ items, title = '人物关系', emptyHint }) {
  if (!items.length) {
    return (
      <section className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="title-display text-base font-semibold text-slate-200">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{emptyHint || '暂无记录在案的人物关系。'}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="title-display mb-3 text-lg font-semibold text-slate-200">
        {title}
        <span className="ml-2 text-xs font-normal text-slate-500">共 {items.length} 条</span>
      </h2>

      <ul className="space-y-2">
        {items.map(({ other, link, outgoing }) => {
          const style = RELATION_STYLE[link.type] || RELATION_STYLE.ally;
          const selfIsFrom = link.from ? other.name !== link.from : false;
          // 相对当前角色而言箭头指向哪边
          const arrowText = link.dir === 'none' ? '—' : link.dir === 'both' ? '↔' : selfIsFrom ? '→' : '←';

          return (
            <li key={`${other.id}-${link.type}-${link.relation}`}>
              <Link
                to={other.external ? '#' : `/character/${other.id}`}
                onClick={other.external ? (e) => e.preventDefault() : undefined}
                className={`glass flex items-start gap-3 rounded-xl border border-white/10 p-3 transition-colors ${
                  other.external ? 'cursor-default' : 'hover:border-[var(--c-primary)]'
                }`}
              >
                {other.avatar ? (
                  <img
                    src={other.avatar}
                    alt={other.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-full bg-void-900/70 ring-1"
                    style={{ '--tw-ring-color': style.color }}
                  />
                ) : (
                  <SilhouetteAvatar name="" size={44} stroke={style.color} />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{other.name}</span>
                    <span
                      className="rounded border px-1.5 py-[1px] text-[10px]"
                      style={{ borderColor: `${style.color}88`, color: style.color }}
                    >
                      {style.label}
                    </span>
                    <span
                      className="font-mono text-xs"
                      style={{ color: style.color, opacity: outgoing ? 1 : 0.7 }}
                      title="关系指向"
                    >
                      {arrowText}
                    </span>
                    {other.external ? (
                      <span className="rounded border border-white/10 px-1.5 py-[1px] text-[10px] text-slate-500">
                        未实装 / 非可玩角色
                      </span>
                    ) : other.boardName && other.boardName !== undefined ? (
                      <span className="text-[10px] text-slate-500">{other.boardName}</span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-slate-300">{link.relation}</p>

                  {link.notes.length > 1 ? (
                    <ul className="mt-1.5 space-y-0.5">
                      {link.notes.map((n) => (
                        <li key={n} className="text-[11px] leading-snug text-slate-500">
                          · {n}
                        </li>
                      ))}
                    </ul>
                  ) : link.notes[0] && link.notes[0] !== link.relation ? (
                    <p className="mt-1 text-[11px] leading-snug text-slate-500">{link.notes[0]}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
