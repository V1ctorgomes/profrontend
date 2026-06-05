import { ProgrifesBrand } from '@/components/brand/progrifes-logo';

export function LoginBanner() {
  return (
    <div className="relative hidden items-center justify-center overflow-hidden border-r border-brand-950 lg:flex lg:w-1/2">
      <div className="absolute inset-0 z-0 bg-brand-950" aria-hidden />
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-0 bg-gradient-to-t from-black/35 via-transparent to-brand-500/10"
        aria-hidden
      />
      <div
        className="absolute bottom-[-12%] left-[-18%] z-0 h-[min(100vw,680px)] w-[min(100vw,680px)] rounded-full bg-highlight-warm/30 blur-[110px]"
        aria-hidden
      />
      <div
        className="absolute top-[-18%] right-[-12%] z-0 h-[min(95vw,560px)] w-[min(95vw,560px)] rounded-full bg-brand-400/40 blur-[90px]"
        aria-hidden
      />
      <div
        className="absolute top-1/3 right-1/4 z-0 h-[320px] w-[320px] rounded-full bg-highlight/15 blur-[80px]"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-2xl flex-col p-16">
        <div className="mb-8">
          <ProgrifesBrand size="banner" showText={false} priority />
        </div>

        <h2 className="mb-6 text-4xl leading-tight font-bold text-white drop-shadow-sm">
          Gestão inteligente para lojas de moda.
        </h2>

        <p className="max-w-lg text-lg leading-relaxed font-medium text-brand-100/95">
          O Progrifes consolida estoque, vendas, clientes e financeiro numa
          interface rápida, moderna e intuitiva.
        </p>

        <div className="mt-12 flex items-center gap-4">
          <p className="text-sm font-medium text-highlight/90">
            Bem-vindo(a) à sua loja.
          </p>
        </div>
      </div>
    </div>
  );
}
