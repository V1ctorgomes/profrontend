export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AdminDashboardMetrics {
  grossRevenue: number;
  netRevenue: number;
  profit: number;
  totalSales: number;
  averageTicket: number;
  stockQuantity: number;
  lowStockCount: number;
  salesToday: {
    total: number;
    count: number;
  };
}

export interface UserDashboardMetrics {
  salesTodayTotal: number;
  salesTodayCount: number;
  lowStockCount: number;
  activePromotions: number;
}
