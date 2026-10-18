import { useState } from 'react';
import RichText from './RichText.jsx';

/**
 * 角色故事。
 *
 * 官方把故事拆成「其一/其二/其三…」，每条带一个解锁条件。
 * 这里做成 tab：一次只读一段，页面上不会一下涌出六千字。
 */
export default function StorySection({ stories = [], name }) {
  const [active, setActive] = useState(0);

  if (!stories.length) {
    return (
      <section className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="title-display text-lg font-semibold text-slate-200">角色故事</h2>
        <p className="mt-3 text-sm text-slate-400">
          官方 Wiki 的「{name}」条目尚未收录角色故事正文（该条目目前只有基础信息）。
          待官方补全后，本站重新运行 <code className="rounded bg-white/5 px-1">npm run fetch:data</code> 即可同步。
        </p>
      </section>
    );
  }

  const story = stories[Math.min(active, stories.length - 1)];

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="title-display text-lg font-semibold text-slate-200">
          角色故事
          <span className="ml-2 text-xs font-normal text-slate-500">共 {stories.length} 段</span>
        </h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="角色故事">
        {stories.map((s, i) => (
          <button
            key={s.title + i}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              i === active
                ? 'border-[var(--c-primary)] bg-white/10 text-white'
                : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
            }`}
          >
            {s.title.replace(/^角色故事[·・]?/, '') || `其${i + 1}`}
          </button>
        ))}
      </div>

      <article
        className="glass relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8"
        style={{ boxShadow: 'inset 0 0 60px -40px var(--c-primary)' }}
      >
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
          style={{ background: 'linear-gradient(180deg, var(--c-primary), transparent)' }}
          aria-hidden="true"
        />
        <header className="mb-4 flex flex-wrap items-baseline gap-2">
          <h3 className="title-display text-base font-semibold text-slate-100">{story.title}</h3>
          {story.unlock ? (
            <span className="text-[11px] text-slate-500">{story.unlock.replace(/[（）]/g, '')}</span>
          ) : null}
        </header>

        <RichText text={story.text} className="text-[15px] leading-[1.95] text-slate-300" />
      </article>
    </section>
  );
}
