'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import type { User } from '@/types/auth';

export function UsersPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'ADMIN' | 'USER',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<User[]>('/users', { token: getClientToken() });
      setUsers(data);
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
      await api('/users', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify(form),
      });
      const name = form.name;
      setForm({ name: '', email: '', password: '', role: 'USER' });
      toast.success('Usuário criado', `"${name}" foi adicionado.`);
      await load();
    } catch (err) {
      fail('Erro ao criar usuário', err, 'Erro ao criar usuário');
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmDelete('Excluir usuário?', 'Esta conta será removida permanentemente.'))) return;
    try {
      await api(`/users/${id}`, {
        method: 'DELETE',
        token: getClientToken(),
      });
      toast.success('Usuário excluído');
      await load();
    } catch (err) {
      fail('Erro ao excluir', err, 'Erro ao excluir');
    }
  }

  return (
    <div>
      <PageHeader
        badge="Administração"
        title="Usuários"
        description="Gerenciamento de contas e permissões"
      />
      {loading ? (
        <div className={loadingClass}>
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleCreate} className={`${cardClass} p-5`}>
            <h2 className="mb-4 font-semibold text-brand-900">Novo usuário</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                className={inputClass}
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className={inputClass}
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
              <input
                className={inputClass}
                type="password"
                placeholder="Senha"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
              <select
                className={selectClass}
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as 'ADMIN' | 'USER',
                  }))
                }
              >
                <option value="USER">Vendedor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <button type="submit" className={`${btnPrimaryClass} mt-4`}>
              <Plus className="h-4 w-4" />
              Criar usuário
            </button>
          </form>
          <div className={`${cardClass} overflow-x-auto`}>
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Perfil</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-brand-100 text-brand-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
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
