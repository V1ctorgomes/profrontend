'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { FormModal } from '@/components/ui/form-modal';
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
  tabButtonActiveClass,
  tabButtonInactiveClass,
} from '@/lib/styles';
import type { Product } from '@/types/catalog';

type Tab = 'purchases' | 'suppliers';

interface Supplier {
  id: string;
  name: string;
}

interface Purchase {
  id: string;
  total: number;
  createdAt: string;
  supplier: { name: string };
  user: { name: string };
  items: {
    size: string;
    quantity: number;
    unitPrice: number;
    product: { model: string; brand: string };
  }[];
}

const emptyPurchaseForm = {
  supplierId: '',
  productId: '',
  size: '',
  quantity: '1',
  unitPrice: '',
};

export function PurchasesPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [tab, setTab] = useState<Tab>('purchases');
  const [loading, setLoading] = useState(true);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [form, setForm] = useState(emptyPurchaseForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [s, p, purchasesData] = await Promise.all([
        api<Supplier[]>('/suppliers', { token }),
        api<Product[]>('/products', { token }),
        api<Purchase[]>('/purchases', { token }),
      ]);
      setSuppliers(s);
      setProducts(p);
      setPurchases(purchasesData);
      setForm((f) => ({
        ...f,
        supplierId: f.supplierId || s[0]?.id || '',
        productId: f.productId || p[0]?.id || '',
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

  function openCreateSupplierModal() {
    setEditingSupplier(null);
    setSupplierName('');
    setSupplierModalOpen(true);
  }

  function openEditSupplierModal(supplier: Supplier) {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierModalOpen(true);
  }

  function closeSupplierModal() {
    setSupplierModalOpen(false);
    setEditingSupplier(null);
    setSupplierName('');
  }

  function openPurchaseModal() {
    setForm((f) => ({
      ...emptyPurchaseForm,
      supplierId: f.supplierId || suppliers[0]?.id || '',
      productId: f.productId || products[0]?.id || '',
    }));
    setPurchaseModalOpen(true);
  }

  async function handleSaveSupplier(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api(`/suppliers/${editingSupplier.id}`, {
          method: 'PATCH',
          token: getClientToken(),
          body: JSON.stringify({ name: supplierName }),
        });
        toast.success('Fornecedor atualizado', `"${supplierName}" foi salvo.`);
      } else {
        await api('/suppliers', {
          method: 'POST',
          token: getClientToken(),
          body: JSON.stringify({ name: supplierName }),
        });
        toast.success('Fornecedor criado', `"${supplierName}" foi adicionado.`);
      }
      closeSupplierModal();
      await load();
    } catch (err) {
      fail(
        editingSupplier ? 'Erro ao atualizar fornecedor' : 'Erro ao criar fornecedor',
        err,
        editingSupplier ? 'Erro ao atualizar fornecedor' : 'Erro ao criar fornecedor',
      );
    }
  }

  async function handleDeleteSupplier(id: string, name: string) {
    if (
      !(await confirmDelete(
        'Excluir fornecedor?',
        `"${name}" será removido. Fornecedores com compras vinculadas não podem ser excluídos.`,
      ))
    ) {
      return;
    }
    try {
      await api(`/suppliers/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      toast.success('Fornecedor excluído');
      await load();
    } catch (err) {
      fail('Erro ao excluir fornecedor', err, 'Erro ao excluir fornecedor');
    }
  }

  async function handleCreatePurchase(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/purchases', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          supplierId: form.supplierId,
          items: [
            {
              productId: form.productId,
              size: form.size,
              quantity: Number(form.quantity),
              unitPrice: Number(form.unitPrice),
            },
          ],
        }),
      });
      setPurchaseModalOpen(false);
      setForm((f) => ({ ...f, size: '', quantity: '1', unitPrice: '' }));
      toast.success('Compra registrada', 'Entrada no estoque realizada automaticamente.');
      await load();
    } catch (err) {
      fail('Erro ao registrar compra', err, 'Erro ao registrar compra');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'purchases', label: 'Histórico de compras' },
    { id: 'suppliers', label: 'Fornecedores' },
  ];

  return (
    <>
      <PageHeader
        title="Compras"
        description="Registro de compras de fornecedores com entrada automática no estoque"
        action={
          <div className="flex flex-wrap gap-2">
            {tab === 'suppliers' ? (
              <button
                type="button"
                onClick={openCreateSupplierModal}
                className={btnPrimaryClass}
              >
                <Plus className="h-4 w-4" />
                Novo fornecedor
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setTab('suppliers');
                  }}
                  className={btnSecondaryClass}
                >
                  Gerenciar fornecedores
                </button>
                <button type="button" onClick={openPurchaseModal} className={btnPrimaryClass}>
                  <Plus className="h-4 w-4" />
                  Nova compra
                </button>
              </>
            )}
          </div>
        }
      />
      <PageContent>
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={tab === t.id ? tabButtonActiveClass : tabButtonInactiveClass}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={loadingClass}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando...
          </div>
        ) : tab === 'purchases' ? (
          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">{p.supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {p.items
                        .map(
                          (i) =>
                            `${i.product.brand} ${i.product.model} (${i.size}) x${i.quantity}`,
                        )
                        .join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-4 py-3">{p.user.name}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Nenhuma compra registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditSupplierModal(s)}
                          className={btnSecondaryClass}
                          title="Editar fornecedor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSupplier(s.id, s.name)}
                          className={btnDangerClass}
                          title="Excluir fornecedor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                      Nenhum fornecedor cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageContent>

      <FormModal
        open={supplierModalOpen}
        onClose={closeSupplierModal}
        title={editingSupplier ? 'Editar fornecedor' : 'Novo fornecedor'}
        description={
          editingSupplier
            ? 'Altere o nome do fornecedor.'
            : 'Cadastre um fornecedor para registrar compras.'
        }
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <input
            className={inputClass}
            placeholder="Nome do fornecedor"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeSupplierModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              {editingSupplier ? 'Salvar alterações' : 'Adicionar'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        title="Nova compra"
        description="A entrada no estoque será feita automaticamente."
        size="md"
      >
        <form onSubmit={handleCreatePurchase} className="space-y-3">
          <select
            className={selectClass}
            value={form.supplierId}
            onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
            required
          >
            <option value="">Fornecedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={form.productId}
            onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
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
            value={form.size}
            onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              type="number"
              min="1"
              placeholder="Qtd"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              placeholder="Valor unit."
              value={form.unitPrice}
              onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPurchaseModalOpen(false)}
              className={btnSecondaryClass}
            >
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              Registrar compra
            </button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
