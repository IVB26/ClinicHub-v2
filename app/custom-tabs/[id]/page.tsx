'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tabsAPI } from '@/lib/api';
import type { CustomTab } from '@/lib/types';
import { TabCardDisplay } from '@/components/TabCardDisplay';
import { TabFormDisplay } from '@/components/TabFormDisplay';
import { TabChecklistDisplay } from '@/components/TabChecklistDisplay';

export default function CustomTabPage() {
  const params = useParams();
  const tabId = params.id as string;
  const [tab, setTab] = useState<CustomTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTab();
  }, [tabId]);

  const fetchTab = async () => {
    try {
      setLoading(true);
      const data = await tabsAPI.getOne(tabId);
      setTab(data as CustomTab);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading tab...</div>;
  }

  if (!tab) {
    return (
      <div className="p-6">
        <div className="p-8 bg-red-50 border border-red-200 rounded text-red-700 text-center">
          Tab not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{tab.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{tab.name}</h1>
          {tab.subtitle && <p className="text-gray-600">{tab.subtitle}</p>}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {tab.type === 'cards' && (
        <TabCardDisplay
          tabId={tab.id}
          tabName={tab.name}
          columns={tab.columns}
          searchEnabled={tab.searchBar}
        />
      )}

      {tab.type === 'form' && <TabFormDisplay tabId={tab.id} tabName={tab.name} />}

      {tab.type === 'checklist' && (
        <TabChecklistDisplay tabId={tab.id} tabName={tab.name} />
      )}
    </div>
  );
}
