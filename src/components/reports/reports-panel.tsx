'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import { formatCurrency } from '@/lib/format';
import { cardClass, inputClass, loadingClass, tableClass, tableHeadClass, btnPrimaryClass, boxEffects, metricBoxClass } from '@/lib/styles';

interface SalesReport {
  summary: {
    totalRevenue: number;
    grossSubtotal: number;
    totalDiscount: number;
    salesCount: number;
    averageTicket: number;
    costOfGoodsSold: number;
    grossProfit: number;
  };
  recentSales: {
    id: string;
    total: number;
    createdAt: string;
    customer: string;
    seller: string;
  }[];
  topProducts: {
    productId: string;
    model: string;
    brand: string;
    category: string;
    quantity: number;
    revenue: number;
  }[];
}

interface StockReport {
  totalProducts: number;
  lowStockCount: number;
  totalUnits: number;
  items: {
    id: string;
    model: string;
    brand: string;
    category: string;
    totalStock: number;
    minStock: number;
    isLowStock: boolean;
    salePrice: number;
  }[];
}

interface FinancialReport {
  salesRevenue: number;
  salesCount: number;
  purchasesTotal: number;
  purchasesCount: number;
  costOfGoodsSold: number;
  manualIncome: number;
  manualExpense: number;
  expensesByCategory: Record<string, number>;
  estimatedProfit: number;
}

export function ReportsPanel() {
  const { fail } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [stock, setStock] = useState<StockReport | null>(null);
  const [financial, setFinancial] = useState<FinancialReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString() ? `?${params}` : '';
      const [salesData, stockData, finData] = await Promise.all([
        api<SalesReport>(`/reports/sales${qs}`, { token }),
        api<StockReport>('/reports/stock', { token }),
        api<FinancialReport>(`/reports/financial${qs}`, { token }),
      ]);
      setSales(salesData);
      setStock(stockData);
      setFinancial(finData);
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [from, to, fail]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Visão consolidada de vendas, estoque e financeiro"
      />
      <PageContent>
      <div className={`${cardClass} mb-6 flex flex-wrap items-end gap-3 p-5`}>
        <div>
          <label className="mb-1 block text-xs text-slate-500">De</label>
          <input
            className={inputClass}
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Até</label>
          <input
            className={inputClass}
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={load}
          className={btnPrimaryClass}
        >
          Filtrar
        </button>
      </div>
      {loading ? (
        <div className={loadingClass}>
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          {sales && (
            <div className={`${cardClass} p-5`}>
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <BarChart3 className="h-5 w-5" />
                Vendas
              </h2>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Quantidade</p>
                  <p className="text-xl font-semibold">{sales.summary.salesCount}</p>
                </div>
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Faturamento</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(sales.summary.totalRevenue)}
                  </p>
                </div>
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Descontos</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(sales.summary.totalDiscount)}
                  </p>
                </div>
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Custo vendido</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(sales.summary.costOfGoodsSold)}
                  </p>
                </div>
                <div className={`rounded-lg bg-brand-50 px-4 py-3 ${boxEffects}`}>
                  <p className="text-xs text-brand-600">Lucro bruto</p>
                  <p className="text-xl font-semibold text-brand-900">
                    {formatCurrency(sales.summary.grossProfit)}
                  </p>
                </div>
                <div className={`rounded-lg bg-brand-50 px-4 py-3 ${boxEffects}`}>
                  <p className="text-xs text-brand-600">Ticket médio</p>
                  <p className="text-xl font-semibold text-brand-900">
                    {formatCurrency(sales.summary.averageTicket)}
                  </p>
                </div>
              </div>
              {sales.topProducts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className={tableClass}>
                    <thead className={tableHeadClass}>
                      <tr>
                        <th className="px-4 py-3">Produto</th>
                        <th className="px-4 py-3">Qtd vendida</th>
                        <th className="px-4 py-3">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.topProducts.map((p) => (
                        <tr key={p.productId} className="border-b border-slate-50">
                          <td className="px-4 py-3">
                            {p.brand} — {p.model}
                          </td>
                          <td className="px-4 py-3">{p.quantity}</td>
                          <td className="px-4 py-3">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {stock && (
            <div className={`${cardClass} overflow-x-auto`}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="font-semibold text-brand-900">Estoque</h2>
                <span className="text-sm text-slate-500">
                  {stock.totalUnits} un. · {stock.lowStockCount} em baixa
                </span>
              </div>
              <table className={tableClass}>
                <thead className={tableHeadClass}>
                  <tr>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Qtd</th>
                    <th className="px-4 py-3">Mín.</th>
                    <th className="px-4 py-3">Preço venda</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.items.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50">
                      <td className="px-4 py-3">
                        {s.brand} — {s.model}
                        {s.isLowStock && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{s.category}</td>
                      <td className="px-4 py-3">{s.totalStock}</td>
                      <td className="px-4 py-3">{s.minStock}</td>
                      <td className="px-4 py-3">{formatCurrency(s.salePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {financial && (
            <div className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold text-brand-900">Financeiro</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className={`rounded-lg bg-green-50 px-4 py-3 ${boxEffects}`}>
                  <p className="text-xs text-green-600">Receita vendas</p>
                  <p className="text-xl font-semibold text-green-700">
                    {formatCurrency(financial.salesRevenue)}
                  </p>
                </div>
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Custo vendido</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(financial.costOfGoodsSold)}
                  </p>
                </div>
                <div className={`rounded-lg bg-red-50 px-4 py-3 ${boxEffects}`}>
                  <p className="text-xs text-red-500">Compras (estoque)</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(financial.purchasesTotal)}
                  </p>
                </div>
                <div className={metricBoxClass}>
                  <p className="text-xs text-slate-500">Despesas manuais</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(financial.manualExpense)}
                  </p>
                </div>
                <div className={`rounded-lg bg-brand-50 px-4 py-3 ${boxEffects}`}>
                  <p className="text-xs text-brand-600">Lucro estimado</p>
                  <p className="text-xl font-semibold text-brand-900">
                    {formatCurrency(financial.estimatedProfit)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </PageContent>
    </>
  );
}
