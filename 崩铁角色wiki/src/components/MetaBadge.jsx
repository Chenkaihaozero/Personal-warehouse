const TONE = {
  element: 'border-white/15 text-slate-200',
  path: 'border-white/15 text-slate-300',
  faction: 'border-white/10 text-slate-300',
  board: 'border-white/10 text-slate-400',
  rarity: 'border-amber-300/40 text-amber-200',
  muted: 'border-white/10 text-slate-400',
};

/**
 * 小徽章。配色一律走 CSS 变量（--c-primary / --c-accent），
 * 于是同一个组件在八个板块里会长出八种颜色 —— 不拼动态 Tailwind 类名，避免被 purge。
 */
export default function MetaBadge({ label, value, tone = 'muted', color, className = '', icon }) {
  const style = color ? { borderColor: `${color}66`, color } : undefined;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] leading-none ${
        TONE[tone] || TONE.muted
      } ${className}`}
      style={style}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {label ? <span className="opacity-60">{label}</span> : null}
      <span className="font-medium">{value}</span>
    </span>
  );
}
