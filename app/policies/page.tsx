'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { policiesAPI } from '@/lib/api';
import { QuillEditor } from '@/components/QuillEditor';
import type { Policy } from '@/lib/types';

export default function PoliciesPage() {
  const { user, isLoading } = useAuthContext();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, selectedCategory]);

  const loadPolicies = async () => {
    setIsLoadingPolicies(true);
    try {
      const data = await policiesAPI.getAll();
      setPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.overview?.toLowerCase().includes(term)
      );
    }

    setFilteredPolicies(filtered);
  };

  const categories = Array.from(
    new Set(policies.map(p => p.category).filter(Boolean))
  ).sort();

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-600 mt-1">Manage clinic policies and procedures</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedPolicy(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            + New Policy
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Policies Grid */}
      {isLoadingPolicies ? (
        <div className="text-center py-12 text-gray-600">Loading policies...</div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {policies.length === 0 ? 'No policies yet' : 'No policies match your search'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolicies.map(policy => (
            <div
              key={policy.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedPolicy(policy);
                setIsFormOpen(true);
              }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {policy.category && (
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {policy.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{policy.title}</h3>
                  {policy.overview && (
                    <p className="text-sm text-gray-600 line-clamp-2">{policy.overview}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <PolicyFormModal
          policy={selectedPolicy}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedPolicy(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedPolicy(null);
            loadPolicies();
          }}
          isReadOnly={!canEdit}
        />
      )}
    </div>
  );
}

interface PolicyFormModalProps {
  policy: Policy | null;
  onClose: () => void;
  onSave: () => void;
  isReadOnly: boolean;
}

function PolicyFormModal({ policy, onClose, onSave, isReadOnly }: PolicyFormModalProps) {
  const [title, setTitle] = useState(policy?.title || '');
  const [category, setCategory] = useState(policy?.category || '');
  const [overview, setOverview] = useState(policy?.overview || '');
  const [content, setContent] = useState(
    typeof policy?.content === 'string' ? policy.content : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) {
      setError('Title and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (policy) {
        await policiesAPI.update(policy.id.toString(), {
          title,
          category,
          overview,
          content,
        });
      } else {
        await policiesAPI.create({
          title,
          category,
          overview,
          content,
        });
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {policy ? 'View Policy' : 'New Policy'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
              placeholder="Policy title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="e.g., Clinic Operations, Safety, HR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overview
            </label>
            <textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="Brief summary of this policy"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            {isReadOnly ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <QuillEditor
                value={content}
                onChange={setContent}
                placeholder="Enter policy details, procedures, and guidelines..."
                height="350px"
              />
            )}
          </div>

          {!isReadOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {isSubmitting ? 'Saving...' : policy ? 'Update' : 'Create'}
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
