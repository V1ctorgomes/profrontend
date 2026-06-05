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
    <div className="flex h-screen overflow-hidden bg-brand-canvas font-sans">
      <AppSidebar user={user} />
      <main className="no-scrollbar relative h-full flex-1 overflow-y-auto pt-[60px] selection:bg-brand-100 selection:text-brand-900 md:pt-0">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
