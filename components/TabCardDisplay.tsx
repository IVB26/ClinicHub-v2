'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface TabCard {
  id: number;
  tab_id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface TabCardDisplayProps {
  tabId: number;
  tabName: string;
  columns?: number;
  searchEnabled?: boolean;
}

export function TabCardDisplay({
  tabId,
  tabName,
  columns = 2,
  searchEnabled = true,
}: TabCardDisplayProps) {
  const [cards, setCards] = useState<TabCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCards();
  }, [tabId]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/api/tab-cards/${tabId}`);
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      if (editingId) {
        await apiCall(`/api/tab-cards/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: formData.title, content: formData.content }),
        });
      } else {
        await apiCall('/api/tab-cards', {
          method: 'POST',
          body: JSON.stringify({
            tab_id: tabId,
            title: formData.title,
            content: formData.content,
          }),
        });
      }

      setFormData({ title: '', content: '' });
      setEditingId(null);
      setIsEditing(false);
      setError('');
      fetchCards();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this card?')) return;

    try {
      await apiCall(`/api/tab-cards/${id}`, { method: 'DELETE' });
      fetchCards();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredCards = searchEnabled
    ? cards.filter(
        (card) =>
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cards;

  if (loading) {
    return <div className="p-6">Loading cards...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {searchEnabled && (
        <div>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Cards ({filteredCards.length})</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setEditingId(null);
            setFormData({ title: '', content: '' });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Card
        </button>
      </div>

      {isEditing && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold mb-4">{editingId ? 'Edit Card' : 'New Card'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update Card' : 'Create Card'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`grid gap-4 grid-cols-${columns}`}>
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{card.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(card.id);
                    setFormData({ title: card.title, content: card.content });
                    setIsEditing(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{card.content}</p>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500">No cards yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
