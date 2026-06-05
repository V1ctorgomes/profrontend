import { Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

const brandColumns = [
  ['Nike', 'Adidas', 'Reserva', 'Lacoste', 'Puma', 'Hering', 'Colcci'],
  ['Tommy Hilfiger', 'Calvin Klein', "Levi's", 'Olympikus', 'Forum', 'Aramis', 'Osklen'],
  ['Richards', 'Farm', 'Shoulder', 'Malwee', 'Ellus', 'Lupo', 'Live!', 'Vans'],
] as const;

function BrandMarqueeColumn({
  brands,
  reverse,
  durationSec,
}: {
  brands: readonly string[];
  reverse?: boolean;
  durationSec: number;
}) {
  const items = [...brands, ...brands];

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          'login-brand-marquee flex flex-col gap-4 py-2',
          reverse && 'login-brand-marquee--reverse',
        )}
        style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
      >
        {items.map((name, index) => (
          <div
            key={`${name}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base font-semibold tracking-wide text-white/80 backdrop-blur-sm"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoginBanner() {
  return (
    <div className="relative hidden overflow-hidden border-r border-brand-950 lg:flex lg:w-1/2">
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

      <div className="relative z-[1] flex min-h-screen w-full">
        <div
          className="relative flex min-h-0 w-[min(46%,380px)] shrink-0 gap-3 px-5 py-10"
          aria-hidden
        >
          <BrandMarqueeColumn brands={brandColumns[0]} durationSec={26} />
          <BrandMarqueeColumn brands={brandColumns[1]} reverse durationSec={32} />
          <BrandMarqueeColumn brands={brandColumns[2]} durationSec={22} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-brand-950/90" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center p-12 xl:p-16">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-highlight/35 bg-brand-800/50 shadow-2xl shadow-brand-950/50 backdrop-blur-md">
            <Shirt className="h-8 w-8 text-highlight" strokeWidth={1.5} />
          </div>

          <h2 className="mb-6 max-w-md text-4xl leading-tight font-bold text-white drop-shadow-sm">
            Gestão inteligente para lojas de moda.
          </h2>

          <p className="max-w-md text-lg leading-relaxed font-medium text-brand-100/95">
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
    </div>
  );
}
