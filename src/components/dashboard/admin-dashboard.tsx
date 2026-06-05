import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/format';
import type { AdminDashboardMetrics } from '@/types/auth';

interface AdminDashboardProps {
  metrics: AdminDashboardMetrics;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-slate-500">
          Indicadores financeiros e operacionais da loja
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Faturamento Bruto"
          value={formatCurrency(metrics.grossRevenue)}
          description="Total acumulado de vendas"
          icon={DollarSign}
        />
        <StatCard
          title="Faturamento Líquido"
          value={formatCurrency(metrics.netRevenue)}
          description="Após descontos e devoluções"
          icon={Wallet}
        />
        <StatCard
          title="Lucro"
          value={formatCurrency(metrics.profit)}
          description="Resultado operacional"
          icon={TrendingUp}
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(metrics.averageTicket)}
          description={`${metrics.totalSales} vendas realizadas`}
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Vendas Hoje"
          value={formatCurrency(metrics.salesToday.total)}
          description={`${metrics.salesToday.count} vendas no dia`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Produtos em Estoque"
          value={String(metrics.stockQuantity)}
          description="Unidades disponíveis"
          icon={Package}
        />
        <StatCard
          title="Estoque Baixo"
          value={String(metrics.lowStockCount)}
          description="Produtos abaixo do mínimo"
          icon={AlertTriangle}
          className={
            metrics.lowStockCount > 0
              ? 'border-amber-500/30 bg-amber-500/5'
              : undefined
          }
        />
      </div>
    </div>
  );
}
