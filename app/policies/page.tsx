'use client';

import { ProtectedLayout } from '@/components/ProtectedLayout';

export default function PoliciesPage() {
  return (
    <ProtectedLayout requiredRole="staff">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Policies</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center text-gray-500">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-lg font-medium">Policies</p>
            <p className="text-sm mt-2">This page is part of Phase 2 implementation</p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
