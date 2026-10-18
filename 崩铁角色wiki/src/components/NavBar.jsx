import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', label: '星海航路', hint: 'Home' },
  { to: '/relations', label: '人物关系', hint: 'Relations' },
]

export default function NavBar({ onOpenSearch }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-void-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative grid h-9 w-9 place-items-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300/80 to-fuchsia-400/70 blur-[6px] transition group-hover:blur-[10px]" />
            <svg viewBox="0 0 24 24" className="relative h-6 w-6 text-white">
              <path
                fill="currentColor"
                d="M12 1.6l2.05 6.35L20.4 10l-6.35 2.05L12 18.4l-2.05-6.35L3.6 10l6.35-2.05L12 1.6z"
                opacity="0.95"
              />
              <path fill="currentColor" d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6L15.5 18.5l2.6-.9L19 15z" opacity="0.6" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block title-display text-[15px] text-white">崩铁角色 Wiki</span>
            <span className="block text-[10px] tracking-[0.28em] text-white/40">ASTRAL ARCHIVE</span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'group relative rounded-lg px-3 py-2 text-sm transition',
                  isActive ? 'text-white' : 'text-white/60 hover:text-white',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  <span
                    className={[
                      'absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent transition-opacity',
                      isActive || location.pathname === item.to ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    ].join(' ')}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* 搜索按钮 */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-2 pl-3 pr-2 text-sm text-white/60 transition hover:border-cyan-300/60 hover:bg-white/10 hover:text-white sm:pr-3"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">搜索角色</span>
          <kbd className="hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/50 sm:inline">
            Ctrl K
          </kbd>
        </button>

        {/* 移动端菜单 */}
        <button
          type="button"
          aria-label="菜单"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/70 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* 移动端展开 */}
      {open && (
        <nav className="border-t border-white/10 bg-void-900/95 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm ${isActive ? 'bg-white/10 text-white' : 'text-white/65'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
