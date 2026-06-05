'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
} from '@/lib/styles';
import type { User } from '@/types/auth';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'USER' as 'ADMIN' | 'USER',
};

export function UsersPanel() {
  const { toast, fail, confirmDelete } = usePanelFeedback();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);

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

  function openModal() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/users', {
        method: 'POST',
        token: getClientToken(),
        body: JSON.stringify(form),
      });
      const name = form.name;
      closeModal();
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
    <>
      <PageHeader
        title="Usuários"
        description="Gerenciamento de contas e permissões"
        action={
          <button type="button" onClick={openModal} className={btnPrimaryClass}>
            <Plus className="h-4 w-4" />
            Novo usuário
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
        )}
      </PageContent>

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title="Novo usuário"
        description="Preencha os dados para criar uma nova conta."
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
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
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              Criar usuário
            </button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
