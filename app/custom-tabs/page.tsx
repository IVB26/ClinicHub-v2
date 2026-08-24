'use client';

import { useState, useEffect } from 'react';
import { tabsAPI } from '@/lib/api';
import type { CustomTab } from '@/lib/types';

const EMOJI_ICONS = ['📚', '📋', '✅', '🎯', '📊', '💼', '🔧', '📝', '⚙️', '🎨', '📱', '🌟'];

export default function CustomTabsPage() {
  const [tabs, setTabs] = useState<CustomTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    subtitle: string;
    icon: string;
    type: 'cards' | 'form' | 'checklist';
    location: 'sidebar' | 'top';
    columns: number;
    searchBar: boolean;
  }>({
    name: '',
    subtitle: '',
    icon: EMOJI_ICONS[0],
    type: 'cards',
    location: 'sidebar',
    columns: 2,
    searchBar: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      setLoading(true);
      const data = await tabsAPI.getAll();
      setTabs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Tab name is required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        subtitle: formData.subtitle || null,
        icon: formData.icon,
        type: formData.type,
        location: formData.location,
        columns: formData.type === 'cards' ? formData.columns : null,
        searchBar: formData.type === 'cards' ? formData.searchBar : false,
      };

      if (editingId) {
        await tabsAPI.update(editingId.toString(), payload);
      } else {
        await tabsAPI.create(payload);
      }

      setFormData({
        name: '',
        subtitle: '',
        icon: EMOJI_ICONS[0],
        type: 'cards' as const,
        location: 'sidebar' as const,
        columns: 2,
        searchBar: true,
      });
      setEditingId(null);
      setError('');
      fetchTabs();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (tab: CustomTab) => {
    setEditingId(tab.id);
    setFormData({
      name: tab.name,
      subtitle: tab.subtitle || '',
      icon: tab.icon,
      type: tab.type as 'cards' | 'form' | 'checklist',
      location: tab.location as 'sidebar' | 'top',
      columns: tab.columns || 2,
      searchBar: tab.searchBar !== false,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tab? This cannot be undone.')) return;

    try {
      await tabsAPI.delete(id.toString());
      fetchTabs();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      subtitle: '',
      icon: EMOJI_ICONS[0],
      type: 'cards' as const,
      location: 'sidebar' as const,
      columns: 2,
      searchBar: true,
    });
  };

  if (loading) {
    return <div className="p-6">Loading custom tabs...</div>;
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Custom Tabs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="col-span-1 bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Tab' : 'Create Tab'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tab Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Protocols, Checklist"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Optional subtitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {EMOJI_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`py-2 text-xl rounded border-2 transition ${
                      formData.icon === emoji
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tab Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'cards' | 'form' | 'checklist',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="cards">Cards (Rich Text)</option>
                <option value="form">Form (Data Submission)</option>
                <option value="checklist">Checklist (Tasks)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value as 'sidebar' | 'top',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="sidebar">Sidebar</option>
                <option value="top">Top Menu</option>
              </select>
            </div>

            {formData.type === 'cards' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Columns
                  </label>
                  <select
                    value={formData.columns}
                    onChange={(e) =>
                      setFormData({ ...formData, columns: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="searchBar"
                    checked={formData.searchBar}
                    onChange={(e) =>
                      setFormData({ ...formData, searchBar: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="searchBar" className="text-sm font-medium text-gray-700">
                    Enable search bar
                  </label>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update Tab' : 'Create Tab'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabs List */}
        <div className="col-span-2">
          <h2 className="text-xl font-bold mb-4">Created Tabs ({tabs.length})</h2>

          {tabs.length === 0 ? (
            <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">No custom tabs yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{tab.icon}</span>
                        <h3 className="text-lg font-bold">{tab.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded font-medium ${
                            tab.type === 'cards'
                              ? 'bg-blue-100 text-blue-700'
                              : tab.type === 'form'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {tab.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded font-medium ${
                            tab.location === 'sidebar'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {tab.location}
                        </span>
                      </div>
                      {tab.subtitle && <p className="text-sm text-gray-600">{tab.subtitle}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {tab.type === 'cards' && (
                          <>
                            <span>Columns: {tab.columns}</span>
                            <span>{tab.searchBar ? 'Search enabled' : 'No search'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(tab)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tab.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
