'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
import { AUTH_COOKIE, USER_COOKIE } from '@/lib/constants';
import type { User as AppUser } from '@/types/auth';

interface AppHeaderProps {
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

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const initials = getInitials(user.name, user.email);

  function handleLogout() {
    clearCookie(AUTH_COOKIE);
    clearCookie(USER_COOKIE);
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden sm:block">
          <p className="text-sm font-medium">Sistema ERP</p>
          <p className="text-xs text-muted-foreground">
            Gestão completa da loja
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2"
              type="button"
            />
          }
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-brand-900 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm md:inline">{user.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
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
    </header>
  );
}
