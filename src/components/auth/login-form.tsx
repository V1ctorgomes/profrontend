'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';
import type { LoginResponse } from '@/types/auth';
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import { btnPrimaryClass, inputClass } from '@/lib/styles';

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setCookie(AUTH_COOKIE, data.accessToken);
      setCookie(USER_COOKIE, encodeURIComponent(JSON.stringify(data.user)));
      toast.success('Login realizado', `Bem-vindo, ${data.user.name}`);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível entrar no sistema';
      toast.error(
        'Falha no login',
        msg === 'Credenciais inválidas'
          ? 'E-mail ou senha incorretos.'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-brand-900">
          E-mail corporativo
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            placeholder="nome@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} h-11 pl-10`}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-brand-900">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} h-11 pl-10`}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`${btnPrimaryClass} mt-2 h-11 w-full`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          'Acessar plataforma'
        )}
      </button>
    </form>
  );
}
