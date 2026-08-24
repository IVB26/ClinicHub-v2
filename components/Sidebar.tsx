'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { tabsAPI } from '@/lib/api';
import type { CustomTab } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredRole?: 'staff' | 'manager' | 'admin';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Reception', href: '/reception', icon: '☎️', requiredRole: 'staff' },
  { label: 'Banking', href: '/banking', icon: '💰', requiredRole: 'staff' },
  { label: 'Operations', href: '/operations', icon: '🎯', requiredRole: 'staff' },
  { label: 'Policies', href: '/policies', icon: '📋', requiredRole: 'staff' },
  { label: 'Protocols', href: '/protocols', icon: '📖', requiredRole: 'staff' },
  { label: 'Boarding', href: '/boarding', icon: '🏠', requiredRole: 'staff' },
  { label: 'Content', href: '/content', icon: '✏️', requiredRole: 'manager' },
  { label: 'Admin', href: '/admin', icon: '⚙️', requiredRole: 'admin' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomTabs();
  }, []);

  const fetchCustomTabs = async () => {
    try {
      const data = await tabsAPI.getAll();
      const sidebarTabs = (Array.isArray(data) ? data : []).filter(
        (tab: CustomTab) => tab.location === 'sidebar'
      );
      setCustomTabs(sidebarTabs);
    } catch (err) {
      console.error('Failed to load custom tabs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-blue-600 text-white"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-transform duration-300 transform lg:transform-none z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">ClinicHub</h1>
          <p className="text-sm text-slate-400 mt-1">v2.0 Beta</p>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {!loading && customTabs.length > 0 && (
            <>
              <div className="px-4 py-3 mt-4 border-t border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Custom Tabs
                </p>
              </div>
              {customTabs.map((tab) => {
                const isActive = pathname === `/custom-tabs/${tab.id}`;
                return (
                  <Link
                    key={tab.id}
                    href={`/custom-tabs/${tab.id}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-medium shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            Phase 1 - Navigation Shell
          </p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
