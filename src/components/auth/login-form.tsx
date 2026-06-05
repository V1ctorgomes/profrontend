'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { ProgrifesBrand } from '@/components/brand/progrifes-logo';
import { api } from '@/lib/api';
import type { LoginResponse } from '@/types/auth';
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import { inputClass } from '@/lib/styles';

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
    <div className="relative flex w-full flex-col justify-center bg-gradient-to-br from-white via-brand-canvas to-brand-50/60 px-8 py-12 sm:px-16 md:px-24 lg:w-1/2 lg:px-32">
      <div className="mx-auto flex w-full max-w-[420px] flex-col">
        <div className="mb-10">
          <ProgrifesBrand size="lg" priority />
        </div>

        <div className="mb-6 flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-brand-950">
            Bem-vindo de volta
          </h1>
          <p className="text-sm font-medium text-brand-800/80">
            Insira suas credenciais para acessar o sistema da loja.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

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
                className={`${inputClass} pl-10 font-mono placeholder:font-sans`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 text-sm font-medium text-white transition-all hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 focus:ring-offset-brand-canvas disabled:pointer-events-none disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A autenticar...
              </>
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          admin@progrifes.com / admin123 · vendedor@progrifes.com / user123
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-brand-700/50">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-medium">Acesso seguro e encriptado</span>
        </div>
      </div>
    </div>
  );
}
