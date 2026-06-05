'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import {
  btnDangerClass,
  btnPrimaryClass,
  cardClass,
  inputClass,
  loadingClass,
  selectClass,
  tableClass,
  tableHeadClass,
} from '@/lib/styles';

interface Promotion {
  id: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_VALUE';
  value: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

const typeLabels: Record<Promotion['type'], string> = {
  PERCENTAGE: 'Percentual (%)',
  FIXED_VALUE: 'Valor fixo (R$)',
};

export function PromotionsPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'PERCENTAGE' as Promotion['type'],
    value: '',
    startDate: '',
    endDate: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Promotion[]>('/promotions', {
        token: getClientToken(),
      });
      setPromotions(data);
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar');
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
      await api('/promotions', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          value: Number(form.value),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });
      const name = form.name;
      setForm({ name: '', type: 'PERCENTAGE', value: '', startDate: '', endDate: '' });
      toast.success('Promoção criada', `"${name}" foi adicionada.`);
      await load();
    } catch (err) {
      fail('Erro ao criar promoção', err, 'Erro ao criar promoção');
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      await api(`/promotions/${id}`, {
        method: 'PATCH',
        token: getClientToken(),
        body: JSON.stringify({ active: !active }),
      });
      toast.success(
        active ? 'Promoção desativada' : 'Promoção ativada',
      );
      await load();
    } catch (err) {
      fail('Erro ao atualizar', err, 'Erro ao atualizar');
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmDelete('Excluir promoção?', 'Esta promoção será removida permanentemente.'))) return;
    try {
      await api(`/promotions/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      toast.success('Promoção excluída');
      await load();
    } catch (err) {
      fail('Erro ao excluir', err, 'Erro ao excluir');
    }
  }

  return (
    <>
      <PageHeader
        title="Promoções"
        description="Gerencie descontos aplicados no PDV"
      />
      <PageContent>
      {loading ? (
        <div className={loadingClass}>
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleCreate} className={`${cardClass} p-5`}>
            <h2 className="mb-4 font-semibold text-brand-900">Nova promoção</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className={inputClass}
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as Promotion['type'],
                  }))
                }
              >
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
              />
              <input
                className={inputClass}
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                required
              />
              <input
                className={inputClass}
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className={`${btnPrimaryClass} mt-4`}>
              <Plus className="h-4 w-4" />
              Criar promoção
            </button>
          </form>
          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Período</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{typeLabels[p.type]}</td>
                    <td className="px-4 py-3">
                      {p.type === 'PERCENTAGE' ? `${p.value}%` : `R$ ${p.value}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(p.startDate).toLocaleDateString('pt-BR')} —{' '}
                      {new Date(p.endDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(p.id, p.active)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.active ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
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
      </PageContent>
    </>
  );
}
