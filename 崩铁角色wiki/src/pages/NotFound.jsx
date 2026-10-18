import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">ERROR 404 · 星轨断裂</p>
      <h1 className="title-display mt-4 text-5xl font-bold text-slate-100">这条航路不存在</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        你要找的角色或板块没有收录在档案里。可能是链接拼写有误，也可能是该条目已随版本改名。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="glass rounded-full border border-white/15 px-5 py-2 text-sm text-slate-200 transition-colors hover:border-[var(--c-primary)]"
        >
          返回星海航路
        </Link>
        <Link
          to="/relations"
          className="glass rounded-full border border-white/15 px-5 py-2 text-sm text-slate-200 transition-colors hover:border-[var(--c-primary)]"
        >
          查看人物关系网
        </Link>
      </div>
    </div>
  );
}
