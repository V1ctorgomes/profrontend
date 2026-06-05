import { AdminGuard } from '@/components/layout/admin-guard';
import { FinancialPanel } from '@/components/financial/financial-panel';

export default function FinanceiroPage() {
  return (
    <AdminGuard>
      <FinancialPanel />
    </AdminGuard>
  );
}
