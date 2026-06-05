'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Shirt, X } from 'lucide-react';
import { getNavigationForRole } from '@/config/navigation';
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface AppSidebarProps {
  user: User;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || 'U').trim();
  return source.substring(0, 2).toUpperCase();
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const items = getNavigationForRole(user.role);
  const roleLabel = user.role === 'ADMIN' ? 'Administrador' : 'Operador';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearCookie(AUTH_COOKIE);
    clearCookie(USER_COOKIE);
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== '/dashboard' && pathname.startsWith(href))
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-40 flex h-[60px] items-center justify-between border-b border-white/10 bg-sidebar px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-xl p-2 text-white/70 hover:bg-white/5 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Shirt className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-bold tracking-[0.12em] text-white">
            PROGRIFES
          </span>
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </div>

      <aside
        className={cn(
          'sidebar-premium fixed top-0 left-0 z-50 flex h-full w-[272px] shrink-0 flex-col border-r border-sidebar-border shadow-[8px_0_32px_rgba(0,0,0,0.18)] transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-sidebar-border px-5 md:h-[88px] md:px-6">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-3 pr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
              <Shirt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-[0.08em] text-white">
                PROGRIFES
              </p>
              <p className="truncate text-[10px] font-medium tracking-[0.16em] text-white/35 uppercase">
                SaaS Platform
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white/40 hover:text-white md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5 md:px-4">
          <div className="mb-3 px-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-white/30 uppercase">
              Workspace
            </p>
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                    active
                      ? 'bg-sidebar-active text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'text-white/50 hover:bg-sidebar-hover hover:text-white/90',
                  )}
                >
                  {active && (
                    <span className="absolute top-1/2 left-0 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                  )}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      active
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-white/[0.03] text-white/40 group-hover:bg-white/[0.06] group-hover:text-white/70',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 2} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-500/20 text-sm font-bold text-indigo-200 ring-1 ring-white/10">
                {getInitials(user.name, user.email)}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-white/40">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-2 text-white/35 transition-colors hover:bg-red-500/10 hover:text-red-300"
              title="Sair da conta"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
