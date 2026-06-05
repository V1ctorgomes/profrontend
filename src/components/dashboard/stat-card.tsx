import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_20px_40px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">
          {title}
        </p>
        <div className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-100 transition-colors group-hover:bg-accent-soft group-hover:ring-accent/20">
          <Icon className="h-4 w-4 text-brand-700 transition-colors group-hover:text-accent" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-brand-900">{value}</p>
      {description && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
    </div>
  );
}
