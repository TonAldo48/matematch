'use client';

import { usePathname } from 'next/navigation';
import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./sidebar'), {
  loading: () => <div className="w-64 bg-background" />
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/signin') || pathname?.includes('/signup');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="flex h-full bg-background">
      <Suspense fallback={<div className="w-64 bg-background" />}>
        <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      </Suspense>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
} 