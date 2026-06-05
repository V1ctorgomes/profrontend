'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { AlertTriangle } from 'lucide-react';
import { btnDangerClass, btnSecondaryClass, modalClass } from '@/lib/styles';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = useCallback((result: boolean) => {
    state?.resolve(result);
    setState(null);
  }, [state]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() => close(false)}
          />
          <div className={`${modalClass} relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200`}>
            <div className="flex items-start gap-4">
              <div
                className={
                  state.variant === 'danger'
                    ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600'
                    : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700'
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  {state.title}
                </h3>
                {state.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {state.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className={btnSecondaryClass}
                onClick={() => close(false)}
              >
                {state.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                type="button"
                className={
                  state.variant === 'danger'
                    ? `${btnDangerClass} h-10 rounded-lg bg-red-600 px-4 text-white hover:bg-red-700`
                    : btnSecondaryClass
                }
                onClick={() => close(true)}
              >
                {state.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx.confirm;
}
