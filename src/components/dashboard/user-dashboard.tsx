import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/format';
import type { User, UserDashboardMetrics } from '@/types/auth';

interface UserDashboardProps {
  metrics: UserDashboardMetrics;
  user: User;
}

const quickActions = [
  { href: '/dashboard/vendas', label: 'Abrir PDV', icon: ShoppingCart },
  { href: '/dashboard/clientes', label: 'Clientes', icon: ShoppingBag },
  { href: '/dashboard/promocoes', label: 'Promoções', icon: Tag },
];

export function UserDashboard({ metrics, user }: UserDashboardProps) {
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <section className="hero-glow glass-card relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Painel operacional
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="gradient-text">Seu dia</span>
              <span className="text-brand-900">, {firstName}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-base">
              Acompanhe vendas, alertas de estoque e campanhas ativas em um fluxo
              rápido e intuitivo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-brand-900 shadow-sm transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <Icon className="h-4 w-4 text-indigo-500" />
                  {action.label}
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold tracking-[0.14em] text-indigo-500 uppercase">
            Hoje
          </p>
          <h2 className="text-lg font-semibold text-brand-900">Métricas em tempo real</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Vendas do Dia"
            value={formatCurrency(metrics.salesTodayTotal)}
            description={`${metrics.salesTodayCount} vendas realizadas`}
            icon={ShoppingBag}
            accent="indigo"
          />
          <StatCard
            title="Quantidade de Vendas"
            value={String(metrics.salesTodayCount)}
            description="Transações concluídas hoje"
            icon={TrendingUp}
            accent="sky"
          />
          <StatCard
            title="Estoque Baixo"
            value={String(metrics.lowStockCount)}
            description="Itens que precisam de reposição"
            icon={AlertTriangle}
            accent={metrics.lowStockCount > 0 ? 'amber' : 'emerald'}
            className={
              metrics.lowStockCount > 0
                ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white'
                : undefined
            }
          />
          <StatCard
            title="Promoções Ativas"
            value={String(metrics.activePromotions)}
            description="Campanhas em andamento"
            icon={Tag}
            accent="rose"
          />
        </div>
      </section>
    </div>
  );
}
