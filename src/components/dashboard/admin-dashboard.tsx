import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  DollarSign,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/format';
import type { AdminDashboardMetrics, User } from '@/types/auth';

interface AdminDashboardProps {
  metrics: AdminDashboardMetrics;
  user: User;
}

const quickActions = [
  { href: '/dashboard/vendas', label: 'Nova venda', icon: ShoppingCart },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/estoque', label: 'Estoque', icon: Boxes },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function AdminDashboard({ metrics, user }: AdminDashboardProps) {
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <section className="hero-glow glass-card relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Command Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="gradient-text">Visão executiva</span>
              <span className="text-brand-900">, {firstName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
              Inteligência operacional em tempo real para decisões de alto impacto
              em vendas, estoque e performance financeira.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
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
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-indigo-500 uppercase">
              Performance
            </p>
            <h2 className="text-lg font-semibold text-brand-900">Indicadores principais</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Faturamento Bruto"
            value={formatCurrency(metrics.grossRevenue)}
            description="Total acumulado de vendas"
            icon={DollarSign}
            accent="indigo"
          />
          <StatCard
            title="Faturamento Líquido"
            value={formatCurrency(metrics.netRevenue)}
            description="Após descontos e devoluções"
            icon={Wallet}
            accent="sky"
          />
          <StatCard
            title="Lucro"
            value={formatCurrency(metrics.profit)}
            description="Resultado operacional"
            icon={TrendingUp}
            accent="emerald"
          />
          <StatCard
            title="Ticket Médio"
            value={formatCurrency(metrics.averageTicket)}
            description={`${metrics.totalSales} vendas realizadas`}
            icon={ShoppingBag}
            accent="default"
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold tracking-[0.14em] text-indigo-500 uppercase">
            Operação
          </p>
          <h2 className="text-lg font-semibold text-brand-900">Monitoramento do dia</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            title="Vendas Hoje"
            value={formatCurrency(metrics.salesToday.total)}
            description={`${metrics.salesToday.count} transações concluídas`}
            icon={Receipt}
            accent="indigo"
          />
          <StatCard
            title="Produtos em Estoque"
            value={String(metrics.stockQuantity)}
            description="Unidades disponíveis na operação"
            icon={Package}
            accent="sky"
          />
          <StatCard
            title="Estoque Baixo"
            value={String(metrics.lowStockCount)}
            description="Itens abaixo do nível mínimo"
            icon={AlertTriangle}
            accent={metrics.lowStockCount > 0 ? 'amber' : 'emerald'}
            className={
              metrics.lowStockCount > 0
                ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white'
                : undefined
            }
          />
        </div>
      </section>
    </div>
  );
}
