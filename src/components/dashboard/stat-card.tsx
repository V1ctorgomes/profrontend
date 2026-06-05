import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatAccent = 'default' | 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  accent?: StatAccent;
  className?: string;
}

const accentStyles: Record<
  StatAccent,
  { iconWrap: string; glow: string; value: string }
> = {
  default: {
    iconWrap: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    glow: 'from-slate-200/50 to-transparent',
    value: 'text-brand-900',
  },
  indigo: {
    iconWrap: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    glow: 'from-indigo-200/60 to-transparent',
    value: 'text-brand-900',
  },
  emerald: {
    iconWrap: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    glow: 'from-emerald-200/60 to-transparent',
    value: 'text-emerald-700',
  },
  amber: {
    iconWrap: 'bg-amber-50 text-amber-600 ring-amber-100',
    glow: 'from-amber-200/60 to-transparent',
    value: 'text-amber-700',
  },
  sky: {
    iconWrap: 'bg-sky-50 text-sky-600 ring-sky-100',
    glow: 'from-sky-200/60 to-transparent',
    value: 'text-brand-900',
  },
  rose: {
    iconWrap: 'bg-rose-50 text-rose-600 ring-rose-100',
    glow: 'from-rose-200/60 to-transparent',
    value: 'text-brand-900',
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = 'default',
  className,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity group-hover:opacity-100',
          styles.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            {title}
          </p>
          <p className={cn('mt-3 text-[1.75rem] leading-none font-bold tracking-tight', styles.value)}>
            {value}
          </p>
          {description && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1',
            styles.iconWrap,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
