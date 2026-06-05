import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { api } from '@/lib/api';
import { getServerToken, getServerUser } from '@/lib/auth';
import type {
  AdminDashboardMetrics,
  UserDashboardMetrics,
} from '@/types/auth';
import { redirect } from 'next/navigation';

const emptyAdminMetrics: AdminDashboardMetrics = {
  grossRevenue: 0,
  netRevenue: 0,
  profit: 0,
  totalSales: 0,
  averageTicket: 0,
  stockQuantity: 0,
  lowStockCount: 0,
  salesToday: { total: 0, count: 0 },
};

const emptyUserMetrics: UserDashboardMetrics = {
  salesTodayTotal: 0,
  salesTodayCount: 0,
  lowStockCount: 0,
  activePromotions: 0,
};

export default async function DashboardPage() {
  const user = await getServerUser();
  const token = await getServerToken();

  if (!user || !token) {
    redirect('/login');
  }

  let metrics: AdminDashboardMetrics | UserDashboardMetrics;

  try {
    metrics = await api<AdminDashboardMetrics | UserDashboardMetrics>(
      '/dashboard/metrics',
      { token },
    );
  } catch {
    metrics =
      user.role === 'ADMIN' ? emptyAdminMetrics : emptyUserMetrics;
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboard metrics={metrics as AdminDashboardMetrics} />;
  }

  return <UserDashboard metrics={metrics as UserDashboardMetrics} />;
}
