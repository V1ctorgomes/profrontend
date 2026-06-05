import { AdminGuard } from '@/components/layout/admin-guard';
import { UsersPanel } from '@/components/users/users-panel';

export default function UsuariosPage() {
  return (
    <AdminGuard>
      <UsersPanel />
    </AdminGuard>
  );
}
