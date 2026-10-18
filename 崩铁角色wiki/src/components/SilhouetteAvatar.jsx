/**
 * 未实装（官方 Wiki 尚无头像）角色的占位图形。
 *
 * 用户决策：「未实装角色使用空白圆图框黑色人影头像加名称替代」。
 * 同一份 SVG 既用于 DOM（<SilhouetteAvatar/>），
 * 也用于 ECharts 的节点 symbol（silhouetteDataUri），保证关系图里风格一致。
 */

const SILHOUETTE_PATH =
  'M50 59c-15.6 0-27.4 9.8-28.8 24.4a2.4 2.4 0 0 0 2.4 2.6h52.8a2.4 2.4 0 0 0 2.4-2.6C77.4 68.8 65.6 59 50 59z';

/**
 * 生成一张 100×100 的 SVG：虚线空心圆 + 黑色人影。
 * @param {{stroke?:string, fill?:string, dashed?:boolean}} [opts]
 */
export function silhouetteSvg({ stroke = '#94a3b8', fill = '#0b1020', dashed = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
<circle cx="50" cy="50" r="46" fill="${fill}" fill-opacity="0.85" stroke="${stroke}" stroke-width="3"${
    dashed ? ' stroke-dasharray="7 7"' : ''
  }/>
<g fill="#000000" fill-opacity="0.92">
<circle cx="50" cy="37" r="14.5"/>
<path d="${SILHOUETTE_PATH}"/>
</g>
<circle cx="50" cy="50" r="46" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1"/>
</svg>`;
}

/** 供 ECharts 的 `symbol: 'image://...'` 使用。 */
export function silhouetteDataUri(opts) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(silhouetteSvg(opts))}`;
}

export default function SilhouetteAvatar({ name, size = 96, className = '', stroke = '#94a3b8' }) {
  const uri = silhouetteDataUri({ stroke });
  return (
    <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <img
        src={uri}
        width={size}
        height={size}
        alt={`${name}（未实装，暂无官方头像）`}
        title={`${name} · 尚未实装`}
        className="rounded-full bg-void-900/70"
        style={{ width: size, height: size }}
      />
      {name ? (
        <span className="max-w-[8rem] truncate text-center text-xs text-slate-400">{name}</span>
      ) : null}
    </span>
  );
}
