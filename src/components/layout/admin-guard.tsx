'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getClientUser } from '@/lib/client-auth';
import { loadingClass } from '@/lib/styles';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getClientUser();
    if (!user || user.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className={loadingClass}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Verificando permissão...
      </div>
    );
  }

  return <>{children}</>;
}
