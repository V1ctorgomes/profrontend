import { ShieldCheck, Shirt, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full font-sans selection:bg-accent-soft selection:text-brand-900">
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-brand-950 p-14 text-white xl:flex">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-900 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Shirt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-[0.08em]">PROGRIFES</span>
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/40 uppercase">
              Enterprise Platform
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Plataforma corporativa de gestão
          </div>
          <h2 className="text-4xl leading-[1.15] font-bold tracking-tight xl:text-5xl">
            Operações de moda em escala enterprise
          </h2>
          <p className="text-base leading-relaxed text-white/55">
            Estoque, PDV, financeiro e inteligência operacional unificados para
            redes e operações de alto volume.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Progrifes ERP · Todos os direitos reservados
        </p>
      </div>

      <div className="app-shell-bg flex w-full flex-col justify-center px-8 py-12 sm:px-16 xl:w-[48%] xl:px-20">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-10 xl:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg">
              <Shirt className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-900">
              PROGRIFES
            </h1>
            <p className="mt-1 text-sm text-slate-500">Enterprise ERP</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
            <div className="mb-7">
              <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
                Acesso seguro
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-900">
                Entrar no sistema
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Use suas credenciais corporativas para continuar
              </p>
            </div>
            <LoginForm />
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">
              Conexão criptografada · SSO ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
