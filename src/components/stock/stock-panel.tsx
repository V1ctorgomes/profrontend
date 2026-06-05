'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import {
  btnPrimaryClass,
  cardClass,
  inputClass,
  loadingClass,
  selectClass,
  tableClass,
  tableHeadClass,
} from '@/lib/styles';
import type { Product } from '@/types/catalog';
import type { StockMovement, StockOverviewItem } from '@/types/stock';

const MOVEMENT_TYPES = [
  { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual (+/-)' },
  { value: 'PURCHASE_ENTRY', label: 'Entrada (compra)' },
  { value: 'RETURN_ENTRY', label: 'Entrada (devolução)' },
  { value: 'LOSS_EXIT', label: 'Saída (perda)' },
  { value: 'DAMAGE_EXIT', label: 'Saída (avaria)' },
];

export function StockPanel() {
  const { toast, fail } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<StockOverviewItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [sizeForm, setSizeForm] = useState({
    productId: '',
    size: '',
    quantity: '0',
  });

  const [movementForm, setMovementForm] = useState({
    productId: '',
    size: '',
    quantity: '',
    type: 'MANUAL_ADJUSTMENT',
    reason: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [o, m, p] = await Promise.all([
        api<StockOverviewItem[]>('/stock', { token }),
        api<StockMovement[]>('/stock/movements?limit=30', { token }),
        api<Product[]>('/products', { token }),
      ]);
      setOverview(o);
      setMovements(m);
      setProducts(p);
      setSizeForm((f) => ({ ...f, productId: f.productId || p[0]?.id || '' }));
      setMovementForm((f) => ({
        ...f,
        productId: f.productId || p[0]?.id || '',
      }));
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddSize(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/stock/items', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          productId: sizeForm.productId,
          size: sizeForm.size,
          quantity: Number(sizeForm.quantity),
        }),
      });
      setSizeForm((f) => ({ ...f, size: '', quantity: '0' }));
      toast.success('Tamanho cadastrado', `Tamanho ${sizeForm.size} adicionado ao estoque.`);
      await load();
    } catch (err) {
      fail('Erro ao adicionar', err, 'Erro ao adicionar tamanho');
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    try {
      const qty = Number(movementForm.quantity);
      await api('/stock/movements', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          productId: movementForm.productId,
          size: movementForm.size,
          quantity:
            movementForm.type === 'MANUAL_ADJUSTMENT' ? qty : Math.abs(qty),
          type: movementForm.type,
          reason: movementForm.reason || undefined,
        }),
      });
      setMovementForm((f) => ({
        ...f,
        size: '',
        quantity: '',
        reason: '',
      }));
      toast.success('Movimentação registrada');
      await load();
    } catch (err) {
      fail('Erro na movimentação', err, 'Erro na movimentação');
    }
  }

  const lowStockCount = overview.filter((p) => p.isLowStock).length;

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Controle de quantidades por tamanho e movimentações"
        action={
          lowStockCount > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {lowStockCount} produto(s) com estoque baixo
            </div>
          ) : undefined
        }
      />

      {loading ? (
        <div className={loadingClass}>
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleAddSize} className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold text-brand-900">
                Adicionar tamanho
              </h2>
              <div className="space-y-3">
                <select
                  className={selectClass}
                  value={sizeForm.productId}
                  onChange={(e) =>
                    setSizeForm((f) => ({ ...f, productId: e.target.value }))
                  }
                  required
                >
                  <option value="">Produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand.name} — {p.model}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  placeholder="Tamanho (P, M, G, 38...)"
                  value={sizeForm.size}
                  onChange={(e) =>
                    setSizeForm((f) => ({ ...f, size: e.target.value }))
                  }
                  required
                />
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="Quantidade inicial"
                  value={sizeForm.quantity}
                  onChange={(e) =>
                    setSizeForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  required
                />
              </div>
              <button type="submit" className={`${btnPrimaryClass} mt-4 w-full`}>
                <Plus className="h-4 w-4" />
                Cadastrar tamanho
              </button>
            </form>

            <form onSubmit={handleMovement} className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold text-brand-900">Movimentação</h2>
              <div className="space-y-3">
                <select
                  className={selectClass}
                  value={movementForm.productId}
                  onChange={(e) =>
                    setMovementForm((f) => ({ ...f, productId: e.target.value }))
                  }
                  required
                >
                  <option value="">Produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand.name} — {p.model}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  placeholder="Tamanho"
                  value={movementForm.size}
                  onChange={(e) =>
                    setMovementForm((f) => ({ ...f, size: e.target.value }))
                  }
                  required
                />
                <select
                  className={selectClass}
                  value={movementForm.type}
                  onChange={(e) =>
                    setMovementForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  type="number"
                  placeholder={
                    movementForm.type === 'MANUAL_ADJUSTMENT'
                      ? 'Quantidade (+ ou -)'
                      : 'Quantidade'
                  }
                  value={movementForm.quantity}
                  onChange={(e) =>
                    setMovementForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  required
                />
                <input
                  className={inputClass}
                  placeholder="Motivo (opcional)"
                  value={movementForm.reason}
                  onChange={(e) =>
                    setMovementForm((f) => ({ ...f, reason: e.target.value }))
                  }
                />
              </div>
              <button type="submit" className={`${btnPrimaryClass} mt-4 w-full`}>
                Registrar movimentação
              </button>
            </form>
          </div>

          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Tamanhos</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-50 ${
                      item.isLowStock ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">{item.brand.name}</td>
                    <td className="px-4 py-3">{item.category.name}</td>
                    <td className="px-4 py-3 font-medium">{item.model}</td>
                    <td className="px-4 py-3">
                      {item.stockItems.length === 0 ? (
                        <span className="text-slate-400">Sem tamanhos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.stockItems.map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs"
                            >
                              {s.size}: {s.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        item.isLowStock ? 'text-amber-600' : ''
                      }`}
                    >
                      {item.totalStock}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${cardClass} overflow-x-auto`}>
            <h2 className="border-b border-slate-100 px-4 py-3 font-semibold text-brand-900">
              Últimas movimentações
            </h2>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Tam.</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(m.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {m.product.brand} {m.product.model}
                    </td>
                    <td className="px-4 py-3">{m.size}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {m.quantity > 0 ? '+' : ''}
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.type}</td>
                    <td className="px-4 py-3">{m.user.name}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
