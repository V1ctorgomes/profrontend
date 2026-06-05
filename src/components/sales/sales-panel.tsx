'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import { formatCurrency } from '@/lib/format';
import {
  btnDangerClass,
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
  loadingClass,
  selectClass,
  tableClass,
  tableHeadClass,
} from '@/lib/styles';
import type { Product } from '@/types/catalog';
import type { Customer } from '@/types/customer';

interface Promotion {
  id: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_VALUE';
  value: number;
}

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  maxQty: number;
}

interface Sale {
  id: string;
  total: number;
  discount: number;
  createdAt: string;
  customer: { name: string } | null;
  user: { name: string };
  items: {
    size: string;
    quantity: number;
    unitPrice: number;
    product: { model: string; brand: { name: string } };
  }[];
  payments: { method: string; amount: number }[];
}

const paymentMethods = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT', label: 'Cartão crédito' },
  { value: 'DEBIT', label: 'Cartão débito' },
];

export function SalesPanel() {
  const { toast, fail } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [promotionId, setPromotionId] = useState('');
  const [addForm, setAddForm] = useState({
    productId: '',
    size: '',
    quantity: '1',
  });
  const [payments, setPayments] = useState([
    { method: 'CASH', amount: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === addForm.productId);
  const sizes = selectedProduct?.stockItems?.map((s) => s.size) ?? [];

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [cart],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [prods, custs, promos, salesData] = await Promise.all([
        api<Product[]>('/products', { token }),
        api<Customer[]>('/customers', { token }),
        api<Promotion[]>('/promotions/active', { token }),
        api<Sale[]>('/sales', { token }),
      ]);
      setProducts(prods);
      setCustomers(custs);
      setPromotions(promos);
      setSales(salesData);
      setAddForm((f) => ({
        ...f,
        productId: f.productId || prods[0]?.id || '',
      }));
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  function addToCart() {
    const product = products.find((p) => p.id === addForm.productId);
    if (!product) return;
    const stock = product.stockItems?.find((s) => s.size === addForm.size);
    const qty = Number(addForm.quantity);
    if (!stock || qty <= 0 || qty > stock.quantity) {
      toast.error(
        'Estoque insuficiente',
        `Estoque insuficiente para tamanho ${addForm.size}`,
      );
      return;
    }
    const name = `${product.brand.name} — ${product.model}`;
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === addForm.productId && i.size === addForm.size,
      );
      if (idx >= 0) {
        const next = [...prev];
        const newQty = next[idx].quantity + qty;
        if (newQty > stock.quantity) {
          toast.error('Estoque insuficiente', 'Quantidade excede estoque');
          return prev;
        }
        next[idx] = { ...next[idx], quantity: newQty };
        return next;
      }
      return [
        ...prev,
        {
          productId: addForm.productId,
          productName: name,
          size: addForm.size,
          quantity: qty,
          unitPrice: product.salePrice,
          maxQty: stock.quantity,
        },
      ];
    });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSale(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Carrinho vazio', 'Adicione itens ao carrinho');
      return;
    }
    const parsedPayments = payments
      .filter((p) => p.amount)
      .map((p) => ({ method: p.method, amount: Number(p.amount) }));
    if (parsedPayments.length === 0) {
      toast.error('Pagamento obrigatório', 'Informe ao menos um pagamento');
      return;
    }
    setSubmitting(true);
    try {
      await api('/sales', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          customerId: customerId || undefined,
          promotionId: promotionId || undefined,
          items: cart.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          payments: parsedPayments,
        }),
      });
      setCart([]);
      setPayments([{ method: 'CASH', amount: '' }]);
      setPromotionId('');
      toast.success('Venda registrada', 'Venda registrada com sucesso!');
      await load();
    } catch (err) {
      fail('Erro ao finalizar venda', err, 'Erro ao finalizar venda');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendas (PDV)"
        description="Ponto de venda com carrinho, promoções e múltiplos pagamentos"
      />
      {loading ? (
        <div className={loadingClass}>
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`${cardClass} p-5`}>
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </h2>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <select
                  className={selectClass}
                  value={addForm.productId}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      productId: e.target.value,
                      size: '',
                    }))
                  }
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand.name} — {p.model}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={addForm.size}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, size: e.target.value }))
                  }
                >
                  <option value="">Tamanho</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s} (
                      {selectedProduct?.stockItems?.find((si) => si.size === s)
                        ?.quantity ?? 0}
                      )
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    value={addForm.quantity}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={addToCart}
                    className={btnSecondaryClass}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">Carrinho vazio</p>
              ) : (
                <ul className="space-y-2">
                  {cart.map((item, idx) => (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <span>
                        {item.productName} ({item.size}) x{item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className={btnDangerClass}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-right text-lg font-semibold">
                Subtotal: {formatCurrency(subtotal)}
              </p>
            </div>
            <form onSubmit={handleSale} className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold text-brand-900">Finalizar venda</h2>
              <div className="space-y-3">
                <select
                  className={selectClass}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Cliente (opcional)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={promotionId}
                  onChange={(e) => setPromotionId(e.target.value)}
                >
                  <option value="">Sem promoção</option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (
                      {p.type === 'PERCENTAGE' ? `${p.value}%` : `R$ ${p.value}`}
                      )
                    </option>
                  ))}
                </select>
                {payments.map((pay, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      className={selectClass}
                      value={pay.method}
                      onChange={(e) => {
                        const next = [...payments];
                        next[idx] = { ...next[idx], method: e.target.value };
                        setPayments(next);
                      }}
                    >
                      {paymentMethods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Valor"
                      value={pay.amount}
                      onChange={(e) => {
                        const next = [...payments];
                        next[idx] = { ...next[idx], amount: e.target.value };
                        setPayments(next);
                      }}
                    />
                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPayments((p) => p.filter((_, i) => i !== idx))
                        }
                        className={btnDangerClass}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPayments((p) => [...p, { method: 'PIX', amount: '' }])
                  }
                  className={btnSecondaryClass}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar pagamento
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className={`${btnPrimaryClass} mt-4 w-full`}
              >
                {submitting ? 'Processando...' : 'Finalizar venda'}
              </button>
            </form>
          </div>
          <div className={`${cardClass} overflow-x-auto`}>
            <h2 className="border-b border-slate-100 px-4 py-3 font-semibold text-brand-900">
              Vendas recentes
            </h2>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Desconto</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamentos</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">
                      {new Date(s.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">{s.customer?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {s.items
                        .map(
                          (i) =>
                            `${i.product.brand.name} ${i.product.model} (${i.size}) x${i.quantity}`,
                        )
                        .join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      {s.discount > 0 ? formatCurrency(s.discount) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {s.payments
                        .map(
                          (p) =>
                            `${paymentMethods.find((m) => m.value === p.method)?.label ?? p.method}: ${formatCurrency(p.amount)}`,
                        )
                        .join(' / ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
