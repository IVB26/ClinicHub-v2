'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';

interface SmsTemplate {
  id: number;
  name: string;
  category: string;
  content: string;
  variables: string[];
}

export default function SmsTemplatesPage() {
  const { user, isLoading } = useAuthContext();
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<SmsTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    setIsLoadingData(true);
    try {
      const stored = localStorage.getItem('vl_sms_templates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      } else {
        const defaults: SmsTemplate[] = [
          {
            id: 1,
            name: 'Appointment Reminder',
            category: 'Appointment',
            content: 'Hi {{petName}}, reminder: your appointment with {{clinicName}} is on {{date}} at {{time}}. Reply STOP to cancel.',
            variables: ['petName', 'clinicName', 'date', 'time'],
          },
          {
            id: 2,
            name: 'Boarding Check-in',
            category: 'Boarding',
            content: '{{petName}} has checked in for boarding at {{clinicName}}. Contact {{phone}} with any questions.',
            variables: ['petName', 'clinicName', 'phone'],
          },
          {
            id: 3,
            name: 'Boarding Check-out',
            category: 'Boarding',
            content: '{{petName}} is ready for pickup! Please collect from {{clinicName}} before {{time}}.',
            variables: ['petName', 'clinicName', 'time'],
          },
          {
            id: 4,
            name: 'Medical Alert',
            category: 'Medical',
            content: 'Alert: {{petName}} medication refill due. Please contact {{clinicName}} to schedule.',
            variables: ['petName', 'clinicName'],
          },
        ];
        setTemplates(defaults);
        localStorage.setItem('vl_sms_templates', JSON.stringify(defaults));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(term) || t.content.toLowerCase().includes(term)
      );
    }

    setFilteredTemplates(filtered);
  };

  const categories = Array.from(new Set(templates.map(t => t.category))).sort();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Templates</h1>
          <p className="text-gray-600 mt-1">Pre-built SMS messages for automated communications</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            + New Template
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
          placeholder="Search templates..."
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

      {/* Templates Grid */}
      {isLoadingData ? (
        <div className="text-center py-12 text-gray-600">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {templates.length === 0 ? 'No templates yet' : 'No templates match your search'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="mb-3">
                <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>

              {template.variables.length > 0 && (
                <div className="mb-4 p-2 bg-blue-50 rounded">
                  <p className="text-xs font-medium text-blue-900 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map(v => (
                      <span key={v} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {'{{' + v + '}}'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsFormOpen(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <TemplateFormModal
          template={selectedTemplate}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTemplate(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedTemplate(null);
            loadTemplates();
          }}
          isReadOnly={!canEdit}
        />
      )}
    </div>
  );
}

interface TemplateFormModalProps {
  template: SmsTemplate | null;
  onClose: () => void;
  onSave: () => void;
  isReadOnly: boolean;
}

function TemplateFormModal({ template, onClose, onSave, isReadOnly }: TemplateFormModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState(template?.category || '');
  const [content, setContent] = useState(template?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const vars: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      vars.push(match[1]);
    }
    return [...new Set(vars)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      setError('Name and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const stored = localStorage.getItem('vl_sms_templates') || '[]';
      let templates = JSON.parse(stored) as SmsTemplate[];
      const variables = extractVariables(content);

      if (template) {
        templates = templates.map(t =>
          t.id === template.id ? { ...t, name, category, content, variables } : t
        );
      } else {
        const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
        templates.push({ id: newId, name, category, content, variables });
      }

      localStorage.setItem('vl_sms_templates', JSON.stringify(templates));
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variables = extractVariables(content);
  const charCount = content.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
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
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              placeholder="e.g., Appointment Reminder"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              placeholder="e.g., Appointment, Boarding, Medical"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content ({charCount}/160 characters)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 ${
                charCount > 160 ? 'border-yellow-500' : 'border-gray-300'
              }`}
              placeholder="Use {{variable}} for dynamic content. Example: Hi {{name}}, your appointment is {{time}}"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              SMS messages work best under 160 characters. Longer messages will be split into multiple parts.
            </p>
          </div>

          {variables.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Variables detected:</p>
              <div className="flex flex-wrap gap-2">
                {variables.map(v => (
                  <span key={v} className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded">
                    {'{{' + v + '}}'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
              >
                {isSubmitting ? 'Saving...' : template ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg"
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
