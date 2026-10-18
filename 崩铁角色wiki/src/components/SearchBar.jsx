/**
 * 首页顶部的搜索入口。
 * 它本身不承载逻辑 —— 点击/聚焦就把全局搜索面板（Ctrl+K）叫起来，
 * 这样站点里只有一个真正的搜索实现。
 */
export default function SearchBar({ onOpenSearch, hint = '搜索角色、板块、阵营…' }) {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      className="glass group flex w-full max-w-xl items-center gap-3 rounded-full px-5 py-3 text-left transition-colors hover:border-[var(--c-primary)]"
      aria-label="打开搜索"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="flex-1 truncate text-sm text-slate-400 group-hover:text-slate-300">{hint}</span>
      <kbd className="hidden shrink-0 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline-block">
        Ctrl K
      </kbd>
    </button>
  );
}
