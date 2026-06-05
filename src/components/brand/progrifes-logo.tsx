import Image from 'next/image';
import { cn } from '@/lib/utils';

const presets = {
  sm: {
    box: 'h-7 w-7 rounded-lg bg-brand-600',
    img: 22,
    gap: 'gap-2',
    label: 'text-sm font-bold tracking-tight text-brand-600 sm:text-base',
  },
  md: {
    box: 'h-9 w-9 rounded-lg bg-brand-600',
    img: 28,
    gap: 'gap-2.5',
    label: 'text-lg font-bold tracking-tight text-brand-600',
  },
  lg: {
    box: 'h-12 w-12 rounded-xl bg-brand-600',
    img: 36,
    gap: 'gap-3',
    label: 'text-xl font-bold tracking-tight text-brand-950 sm:text-2xl',
  },
  banner: {
    box: 'h-16 w-16 rounded-2xl border border-highlight/35 bg-brand-800/50 shadow-2xl shadow-brand-950/50 backdrop-blur-md',
    img: 44,
    gap: '',
    label: '',
  },
} as const;

type BrandSize = keyof typeof presets;

interface ProgrifesBrandProps {
  size?: BrandSize;
  showText?: boolean;
  className?: string;
  priority?: boolean;
}

export function ProgrifesBrand({
  size = 'md',
  showText = true,
  className,
  priority,
}: ProgrifesBrandProps) {
  const preset = presets[size];

  return (
    <div className={cn('flex min-w-0 items-center', preset.gap, className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden',
          preset.box,
        )}
      >
        <Image
          src="/logo.png"
          alt="Pro Grifes"
          width={preset.img}
          height={preset.img}
          priority={priority}
          className="h-[85%] w-[85%] object-contain"
        />
      </div>
      {showText && size !== 'banner' && (
        <span className={cn('truncate', preset.label)}>PRO GRIFES</span>
      )}
    </div>
  );
}
