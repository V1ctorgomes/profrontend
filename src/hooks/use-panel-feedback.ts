'use client';

import { useCallback } from 'react';
import { useConfirm } from '@/components/ui/confirm-provider';
import { useToast } from '@/components/ui/toast-provider';

export function usePanelFeedback() {
  const toast = useToast();
  const confirm = useConfirm();

  const fail = useCallback(
    (title: string, err: unknown, fallback = 'Tente novamente.') => {
      toast.error(title, err instanceof Error ? err.message : fallback);
    },
    [toast],
  );

  const confirmDelete = useCallback(
    (title: string, description?: string) =>
      confirm({
        title,
        description,
        confirmLabel: 'Excluir',
        variant: 'danger',
      }),
    [confirm],
  );

  return { toast, confirm, fail, confirmDelete };
}
