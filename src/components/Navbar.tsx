import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../context/useAuth'
import { Logo } from './Logo'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, loading, logout } = useAuth()
  const pathname = window.location.pathname

  const handleSignOut = () => {
    logout()
    setMenuOpen(false)
    window.location.assign('/')
  }

  const closeMenu = () => setMenuOpen(false)
  const activeLinkClass = (active: boolean) =>
    `text-[0.92rem] font-medium transition-colors duration-200 ${
      active ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-950'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-[4.5rem] max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="DownloadIt home" onClick={closeMenu}>
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#download" className={activeLinkClass(pathname === '/')}>Download</a>
          <a href="/#features" className={activeLinkClass(false)}>Features</a>
        </div>

        {!loading && (
          <div className="hidden items-center gap-5 md:flex">
            {isAuthenticated ? (
              <>
                <a
                  href="/history"
                  aria-current={pathname === '/history' ? 'page' : undefined}
                  className={activeLinkClass(pathname === '/history')}
                >
                  History
                </a>
                <details className="group relative">
                  <summary className="cursor-pointer list-none text-[0.92rem] font-medium text-zinc-600 transition-colors hover:text-zinc-900">Account</summary>
                  <div className="absolute right-0 top-full z-20 mt-3 w-64 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
                    <p className="truncate text-sm text-zinc-600">{user?.email}</p>
                    <button type="button" onClick={handleSignOut} className="mt-3 text-sm font-medium text-zinc-900 hover:underline">
                      Sign Out
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <a
                href="/login"
                aria-current={pathname === '/login' ? 'page' : undefined}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-[0.92rem] font-medium text-white transition-all duration-200 hover:brightness-95"
              >
                Sign In
              </a>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-zinc-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-4 py-4">
            <a href="/#download" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950">Download</a>
            <a href="/#features" onClick={closeMenu} className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950">Features</a>
            {!loading && (isAuthenticated ? (
              <>
                <a
                  href="/history"
                  aria-current={pathname === '/history' ? 'page' : undefined}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                >
                  History
                </a>
                <div className="rounded-xl px-3 py-2 text-sm text-zinc-600">
                  <p className="font-medium text-zinc-900">Account</p>
                  <p className="mt-1 break-all">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/login"
                aria-current={pathname === '/login' ? 'page' : undefined}
                onClick={closeMenu}
                className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Sign In
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
