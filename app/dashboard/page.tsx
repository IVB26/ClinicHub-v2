'use client';

import { ProtectedLayout } from '@/components/ProtectedLayout';
import { useAuthContext } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuthContext();

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            ClinicHub v2.0 - Production Ready
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm font-medium">Policies</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm font-medium">Boarding</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm font-medium">Protocols</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm font-medium">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Phase 2: Features Complete ✓
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>Policies management with rich text editing</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>Hierarchical Protocols with categories and items</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>Boarding Procedures with PDF uploads</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>Admin Dashboard with user management</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>Content Manager for dynamic sections</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>SMS Templates with variable support</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">User Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Username:</span> {user?.username}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{' '}
                  <span className="capitalize font-semibold text-gray-900">
                    {user?.role}
                  </span>
                </p>
                {user?.clinicId && (
                  <p>
                    <span className="font-medium">Clinic:</span> {user.clinicId}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="font-bold text-green-900 mb-2">Available Sections</h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Policies</li>
                <li>• Protocols</li>
                <li>• Boarding</li>
                <li>• Content Manager</li>
                <li>• SMS Templates</li>
                <li>• Admin Panel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
