import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { syncUserWithDatabase } from '@/lib/clerk-sync';
import { PYODIDE_FULL_URL } from '@/lib/constants';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authResult, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // Sync user with database if authenticated
  if (authResult.userId) {
    await syncUserWithDatabase();
  }

  // Create a user object compatible with the existing AppSidebar component
  const user = authResult.userId ? { id: authResult.userId } : undefined;

  return (
    <>
      <Script
        src={`${PYODIDE_FULL_URL}pyodide.js`}
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
