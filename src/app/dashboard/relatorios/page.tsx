import { AdminGuard } from '@/components/layout/admin-guard';
import { ReportsPanel } from '@/components/reports/reports-panel';

export default function RelatoriosPage() {
  return (
    <AdminGuard>
      <ReportsPanel />
    </AdminGuard>
  );
}
