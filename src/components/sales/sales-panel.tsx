'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Smartphone,
  Tag,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btnDangerClass,
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
  { value: 'CASH', label: 'Dinheiro', icon: Banknote },
  { value: 'PIX', label: 'PIX', icon: Smartphone },
  { value: 'CREDIT', label: 'Crédito', icon: CreditCard },
  { value: 'DEBIT', label: 'Débito', icon: Wallet },
] as const;

function calcDiscount(subtotal: number, promo: Promotion | undefined) {
  if (!promo) return 0;
  if (promo.type === 'PERCENTAGE') return (subtotal * promo.value) / 100;
  return Math.min(promo.value, subtotal);
}

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
  const [productSearch, setProductSearch] = useState('');
  const [addForm, setAddForm] = useState({
    productId: '',
    size: '',
    quantity: '1',
  });
  const [payments, setPayments] = useState([{ method: 'CASH', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [showRecentSales, setShowRecentSales] = useState(false);

  const selectedProduct = products.find((p) => p.id === addForm.productId);
  const sizes = selectedProduct?.stockItems?.filter((s) => s.quantity > 0) ?? [];

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.model.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [cart],
  );

  const selectedPromotion = promotions.find((p) => p.id === promotionId);
  const discount = calcDiscount(subtotal, selectedPromotion);
  const total = Math.max(0, subtotal - discount);

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
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

  useEffect(() => {
    if (total <= 0) return;
    setPayments((prev) => {
      if (prev.length !== 1 || prev[0].amount) return prev;
      return [{ method: prev[0].method, amount: total.toFixed(2) }];
    });
  }, [total]);

  function addToCart() {
    const product = products.find((p) => p.id === addForm.productId);
    if (!product) return;
    if (!addForm.size) {
      toast.error('Selecione o tamanho', 'Escolha um tamanho antes de adicionar');
      return;
    }
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
        (i) => i.productId === addForm.productId && i.size === addForm.size,
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
    setAddForm((f) => ({ ...f, quantity: '1' }));
  }

  function updateCartQty(index: number, delta: number) {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      if (newQty > item.maxQty) {
        toast.error('Estoque insuficiente', `Máximo ${item.maxQty} unidades`);
        return prev;
      }
      next[index] = { ...item, quantity: newQty };
      return next;
    });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setCart([]);
    setPayments([{ method: 'CASH', amount: '' }]);
    setPromotionId('');
    setCustomerId('');
  }

  function fillPaymentTotal() {
    setPayments((prev) => {
      if (prev.length === 0) return [{ method: 'CASH', amount: total.toFixed(2) }];
      const next = [...prev];
      next[0] = { ...next[0], amount: total.toFixed(2) };
      return next;
    });
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
      clearCart();
      toast.success('Venda registrada', 'Venda registrada com sucesso!');
      await load();
    } catch (err) {
      fail('Erro ao finalizar venda', err, 'Erro ao finalizar venda');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="PDV — Ponto de Venda"
        description="Registre vendas de forma rápida"
        action={
          cart.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Nova venda
            </button>
          ) : undefined
        }
      />
      <PageContent>
        {loading ? (
          <div className={loadingClass}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando PDV...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
              {/* Coluna esquerda — produto + carrinho */}
              <div className="flex flex-col gap-4">
                <div className={`${cardClass} overflow-hidden`}>
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-900 uppercase">
                      <Plus className="h-4 w-4" />
                      Adicionar produto
                    </h2>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="relative">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        placeholder="Buscar por marca, modelo ou categoria..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

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
                      {filteredProducts.length === 0 && (
                        <option value="">Nenhum produto encontrado</option>
                      )}
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand.name} — {p.model} ({formatCurrency(p.salePrice)})
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-brand-900">
                              {selectedProduct.brand.name} — {selectedProduct.model}
                            </p>
                            <p className="text-sm text-slate-500">
                              {selectedProduct.category.name} ·{' '}
                              {formatCurrency(selectedProduct.salePrice)}
                            </p>
                          </div>
                          <span className="rounded-full bg-brand-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                            {selectedProduct.totalStock} em estoque
                          </span>
                        </div>

                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Tamanho
                        </p>
                        {sizes.length === 0 ? (
                          <p className="text-sm text-amber-600">Sem estoque disponível</p>
                        ) : (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {sizes.map((s) => (
                              <button
                                key={s.size}
                                type="button"
                                onClick={() =>
                                  setAddForm((f) => ({ ...f, size: s.size }))
                                }
                                className={cn(
                                  'min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-semibold transition-all',
                                  addForm.size === s.size
                                    ? 'border-brand-900 bg-brand-900 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50',
                                )}
                              >
                                {s.size}
                                <span className="ml-1 text-xs font-normal opacity-75">
                                  ({s.quantity})
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                setAddForm((f) => ({
                                  ...f,
                                  quantity: String(Math.max(1, Number(f.quantity) - 1)),
                                }))
                              }
                              className="flex h-11 w-11 items-center justify-center text-slate-500 hover:bg-slate-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              className="h-11 w-14 border-x border-slate-200 text-center text-sm font-semibold outline-none"
                              type="number"
                              min="1"
                              value={addForm.quantity}
                              onChange={(e) =>
                                setAddForm((f) => ({ ...f, quantity: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAddForm((f) => ({
                                  ...f,
                                  quantity: String(Number(f.quantity) + 1),
                                }))
                              }
                              className="flex h-11 w-11 items-center justify-center text-slate-500 hover:bg-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={addToCart}
                            disabled={!addForm.size || sizes.length === 0}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-900 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Adicionar ao carrinho
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`${cardClass} flex min-h-[320px] flex-1 flex-col overflow-hidden`}>
                  <div className="flex items-center justify-between border-b border-slate-200 bg-brand-900 px-5 py-3 text-white">
                    <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                      <Receipt className="h-4 w-4" />
                      Carrinho
                    </h2>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">
                      {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {cart.length === 0 ? (
                      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-slate-400">
                        <ShoppingCart className="h-12 w-12 opacity-40" />
                        <p className="text-sm">Nenhum item no carrinho</p>
                        <p className="text-xs">Selecione um produto acima para começar</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {cart.map((item, idx) => (
                          <li
                            key={`${item.productId}-${item.size}`}
                            className="flex items-center gap-3 px-3 py-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-brand-900">
                                {item.productName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Tam. {item.size} · {formatCurrency(item.unitPrice)} un.
                              </p>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => updateCartQty(idx, -1)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-white"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(idx, 1)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-white"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="w-20 text-right text-sm font-bold text-brand-900">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className={btnDangerClass}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna direita — checkout PDV */}
              <form
                onSubmit={handleSale}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-brand-950 text-white shadow-lg"
              >
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs font-medium tracking-widest text-white/50 uppercase">
                    Total da venda
                  </p>
                  <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
                    {formatCurrency(total)}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto</span>
                        <span>- {formatCurrency(discount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase">
                      <User className="h-3.5 w-3.5" />
                      Cliente
                    </label>
                    <select
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                    >
                      <option value="" className="text-brand-900">
                        Consumidor final
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id} className="text-brand-900">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase">
                      <Tag className="h-3.5 w-3.5" />
                      Promoção
                    </label>
                    <select
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={promotionId}
                      onChange={(e) => setPromotionId(e.target.value)}
                    >
                      <option value="" className="text-brand-900">
                        Sem promoção
                      </option>
                      {promotions.map((p) => (
                        <option key={p.id} value={p.id} className="text-brand-900">
                          {p.name} (
                          {p.type === 'PERCENTAGE' ? `${p.value}%` : formatCurrency(p.value)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                        Pagamento
                      </p>
                      <button
                        type="button"
                        onClick={fillPaymentTotal}
                        className="text-xs font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
                      >
                        Usar total
                      </button>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {paymentMethods.map((m) => {
                        const Icon = m.icon;
                        const active = payments[0]?.method === m.value;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() =>
                              setPayments((prev) => {
                                const next = [...prev];
                                next[0] = { ...next[0], method: m.value };
                                return next;
                              })
                            }
                            className={cn(
                              'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all',
                              active
                                ? 'border-white bg-white text-brand-900'
                                : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>

                    {payments.map((pay, idx) => (
                      <div key={idx} className="mb-2 flex gap-2">
                        <input
                          className="h-12 flex-1 rounded-lg border border-white/10 bg-white px-3 text-lg font-bold text-brand-900 outline-none focus:ring-2 focus:ring-white/30"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
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
                            className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 text-red-300 hover:bg-white/10"
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
                      className="mt-1 text-xs font-medium text-white/60 hover:text-white"
                    >
                      + Dividir pagamento
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 p-5">
                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Receipt className="h-5 w-5" />
                        Finalizar venda · {formatCurrency(total)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className={`${cardClass} overflow-hidden`}>
              <button
                type="button"
                onClick={() => setShowRecentSales((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-brand-900 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Vendas recentes ({sales.length})
                </span>
                <span className="text-xs text-slate-500">
                  {showRecentSales ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>
              {showRecentSales && (
                <div className="overflow-x-auto border-t border-slate-100">
                  <table className={tableClass}>
                    <thead className={tableHeadClass}>
                      <tr>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Itens</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Pagamentos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 10).map((s) => (
                        <tr key={s.id} className="border-b border-slate-50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(s.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">{s.customer?.name ?? '—'}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600">
                            {s.items
                              .map(
                                (i) =>
                                  `${i.product.brand.name} ${i.product.model} (${i.size}) x${i.quantity}`,
                              )
                              .join(', ')}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {formatCurrency(s.total)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {s.payments
                              .map(
                                (p) =>
                                  `${paymentMethods.find((m) => m.value === p.method)?.label ?? p.method}: ${formatCurrency(p.amount)}`,
                              )
                              .join(' · ')}
                          </td>
                        </tr>
                      ))}
                      {sales.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            Nenhuma venda registrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </PageContent>
    </>
  );
}
