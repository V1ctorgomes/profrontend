'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageContent } from '@/components/layout/page-content';
import { PageHeader } from '@/components/layout/page-header';
import { FormModal } from '@/components/ui/form-modal';
import { usePanelFeedback } from '@/hooks/use-panel-feedback';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
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
import { formatCurrency } from '@/lib/format';
import type { Brand, Category, Product } from '@/types/catalog';

type Tab = 'products' | 'brands' | 'categories' | 'suppliers';

interface Supplier {
  id: string;
  name: string;
}

const emptyProductForm = {
  brandId: '',
  categoryId: '',
  model: '',
  costPrice: '',
  salePrice: '',
  minStock: '0',
};

export function ProductsPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [tab, setTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [productForm, setProductForm] = useState(emptyProductForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [b, c, p, s] = await Promise.all([
        api<Brand[]>('/brands', { token }),
        api<Category[]>('/categories', { token }),
        api<Product[]>('/products', { token }),
        api<Supplier[]>('/suppliers', { token }),
      ]);
      setBrands(b);
      setCategories(c);
      setProducts(p);
      setSuppliers(s);
      setProductForm((f) => ({
        ...f,
        brandId: f.brandId || b[0]?.id || '',
        categoryId: f.categoryId || c[0]?.id || '',
      }));
    } catch (err) {
      fail('Erro ao carregar', err, 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  function openModal() {
    setEditingSupplier(null);
    if (tab === 'products') {
      setProductForm((f) => ({
        ...emptyProductForm,
        brandId: f.brandId || brands[0]?.id || '',
        categoryId: f.categoryId || categories[0]?.id || '',
      }));
    } else if (tab === 'brands') {
      setBrandName('');
    } else if (tab === 'categories') {
      setCategoryName('');
    } else {
      setSupplierName('');
    }
    setModalOpen(true);
  }

  function openEditSupplierModal(supplier: Supplier) {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSupplier(null);
    setSupplierName('');
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    try {
      const name = brandName;
      await api('/brands', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({ name }),
      });
      closeModal();
      toast.success('Marca criada', `"${name}" foi adicionada ao catálogo.`);
      await load();
    } catch (err) {
      fail('Erro ao criar marca', err, 'Tente novamente.');
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const name = categoryName;
      await api('/categories', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({ name }),
      });
      closeModal();
      toast.success('Categoria criada', `"${name}" foi adicionada.`);
      await load();
    } catch (err) {
      fail('Erro ao criar categoria', err, 'Tente novamente.');
    }
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
      closeModal();
      await load();
    } catch (err) {
      fail(
        editingSupplier ? 'Erro ao atualizar fornecedor' : 'Erro ao criar fornecedor',
        err,
        editingSupplier ? 'Erro ao atualizar fornecedor' : 'Erro ao criar fornecedor',
      );
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const model = productForm.model;
      await api('/products', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          brandId: productForm.brandId,
          categoryId: productForm.categoryId,
          model,
          costPrice: Number(productForm.costPrice),
          salePrice: Number(productForm.salePrice),
          minStock: Number(productForm.minStock),
        }),
      });
      closeModal();
      toast.success('Produto criado', `${model} cadastrado com sucesso.`);
      await load();
    } catch (err) {
      fail('Erro ao criar produto', err, 'Tente novamente.');
    }
  }

  async function handleDeleteBrand(id: string, name: string) {
    if (!(await confirmDelete('Excluir marca?', `"${name}" será removida permanentemente.`))) return;
    try {
      await api(`/brands/${id}`, { method: 'DELETE', token: getClientToken() });
      toast.success('Marca excluída');
      await load();
    } catch (err) {
      fail('Erro ao excluir marca', err, 'Tente novamente.');
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!(await confirmDelete('Excluir categoria?', `"${name}" será removida permanentemente.`))) return;
    try {
      await api(`/categories/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      toast.success('Categoria excluída');
      await load();
    } catch (err) {
      fail('Erro ao excluir categoria', err, 'Tente novamente.');
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

  async function handleDeleteProduct(id: string, model: string) {
    if (!(await confirmDelete('Excluir produto?', `"${model}" será removido do catálogo.`))) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE', token: getClientToken() });
      toast.success('Produto excluído');
      await load();
    } catch (err) {
      fail('Erro ao excluir produto', err, 'Tente novamente.');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'products', label: 'Produtos' },
    { id: 'brands', label: 'Marcas' },
    { id: 'categories', label: 'Categorias' },
    { id: 'suppliers', label: 'Fornecedores' },
  ];

  const addLabels: Record<Tab, string> = {
    products: 'Novo produto',
    brands: 'Nova marca',
    categories: 'Nova categoria',
    suppliers: 'Novo fornecedor',
  };

  const modalTitles: Record<Tab, string> = {
    products: 'Novo produto',
    brands: 'Nova marca',
    categories: 'Nova categoria',
    suppliers: 'Novo fornecedor',
  };

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro de marcas, categorias, produtos e fornecedores"
        action={
          !loading ? (
            <button type="button" onClick={openModal} className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              {addLabels[tab]}
            </button>
          ) : undefined
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
            Carregando catálogo...
          </div>
        ) : (
          <>
            {tab === 'brands' && (
              <div className={`${cardClass} overflow-hidden`}>
                <table className={tableClass}>
                  <thead className={tableHeadClass}>
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((b) => (
                      <tr key={b.id} className="border-b border-slate-50">
                        <td className="px-4 py-3 font-medium">{b.name}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(b.id, b.name)}
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
            )}

            {tab === 'categories' && (
              <div className={`${cardClass} overflow-hidden`}>
                <table className={tableClass}>
                  <thead className={tableHeadClass}>
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.name)}
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
            )}

            {tab === 'suppliers' && (
              <div className={`${cardClass} overflow-hidden`}>
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

            {tab === 'products' && (
              <div className={`${cardClass} overflow-x-auto`}>
                <table className={tableClass}>
                  <thead className={tableHeadClass}>
                    <tr>
                      <th className="px-4 py-3">Marca</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Modelo</th>
                      <th className="px-4 py-3">Custo</th>
                      <th className="px-4 py-3">Venda</th>
                      <th className="px-4 py-3">Estoque</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50">
                        <td className="px-4 py-3">{p.brand.name}</td>
                        <td className="px-4 py-3">{p.category.name}</td>
                        <td className="px-4 py-3 font-medium">{p.model}</td>
                        <td className="px-4 py-3">{formatCurrency(p.costPrice)}</td>
                        <td className="px-4 py-3">{formatCurrency(p.salePrice)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              p.isLowStock
                                ? 'font-medium text-amber-600'
                                : 'text-slate-600'
                            }
                          >
                            {p.totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.model)}
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
            )}
          </>
        )}
      </PageContent>

      <FormModal
        open={modalOpen && tab === 'brands'}
        onClose={closeModal}
        title={modalTitles.brands}
        description="Adicione uma nova marca ao catálogo."
      >
        <form onSubmit={handleCreateBrand} className="space-y-4">
          <input
            className={inputClass}
            placeholder="Ex: Nike"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              Adicionar marca
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={modalOpen && tab === 'categories'}
        onClose={closeModal}
        title={modalTitles.categories}
        description="Adicione uma nova categoria ao catálogo."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <input
            className={inputClass}
            placeholder="Ex: Camiseta"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              Adicionar categoria
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={modalOpen && tab === 'suppliers' && !editingSupplier}
        onClose={closeModal}
        title={modalTitles.suppliers}
        description="Cadastre um fornecedor para registrar compras."
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
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              Adicionar fornecedor
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={!!editingSupplier}
        onClose={closeModal}
        title="Editar fornecedor"
        description="Altere o nome do fornecedor."
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
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              Salvar alterações
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={modalOpen && tab === 'products'}
        onClose={closeModal}
        title={modalTitles.products}
        description="Cadastre um novo produto na loja."
        size="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className={selectClass}
              value={productForm.brandId}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, brandId: e.target.value }))
              }
              required
            >
              <option value="">Marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={productForm.categoryId}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              required
            >
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Modelo"
              value={productForm.model}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, model: e.target.value }))
              }
              required
            />
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço de custo"
              value={productForm.costPrice}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, costPrice: e.target.value }))
              }
              required
            />
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço de venda"
              value={productForm.salePrice}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, salePrice: e.target.value }))
              }
              required
            />
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="Estoque mínimo"
              value={productForm.minStock}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, minStock: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              Adicionar produto
            </button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
