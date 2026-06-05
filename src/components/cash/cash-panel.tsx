'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Wallet } from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { FormModal } from '@/components/ui/form-modal';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import { formatCurrency } from '@/lib/format';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
  loadingClass,
  tableClass,
  tableHeadClass,
  boxEffects,
  metricBoxClass,
} from '@/lib/styles';

interface ExpectedCash {
  date: string;
  expectedCash: number;
  expectedPix: number;
  expectedDebit: number;
  expectedCredit: number;
  salesCount: number;
}

interface CashClosing {
  id: string;
  date: string;
  status: 'MATCHED' | 'DIVERGENCE';
  notes: string | null;
  user: { name: string };
  expected: { cash: number; pix: number; debit: number; credit: number };
  informed: { cash: number; pix: number; debit: number; credit: number };
}

const fields = [
  { key: 'informedCash' as const, label: 'Dinheiro', expectedKey: 'expectedCash' as const },
  { key: 'informedPix' as const, label: 'PIX', expectedKey: 'expectedPix' as const },
  { key: 'informedDebit' as const, label: 'Cartão débito', expectedKey: 'expectedDebit' as const },
  { key: 'informedCredit' as const, label: 'Cartão crédito', expectedKey: 'expectedCredit' as const },
];

const emptyForm = {
  informedCash: '',
  informedPix: '',
  informedDebit: '',
  informedCredit: '',
  notes: '',
};

export function CashPanel() {
  const { toast, fail } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expected, setExpected] = useState<ExpectedCash | null>(null);
  const [closings, setClosings] = useState<CashClosing[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [exp, list] = await Promise.all([
        api<ExpectedCash>('/cash-closings/expected', { token }),
        api<CashClosing[]>('/cash-closings', { token }),
      ]);
      setExpected(exp);
      setClosings(list);
    } catch (err) {
      fail('Erro ao carregar', err, 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api('/cash-closings', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          informedCash: Number(form.informedCash) || 0,
          informedPix: Number(form.informedPix) || 0,
          informedDebit: Number(form.informedDebit) || 0,
          informedCredit: Number(form.informedCredit) || 0,
          notes: form.notes || undefined,
        }),
      });
      closeModal();
      toast.success('Caixa fechado', 'Fechamento registrado com sucesso.');
      await load();
    } catch (err) {
      fail('Erro ao fechar caixa', err, 'Erro ao fechar caixa');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Caixa"
        description="Fechamento diário comparando valores declarados com vendas do dia"
        action={
          <button type="button" onClick={() => setModalOpen(true)} className={btnPrimaryClass}>
            <Plus className="h-4 w-4" />
            Fechar caixa
          </button>
        }
      />
      <PageContent>
        {loading ? (
          <div className={loadingClass}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            {expected && (
              <div className={`${cardClass} p-5`}>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                  <Wallet className="h-5 w-5" />
                  Valores esperados hoje
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className={metricBoxClass}>
                    <p className="text-xs text-slate-500">Dinheiro</p>
                    <p className="font-semibold">{formatCurrency(expected.expectedCash)}</p>
                  </div>
                  <div className={metricBoxClass}>
                    <p className="text-xs text-slate-500">PIX</p>
                    <p className="font-semibold">{formatCurrency(expected.expectedPix)}</p>
                  </div>
                  <div className={metricBoxClass}>
                    <p className="text-xs text-slate-500">Débito</p>
                    <p className="font-semibold">
                      {formatCurrency(expected.expectedDebit)}
                    </p>
                  </div>
                  <div className={metricBoxClass}>
                    <p className="text-xs text-slate-500">Crédito</p>
                    <p className="font-semibold">
                      {formatCurrency(expected.expectedCredit)}
                    </p>
                  </div>
                  <div className={`rounded-lg bg-brand-50 px-4 py-3 ${boxEffects}`}>
                    <p className="text-xs text-brand-600">Vendas hoje</p>
                    <p className="font-semibold text-brand-900">
                      {expected.salesCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className={`${cardClass} overflow-x-auto`}>
              <table className={tableClass}>
                <thead className={tableHeadClass}>
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Declarado</th>
                    <th className="px-4 py-3">Esperado</th>
                    <th className="px-4 py-3">Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {closings.map((c) => {
                    const declared =
                      c.informed.cash +
                      c.informed.pix +
                      c.informed.debit +
                      c.informed.credit;
                    const exp =
                      c.expected.cash +
                      c.expected.pix +
                      c.expected.debit +
                      c.expected.credit;
                    return (
                      <tr key={c.id} className="border-b border-slate-50">
                        <td className="px-4 py-3">
                          {new Date(c.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              c.status === 'MATCHED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.status === 'MATCHED' ? 'Conferido' : 'Divergência'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatCurrency(declared)}</td>
                        <td className="px-4 py-3">{formatCurrency(exp)}</td>
                        <td className="px-4 py-3">{c.user.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageContent>

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title="Fechar caixa"
        description="Informe os valores contados para comparar com as vendas do dia."
        size="lg"
      >
        <form onSubmit={handleClose} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs text-slate-500">
                  {f.label}
                  {expected && (
                    <span className="ml-1 text-slate-400">
                      (esp. {formatCurrency(expected[f.expectedKey])})
                    </span>
                  )}
                </label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            placeholder="Observações (opcional)"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              {submitting ? 'Salvando...' : 'Registrar fechamento'}
            </button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
