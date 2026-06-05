import { AlertTriangle, ShoppingBag, Tag, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/auth';
import type { UserDashboardMetrics } from '@/types/auth';

interface UserDashboardProps {
  metrics: UserDashboardMetrics;
}

export function UserDashboard({ metrics }: UserDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Dia</h1>
        <p className="text-slate-500">
          Acompanhe vendas, estoque e promoções ativas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Vendas do Dia"
          value={formatCurrency(metrics.salesTodayTotal)}
          description={`${metrics.salesTodayCount} vendas realizadas`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Quantidade de Vendas"
          value={String(metrics.salesTodayCount)}
          description="Transações concluídas hoje"
          icon={TrendingUp}
        />
        <StatCard
          title="Estoque Baixo"
          value={String(metrics.lowStockCount)}
          description="Itens que precisam de reposição"
          icon={AlertTriangle}
          className={
            metrics.lowStockCount > 0
              ? 'border-amber-500/30 bg-amber-500/5'
              : undefined
          }
        />
        <StatCard
          title="Promoções Ativas"
          value={String(metrics.activePromotions)}
          description="Campanhas em andamento"
          icon={Tag}
        />
      </div>
    </div>
  );
}
