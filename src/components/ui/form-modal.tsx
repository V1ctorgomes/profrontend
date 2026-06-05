'use client';

import { X } from 'lucide-react';
import { modalClass } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-brand-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          modalClass,
          'relative max-h-[90vh] w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="form-modal-title"
              className="text-lg font-semibold tracking-tight text-brand-950"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
