'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface ChecklistItem {
  id: number;
  tab_id: number;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at?: string;
}

interface TabChecklistDisplayProps {
  tabId: number;
  tabName: string;
}

export function TabChecklistDisplay({ tabId, tabName }: TabChecklistDisplayProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    fetchItems();
  }, [tabId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/api/tab-checklist/${tabId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) {
      setError('Item title is required');
      return;
    }

    try {
      await apiCall('/api/tab-checklist', {
        method: 'POST',
        body: JSON.stringify({
          tab_id: tabId,
          title: newItemTitle,
          completed: false,
          sort_order: items.length,
        }),
      });

      setNewItemTitle('');
      setError('');
      fetchItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      await apiCall(`/api/tab-checklist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !completed }),
      });

      fetchItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;

    try {
      await apiCall(`/api/tab-checklist/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading checklist...</div>;
  }

  const completedCount = items.filter((i) => i.completed).length;
  const completionPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">
            Progress: {completedCount}/{items.length}
          </h2>
          <span className="text-2xl font-bold text-blue-600">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add new item..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">No items yet. Add one to get started!</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                item.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item.id, item.completed)}
                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
              />
              <span
                className={`flex-1 text-lg ${
                  item.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {item.title}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
