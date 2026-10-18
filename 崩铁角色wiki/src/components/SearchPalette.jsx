import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { regions, factions, charById, themeVars } from '../lib/data.js';

const KIND_LABEL = { character: '角色', region: '板块', faction: '阵营' };

/**
 * 全局搜索面板（Ctrl+K）。
 *
 * 搜索索引单独懒加载：只有第一次打开面板才会去下载它，
 * 首页首屏因此不必背 94 个角色的简介。
 */
export default function SearchPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [docs, setDocs] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 懒加载索引
  useEffect(() => {
    if (!open || docs) return;
    let alive = true;
    import('../data/search-index.json').then((mod) => {
      if (!alive) return;
      const ch = (mod.default || mod).map((c) => {
        // 搜索索引只带检索字段，变体标记与出场顺序补自角色索引（charById 以字符串 id 为键）
        const meta = charById.get(String(c.id));
        return {
          ...c,
          kind: 'character',
          variantOf: meta?.variantOf ?? null,
          orderDate: meta?.orderDate ?? null,
        };
      });
      const rg = regions.map((r) => ({
        id: r.id,
        kind: 'region',
        name: r.name,
        nameEn: r.nameEn,
        aliases: [],
        title: r.description,
        intro: r.description,
        count: r.characters.length,
        theme: r.theme,
      }));
      const fc = factions.map((f) => ({
        id: f.id,
        kind: 'faction',
        name: f.name,
        nameEn: f.nameEn,
        aliases: [],
        title: f.blurb,
        intro: f.blurb,
        count: f.members.length,
        color: f.color,
        crest: f.crest,
      }));
      setDocs([...ch, ...rg, ...fc]);
    });
    return () => {
      alive = false;
    };
  }, [open, docs]);

  const fuse = useMemo(() => {
    if (!docs) return null;
    return new Fuse(docs, {
      includeScore: true,
      threshold: 0.36,
      ignoreLocation: true,
      minMatchCharLength: 1,
      keys: [
        { name: 'name', weight: 3 },
        { name: 'aliases', weight: 2.4 },
        { name: 'nameEn', weight: 2 },
        { name: 'title', weight: 1.1 },
        { name: 'factionName', weight: 1 },
        { name: 'boardName', weight: 1 },
        { name: 'path', weight: 0.5 },
        { name: 'element', weight: 0.5 },
        { name: 'intro', weight: 0.5 },
      ],
    });
  }, [docs]);

  const results = useMemo(() => {
    if (!fuse) return [];
    const q = query.trim();
    // 空查询时给一份「默认推荐」：按出场顺序最早登场、且非外观变体的 8 位角色
    if (!q) {
      return (docs || [])
        .filter((d) => d.kind === 'character' && !d.variantOf && d.orderDate)
        .sort((a, b) => (a.orderDate < b.orderDate ? -1 : a.orderDate > b.orderDate ? 1 : 0))
        .slice(0, 8);
    }
    return fuse.search(q).slice(0, 24).map((r) => r.item);
  }, [fuse, query, docs]);

  // 打开时复位
  useEffect(() => {
    if (!open) return;
    setCursor(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [open]);

  // 键盘导航
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === 'Enter') {
        const item = results[cursor];
        if (item) {
          e.preventDefault();
          go(item);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, cursor]);

  // 光标跟着滚动
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor, results]);

  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  function go(item) {
    onClose();
    setQuery('');
    if (item.kind === 'character') navigate(`/character/${item.id}`);
    else if (item.kind === 'region') navigate(`/?board=${item.id}`);
    else navigate(`/faction/${item.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="全局搜索">
      <button
        type="button"
        aria-label="关闭搜索"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void-900/80 backdrop-blur-sm"
      />

      <div className="glass-strong relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--c-primary)]" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入角色名、称号、阵营、板块…（支持拼音英文名）"
            className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
        </div>

        <div ref={listRef} className="no-scrollbar max-h-[58vh] overflow-y-auto p-2">
          {!docs ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">正在载入名册…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              没有匹配「{query}」的结果，换个关键词试试。
            </p>
          ) : (
            results.map((item, i) => (
              <ResultRow
                key={`${item.kind}-${item.id}`}
                item={item}
                active={i === cursor}
                onHover={() => setCursor(i)}
                onPick={() => go(item)}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>
            <kbd className="mr-1 rounded border border-white/10 px-1">↑</kbd>
            <kbd className="mr-2 rounded border border-white/10 px-1">↓</kbd>
            选择 · <kbd className="mx-1 rounded border border-white/10 px-1">Enter</kbd> 打开
          </span>
          <span>共 {docs ? docs.length : 0} 条索引</span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ item, active, onHover, onPick }) {
  const vars = item.theme ? themeVars(item.theme) : item.color ? { '--c-primary': item.color } : {};

  return (
    <button
      type="button"
      data-active={active}
      onMouseEnter={onHover}
      onClick={onPick}
      style={vars}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        active ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      {item.kind === 'character' ? (
        <img
          src={item.avatar}
          alt=""
          width={34}
          height={34}
          loading="lazy"
          className="h-[34px] w-[34px] shrink-0 rounded-full bg-void-900/70 ring-1"
          style={{ '--tw-ring-color': 'var(--c-primary)' }}
        />
      ) : (
        <span
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border text-sm"
          style={{ borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}
        >
          {item.kind === 'region' ? '◈' : item.crest || '✦'}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium text-slate-100">{item.name}</span>
          {item.nameEn ? <span className="truncate text-[10px] text-slate-500">{item.nameEn}</span> : null}
        </span>
        <span className="clamp-2 mt-0.5 block text-[11px] leading-snug text-slate-400">{item.title}</span>
      </span>

      <span className="shrink-0 text-[10px] text-slate-500">
        {item.kind === 'character' ? `${item.boardName || ''}` : `${KIND_LABEL[item.kind]} · ${item.count ?? ''}`}
      </span>
    </button>
  );
}
