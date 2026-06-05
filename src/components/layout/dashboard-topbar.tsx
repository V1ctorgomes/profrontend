'use client';

import { usePathname } from 'next/navigation';
import { Bell, Sparkles } from 'lucide-react';
import type { User } from '@/types/auth';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/vendas': 'Vendas',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/produtos': 'Produtos',
  '/dashboard/estoque': 'Estoque',
  '/dashboard/compras': 'Compras',
  '/dashboard/promocoes': 'Promoções',
  '/dashboard/caixa': 'Caixa',
  '/dashboard/financeiro': 'Financeiro',
  '/dashboard/relatorios': 'Relatórios',
  '/dashboard/usuarios': 'Usuários',
};

function getPageTitle(pathname: string) {
  if (routeLabels[pathname]) return routeLabels[pathname];
  const match = Object.entries(routeLabels)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path));
  return match?.[1] ?? 'Progrifes';
}

function formatDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

interface DashboardTopbarProps {
  user: User;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  const pathname = usePathname() ?? '/dashboard';
  const pageTitle = getPageTitle(pathname);
  const isHome = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200/60 bg-white/70 px-8 py-4 backdrop-blur-xl md:block">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {!isHome && (
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
              Progrifes ERP
            </p>
          )}
          <h2 className="truncate text-lg font-semibold tracking-tight text-brand-900">
            {isHome ? `Olá, ${user.name.split(' ')[0]}` : pageTitle}
          </h2>
          <p className="truncate text-sm text-slate-500">
            {isHome
              ? 'Aqui está o resumo inteligente da sua operação hoje.'
              : formatDate()}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sistema online
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-brand-900"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-xs font-medium text-indigo-700 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            {user.role === 'ADMIN' ? 'Plano Enterprise' : 'Operação ativa'}
          </div>
        </div>
      </div>
    </header>
  );
}
