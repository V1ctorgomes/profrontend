'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getNavigationForRole } from '@/config/navigation';
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User as AppUser } from '@/types/auth';

interface AppSidebarProps {
  user: AppUser;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const items = getNavigationForRole(user.role);
  const initials = getInitials(user.name, user.email);
  const roleLabel = user.role === 'ADMIN' ? 'Administrador' : 'Operador';

  function handleNavClick() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  function handleLogout() {
    clearCookie(AUTH_COOKIE);
    clearCookie(USER_COOKIE);
    router.push('/login');
    router.refresh();
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={handleNavClick}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-white">
            <span className="text-sm font-black">PG</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-brand-900">
              PROGRIFES
            </p>
            <p className="text-xs text-muted-foreground">Gestão de Moda</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors',
                        isActive
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl p-2 transition-colors hover:bg-muted">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-auto flex-1 justify-start gap-3 px-1 py-1"
                  type="button"
                />
              }
            >
              <Avatar className="h-10 w-10 shrink-0 border border-border">
                <AvatarFallback className="bg-brand-900 text-sm font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-brand-900">
                  {user.name}
                </p>
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuLabel>
                <p>{user.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                closeOnClick
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Sair da conta"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
