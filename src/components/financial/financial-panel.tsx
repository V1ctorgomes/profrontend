'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import { formatCurrency } from '@/lib/format';
import {
  btnDangerClass,
  btnPrimaryClass,
  cardClass,
  inputClass,
  selectClass,
  tableClass,
} from '@/lib/styles';

interface FinancialEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface Summary {
  manualIncome: number;
  manualExpense: number;
  salesRevenue: number;
  salesCount: number;
  balance: number;
}

export function FinancialPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getClientToken();
      const [list, sum] = await Promise.all([
        api<FinancialEntry[]>('/financial', { token }),
        api<Summary>('/financial/summary', { token }),
      ]);
      setEntries(list);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/financial', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          type: form.type,
          category: form.category,
          description: form.description,
          amount: Number(form.amount),
          date: form.date,
        }),
      });
      setForm((f) => ({
        ...f,
        category: '',
        description: '',
        amount: '',
      }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento?')) return;
    try {
      await api(`/financial/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Lançamentos de receitas e despesas administrativas"
      />
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          {summary && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className={`${cardClass} flex items-center gap-3 p-5`}>
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xs text-slate-500">Receitas</p>
                  <p className="text-xl font-semibold text-green-700">
                    {formatCurrency(summary.manualIncome)}
                  </p>
                </div>
              </div>
              <div className={`${cardClass} flex items-center gap-3 p-5`}>
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-xs text-slate-500">Despesas</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(summary.manualExpense)}
                  </p>
                </div>
              </div>
              <div className={`${cardClass} p-5`}>
                <p className="text-xs text-slate-500">Saldo (incl. vendas)</p>
                <p
                  className={`text-xl font-semibold ${
                    summary.balance >= 0 ? 'text-brand-900' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleCreate} className={`${cardClass} p-5`}>
            <h2 className="mb-4 font-semibold text-brand-900">Novo lançamento</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as 'income' | 'expense',
                  }))
                }
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
              <input
                className={inputClass}
                placeholder="Categoria"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                required
              />
              <input
                className={inputClass}
                placeholder="Descrição"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
              />
              <input
                className={inputClass}
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className={`${btnPrimaryClass} mt-4`}>
              <Plus className="h-4 w-4" />
              Registrar
            </button>
          </form>
          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">
                      {new Date(e.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          e.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {e.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{e.category}</td>
                    <td className="px-4 py-3">{e.description}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        className={btnDangerClass}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
