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
      <div className="mb-2 flex flex-row items-center justify-between space-y-0">
        <h3 className="text-sm font-medium tracking-tight text-slate-500 transition-colors group-hover:text-brand-700">
          {title}
        </h3>
        <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-brand-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
