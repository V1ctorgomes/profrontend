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
  tabButtonActiveClass,
  tabButtonInactiveClass,
} from '@/lib/styles';
import { formatCurrency } from '@/lib/format';
import type { Brand, Category, Product } from '@/types/catalog';

type Tab = 'products' | 'brands' | 'categories';

export function ProductsPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [tab, setTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productForm, setProductForm] = useState({
    brandId: '',
    categoryId: '',
    model: '',
    costPrice: '',
    salePrice: '',
    minStock: '0',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getClientToken();
      const [b, c, p] = await Promise.all([
        api<Brand[]>('/brands', { token }),
        api<Category[]>('/categories', { token }),
        api<Product[]>('/products', { token }),
      ]);
      setBrands(b);
      setCategories(c);
      setProducts(p);
      setProductForm((f) => ({
        ...f,
        brandId: f.brandId || b[0]?.id || '',
        categoryId: f.categoryId || c[0]?.id || '',
      }));
    } catch (err) {
      fail(
        'Erro ao carregar',
        err,
        'Não foi possível carregar os dados',
      );
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    try {
      const name = brandName;
      await api('/brands', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({ name }),
      });
      setBrandName('');
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
      toast.success('Categoria criada', `"${name}" foi adicionada.`);
      setCategoryName('');
      await load();
    } catch (err) {
      fail('Erro ao criar categoria', err, 'Tente novamente.');
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
      toast.success('Produto criado', `${model} cadastrado com sucesso.`);
      setProductForm((f) => ({
        ...f,
        model: '',
        costPrice: '',
        salePrice: '',
        minStock: '0',
      }));
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
  ];

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro de marcas, categorias e produtos da loja"
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
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleCreateBrand} className={`${cardClass} p-5`}>
                <h2 className="mb-4 font-semibold text-brand-900">Nova marca</h2>
                <input
                  className={inputClass}
                  placeholder="Ex: Nike"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
                <button type="submit" className={`${btnPrimaryClass} mt-4 w-full`}>
                  <Plus className="h-4 w-4" />
                  Adicionar marca
                </button>
              </form>
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
            </div>
          )}

          {tab === 'categories' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleCreateCategory} className={`${cardClass} p-5`}>
                <h2 className="mb-4 font-semibold text-brand-900">Nova categoria</h2>
                <input
                  className={inputClass}
                  placeholder="Ex: Camiseta"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
                <button type="submit" className={`${btnPrimaryClass} mt-4 w-full`}>
                  <Plus className="h-4 w-4" />
                  Adicionar categoria
                </button>
              </form>
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
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateProduct} className={`${cardClass} p-5`}>
                <h2 className="mb-4 font-semibold text-brand-900">Novo produto</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <button type="submit" className={`${btnPrimaryClass} mt-4`}>
                  <Plus className="h-4 w-4" />
                  Adicionar produto
                </button>
              </form>

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
            </div>
          )}
        </>
      )}
      </PageContent>
    </>
  );
}
