'use client';

import { ConfirmProvider } from '@/components/ui/confirm-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
