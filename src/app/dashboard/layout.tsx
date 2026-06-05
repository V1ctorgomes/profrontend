import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { getServerUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="app-shell-bg flex h-screen overflow-hidden font-sans">
      <AppSidebar user={user} />
      <main className="premium-scrollbar relative h-full flex-1 overflow-y-auto pt-[60px] selection:bg-accent-soft selection:text-brand-900 md:pt-0">
        <div className="mx-auto max-w-[1440px] p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
