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
      <div className="fixed top-0 right-0 left-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 max-w-[calc(100vw-7rem)] items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm">
            <Shirt className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-bold tracking-[0.08em] text-brand-900">
            PROGRIFES
          </span>
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </div>

      <aside
        className={cn(
          'sidebar-gradient fixed top-0 left-0 z-50 flex h-full w-[272px] shrink-0 flex-col border-r border-white/[0.06] shadow-[4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5 md:h-[88px] md:px-6">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-3 pr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-900 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <Shirt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-[0.06em] text-white">
                PROGRIFES
              </p>
              <p className="truncate text-[11px] font-medium text-white/45">
                Enterprise ERP
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

        <div className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6 md:px-4">
          <div className="mb-4 px-3">
            <div className="text-[10px] font-bold tracking-[0.16em] text-white/30 uppercase">
              Navegação
            </div>
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
                    'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                    active
                      ? 'bg-sidebar-active font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'font-medium text-white/55 hover:bg-sidebar-hover hover:text-white/90',
                  )}
                >
                  {active && (
                    <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
                  )}
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0',
                      active ? 'text-white' : 'text-white/40',
                    )}
                    strokeWidth={active ? 2.25 : 2}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mb-2 shrink-0 border-t border-white/[0.06] p-4 md:mb-0">
          <div className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.05]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/20 to-white/5 text-sm font-bold text-white ring-1 ring-white/10">
                {getInitials(user.name, user.email)}
              </div>
              <div className="flex min-w-0 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-white">
                  {user.name}
                </span>
                <span className="truncate text-[11px] font-medium text-white/40">
                  {roleLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-white/35 transition-colors hover:bg-red-500/10 hover:text-red-300"
              title="Sair da conta"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
