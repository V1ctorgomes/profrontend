'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setCookie(AUTH_COOKIE, data.accessToken);
      setCookie(USER_COOKIE, encodeURIComponent(JSON.stringify(data.user)));
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível entrar no sistema';
      setError(
        msg === 'Credenciais inválidas'
          ? 'E-mail ou senha incorretos. Use admin@progrifes.com / admin123'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-brand-900">
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} pl-10`}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-brand-900">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pl-10`}
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`${btnPrimaryClass} mt-2 h-11 w-full focus:ring-offset-brand-canvas`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar no sistema'
        )}
      </button>
    </form>
  );
}
