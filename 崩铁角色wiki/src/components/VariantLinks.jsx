import { Link } from 'react-router-dom';

/**
 * 同一角色的其他形态互链。
 *
 * 例如「砂金•戏浪」与「砂金」、「丹恒•饮月」与「丹恒」——
 * 他们在本站各有独立专栏（故事不同），但在关系图里折叠成同一个节点。
 */
export default function VariantLinks({ base, variants }) {
  if (!base && !variants.length) return null;

  return (
    <section className="glass rounded-2xl border border-white/10 p-4">
      <h2 className="title-display text-sm font-semibold text-slate-200">同一角色的其他形态</h2>
      <p className="mt-1 text-[11px] text-slate-500">
        故事与形态不同，所以各自独立成栏；在人物关系图中他们是同一个人。
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {base ? (
          <VariantChip id={base.id} name={base.name} avatar={base.avatar} label="基础形态" />
        ) : null}
        {variants.map((v) => (
          <VariantChip key={v.id} id={v.id} name={v.name} avatar={v.avatar} label="异格" />
        ))}
      </div>
    </section>
  );
}

function VariantChip({ id, name, avatar, label }) {
  return (
    <Link
      to={`/character/${id}`}
      className="glass flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 transition-colors hover:border-[var(--c-primary)]"
    >
      {avatar ? (
        <img src={avatar} alt="" width={26} height={26} loading="lazy" className="h-[26px] w-[26px] rounded-full" />
      ) : null}
      <span className="text-xs text-slate-200">{name}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
    </Link>
  );
}
