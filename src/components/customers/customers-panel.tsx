'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Loader2, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { getClientToken } from '@/lib/client-auth';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
  loadingClass,
  tableClass,
  tableHeadClass,
  boxEffects,
} from '@/lib/styles';
import type { Customer, CustomerDetail } from '@/types/customer';

function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function CustomersPanel() {
  const { toast, fail } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    birthDate: '',
    notes: '',
  });

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const query = q ? `?search=${encodeURIComponent(q)}` : '';
      const data = await api<Customer[]>(`/customers${query}`, {
        token: getClientToken(),
      });
      setCustomers(data);
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/customers', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          name: form.name,
          cpf: form.cpf,
          phone: form.phone || undefined,
          birthDate: form.birthDate || undefined,
          notes: form.notes || undefined,
        }),
      });
      const name = form.name;
      setForm({ name: '', cpf: '', phone: '', birthDate: '', notes: '' });
      toast.success('Cliente cadastrado', `"${name}" foi adicionado.`);
      await load(search);
    } catch (err) {
      fail('Erro ao cadastrar', err, 'Erro ao cadastrar cliente');
    }
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      const data = await api<CustomerDetail>(`/customers/${id}`, {
        token: getClientToken(),
      });
      setSelected(data);
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar cliente');
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro e histórico de compras dos clientes"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(search);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Buscar por nome ou CPF"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className={btnSecondaryClass}>
              Buscar
            </button>
          </form>

          <div className={`${cardClass} overflow-x-auto`}>
            {loading ? (
              <div className={loadingClass}>
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando...
              </div>
            ) : (
              <table className={tableClass}>
                <thead className={tableHeadClass}>
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">CPF</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">Compras</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">{formatCpf(c.cpf)}</td>
                      <td className="px-4 py-3">{c.phone || '—'}</td>
                      <td className="px-4 py-3">{c.salesCount}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(c.id)}
                          className={btnSecondaryClass}
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Nenhum cliente cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleCreate} className={`${cardClass} p-5`}>
            <h2 className="mb-4 font-semibold text-brand-900">Novo cliente</h2>
            <div className="space-y-3">
              <input
                className={inputClass}
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className={inputClass}
                placeholder="CPF (somente números)"
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                required
              />
              <input
                className={inputClass}
                placeholder="Telefone (opcional)"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <input
                className={inputClass}
                type="date"
                value={form.birthDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthDate: e.target.value }))
                }
              />
              <textarea
                className={`${inputClass} min-h-20 resize-none`}
                placeholder="Observações (opcional)"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <button type="submit" className={`${btnPrimaryClass} mt-4 w-full`}>
              <Plus className="h-4 w-4" />
              Cadastrar cliente
            </button>
          </form>

          {(selected || detailLoading) && (
            <div className={`${cardClass} p-5`}>
              {detailLoading ? (
                <div className="flex items-center text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando histórico...
                </div>
              ) : selected ? (
                <>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-brand-900">{selected.name}</h3>
                      <p className="text-sm text-slate-500">
                        {formatCpf(selected.cpf)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-slate-500 hover:text-brand-900"
                      onClick={() => setSelected(null)}
                    >
                      Fechar
                    </button>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div className={`rounded-lg bg-slate-50 p-3 ${boxEffects}`}>
                      <p className="text-slate-500">Total gasto</p>
                      <p className="font-bold">
                        {formatCurrency(selected.stats.totalSpent)}
                      </p>
                    </div>
                    <div className={`rounded-lg bg-slate-50 p-3 ${boxEffects}`}>
                      <p className="text-slate-500">Ticket médio</p>
                      <p className="font-bold">
                        {formatCurrency(selected.stats.averageTicket)}
                      </p>
                    </div>
                  </div>
                  <h4 className="mb-2 text-sm font-semibold text-brand-900">
                    Histórico de compras
                  </h4>
                  {selected.sales.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhuma compra registrada</p>
                  ) : (
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {selected.sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="rounded-lg border border-slate-100 p-3 text-sm"
                        >
                          <div className="mb-1 flex justify-between font-medium">
                            <span>
                              {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span>{formatCurrency(sale.total)}</span>
                          </div>
                          <ul className="text-slate-500">
                            {sale.items.map((item) => (
                              <li key={item.id}>
                                {item.product.brand} {item.product.model} ({item.size}) x
                                {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
