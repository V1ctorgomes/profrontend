import { ShieldCheck, Shirt } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-brand-canvas font-sans selection:bg-brand-100 selection:text-brand-900">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-900">
            <Shirt className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">PROGRIFES</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Gestão inteligente para lojas de moda
          </h2>
          <p className="max-w-md text-sm text-white/70">
            Controle estoque, vendas, clientes e financeiro em um único sistema.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Progrifes ERP
        </p>
      </div>

      <div className="flex w-full flex-col justify-center bg-gradient-to-br from-white via-brand-canvas to-brand-50/60 px-8 py-12 sm:px-16 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-white">
              <Shirt className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-900">
              PROGRIFES
            </h1>
            <p className="mt-1 text-sm text-slate-500">ERP para lojas de moda</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-900">Acessar o sistema</h2>
              <p className="mt-1 text-sm text-slate-500">
                Entre com suas credenciais para gerenciar a loja
              </p>
            </div>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            admin@progrifes.com / admin123 · vendedor@progrifes.com / user123
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-brand-700/50">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">Acesso seguro e encriptado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
