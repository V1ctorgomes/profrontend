'use client';

import { useConfirm } from '@/components/ui/confirm-provider';
import { useToast } from '@/components/ui/toast-provider';

export function usePanelFeedback() {
  const toast = useToast();
  const confirm = useConfirm();

  function fail(title: string, err: unknown, fallback = 'Tente novamente.') {
    toast.error(title, err instanceof Error ? err.message : fallback);
  }

  function confirmDelete(title: string, description?: string) {
    return confirm({
      title,
      description,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
  }

  return { toast, confirm, fail, confirmDelete };
}
