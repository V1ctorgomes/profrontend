import Image from 'next/image';
import { cn } from '@/lib/utils';

const sizeMap = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 120,
  '2xl': 160,
} as const;

type LogoSize = keyof typeof sizeMap;

interface ProgrifesLogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function ProgrifesLogo({
  size = 'md',
  className,
  priority,
}: ProgrifesLogoProps) {
  const px = sizeMap[size];

  return (
    <Image
      src="/logo.png"
      alt="Pro Grifes — Camisaria & Acessórios"
      width={px}
      height={px}
      priority={priority}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}
