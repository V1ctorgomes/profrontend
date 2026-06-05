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
      <div className="fixed top-0 right-0 left-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-50"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 max-w-[calc(100vw-7rem)] items-center justify-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-white">
            <Shirt className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-bold tracking-tight text-brand-900 sm:text-base">
            PROGRIFES
          </span>
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </div>

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-100 px-6 md:h-[88px]">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2.5 pr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-white">
              <Shirt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-brand-900">
                PROGRIFES
              </p>
              <p className="truncate text-[11px] text-slate-500">Gestão de Moda</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-600 md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-6">
          <div className="mb-3 px-2">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Menu Principal
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
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                    active
                      ? 'bg-brand-50 font-semibold text-brand-700'
                      : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-950',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0',
                      active ? 'text-brand-600' : 'text-slate-400',
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mb-2 shrink-0 border-t border-slate-100 p-4 md:mb-0">
          <div className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-brand-600 shadow-sm">
                {getInitials(user.name, user.email)}
              </div>
              <div className="flex min-w-0 flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-brand-950">
                  {user.name}
                </span>
                <span className="truncate text-[11px] font-medium text-slate-500">
                  {roleLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 transition-colors group-hover:text-red-500 hover:bg-red-50"
              title="Sair da conta"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
