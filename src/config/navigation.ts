import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vendas (PDV)',
    href: '/dashboard/vendas',
    icon: ShoppingCart,
  },
  {
    title: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
  },
  {
    title: 'Produtos',
    href: '/dashboard/produtos',
    icon: Package,
  },
  {
    title: 'Estoque',
    href: '/dashboard/estoque',
    icon: Boxes,
  },
  {
    title: 'Compras',
    href: '/dashboard/compras',
    icon: ShoppingBag,
  },
  {
    title: 'Promoções',
    href: '/dashboard/promocoes',
    icon: Tag,
  },
  {
    title: 'Fechamento de Caixa',
    href: '/dashboard/caixa',
    icon: Receipt,
  },
  {
    title: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: Wallet,
    roles: ['ADMIN'],
  },
  {
    title: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
  {
    title: 'Usuários',
    href: '/dashboard/usuarios',
    icon: UserCog,
    roles: ['ADMIN'],
  },
];

export function getNavigationForRole(role: UserRole): NavItem[] {
  return navigation.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
}
