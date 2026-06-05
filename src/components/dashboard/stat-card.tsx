import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statCardClass } from '@/lib/styles';

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
    <div className={cn(statCardClass, className)}>
      <div className="relative mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-brand-50">
          <Icon className="h-4 w-4 text-brand-700" />
        </div>
      </div>
      <p className="relative text-2xl font-bold tracking-tight text-brand-900">{value}</p>
      {description && (
        <p className="relative mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
