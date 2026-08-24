'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { protocolsAPI } from '@/lib/api';
import type { ProtocolCategory, ProtocolItem, ProtocolBlock } from '@/lib/types';

export default function ProtocolsPage() {
  const { user, isLoading } = useAuthContext();
  const [categories, setCategories] = useState<ProtocolCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [items, setItems] = useState<Record<number, ProtocolItem[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<ProtocolCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProtocolItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoadingData(true);
    try {
      const data = await protocolsAPI.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadItems = async (categoryId: number) => {
    try {
      const data = await protocolsAPI.items.getByCategory(categoryId);
      setItems(prev => ({ ...prev, [categoryId]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    }
  };

  const toggleCategory = (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      if (!items[categoryId]) {
        loadItems(categoryId);
      }
    }
  };

  const handleSaveCategory = async (name: string, color: string) => {
    try {
      if (selectedCategory) {
        await protocolsAPI.categories.update(selectedCategory.id, { name, color });
      } else {
        await protocolsAPI.categories.create({ name, color, sort_order: categories.length });
      }
      setShowCategoryModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category? All items and blocks will be deleted.')) return;
    try {
      await protocolsAPI.categories.delete(id);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleSaveItem = async (title: string, description: string) => {
    if (!expandedCategory) return;
    try {
      if (selectedItem) {
        await protocolsAPI.items.update(selectedItem.id, { title, description });
      } else {
        await protocolsAPI.items.create({
          category_id: expandedCategory,
          title,
          description,
          sort_order: (items[expandedCategory]?.length || 0),
        });
      }
      setShowItemModal(false);
      setSelectedItem(null);
      loadItems(expandedCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this item? All blocks will be deleted.')) return;
    try {
      await protocolsAPI.items.delete(id);
      if (expandedCategory) loadItems(expandedCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Protocols & Guidelines</h1>
          <p className="text-gray-600 mt-1">Organize and manage clinical protocols by category</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowCategoryModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            + New Category
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Categories */}
      {isLoadingData ? (
        <div className="text-center py-12 text-gray-600">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No categories yet</div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-bold text-gray-900">{category.name}</span>
                  {expandedCategory === category.id && (
                    <span className="text-sm text-gray-600">
                      ({items[category.id]?.length || 0} items)
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {expandedCategory === category.id ? '▼' : '▶'}
                </span>
              </button>

              {/* Category Actions */}
              {canEdit && (
                <div className="px-6 py-2 bg-gray-50 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Items List */}
              {expandedCategory === category.id && (
                <div className="border-t border-gray-200">
                  {!items[category.id] ? (
                    <div className="px-6 py-4 text-gray-600 text-sm">Loading items...</div>
                  ) : items[category.id].length === 0 ? (
                    <div className="px-6 py-4 text-gray-600 text-sm">No items in this category</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {items[category.id].map(item => (
                        <div key={item.id} className="px-6 py-3 flex justify-between items-start hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                          {canEdit && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowItemModal(true);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Item Button */}
                  {canEdit && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedItem(null);
                          setShowItemModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          isReadOnly={!canEdit}
        />
      )}

      {/* Item Modal */}
      {showItemModal && expandedCategory && (
        <ItemModal
          item={selectedItem}
          onClose={() => {
            setShowItemModal(false);
            setSelectedItem(null);
          }}
          onSave={handleSaveItem}
          isReadOnly={!canEdit}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: ProtocolCategory | null;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  isReadOnly: boolean;
}

function CategoryModal({ category, onClose, onSave, isReadOnly }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(name, color);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="e.g., Anesthesia, Surgery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded border-2 transition ${
                    color === c ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface ItemModalProps {
  item: ProtocolItem | null;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  isReadOnly: boolean;
}

function ItemModal({ item, onClose, onSave, isReadOnly }: ItemModalProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(title, description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Item' : 'New Item'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="Item title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {!isReadOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
