'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { api } from '@/lib/api';
import { getClientToken } from '@/lib/client-auth';
import {
  btnDangerClass,
  btnPrimaryClass,
  cardClass,
  inputClass,
  selectClass,
  tableClass,
} from '@/lib/styles';
import { formatCurrency } from '@/lib/format';
import type { Brand, Category, Product } from '@/types/catalog';

type Tab = 'products' | 'brands' | 'categories';

export function ProductsPanel() {
  const [tab, setTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setError('');
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/brands', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({ name: brandName }),
      });
      setBrandName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar marca');
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/categories', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({ name: categoryName }),
      });
      setCategoryName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/products', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify({
          brandId: productForm.brandId,
          categoryId: productForm.categoryId,
          model: productForm.model,
          costPrice: Number(productForm.costPrice),
          salePrice: Number(productForm.salePrice),
          minStock: Number(productForm.minStock),
        }),
      });
      setProductForm((f) => ({
        ...f,
        model: '',
        costPrice: '',
        salePrice: '',
        minStock: '0',
      }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!confirm('Excluir esta marca?')) return;
    try {
      await api(`/brands/${id}`, { method: 'DELETE', token: getClientToken() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir marca');
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Excluir esta categoria?')) return;
    try {
      await api(`/categories/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Excluir este produto?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE', token: getClientToken() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'products', label: 'Produtos' },
    { id: 'brands', label: 'Marcas' },
    { id: 'categories', label: 'Categorias' },
  ];

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastro de marcas, categorias e produtos da loja"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-brand-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando...
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
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
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
                            onClick={() => handleDeleteBrand(b.id)}
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
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
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
                            onClick={() => handleDeleteCategory(c.id)}
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
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
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
                            onClick={() => handleDeleteProduct(p.id)}
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
    </div>
  );
}
