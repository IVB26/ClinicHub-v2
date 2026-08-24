'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'staff' | 'manager' | 'admin';
}

export function ProtectedLayout({
  children,
  requiredRole = 'staff',
}: ProtectedLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check role permission
  const roles = ['staff', 'manager', 'admin'];
  const userRoleIndex = roles.indexOf(user?.role || 'staff');
  const requiredRoleIndex = roles.indexOf(requiredRole);
  const hasPermission = userRoleIndex >= requiredRoleIndex;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 pt-16 lg:pt-0">
        <Navbar />
        <main className="flex-1 overflow-auto pt-4">{children}</main>
      </div>
    </div>
  );
}
