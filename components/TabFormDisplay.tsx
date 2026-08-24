'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface FormField {
  id: number;
  tab_id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  sort_order: number;
}

interface FormSubmission {
  id: number;
  tab_id: number;
  data: Record<string, unknown>;
  created_at?: string;
}

interface TabFormDisplayProps {
  tabId: number;
  tabName: string;
}

export function TabFormDisplay({ tabId, tabName }: TabFormDisplayProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'form' | 'submissions'>('form');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isAddingField, setIsAddingField] = useState(false);
  const [fieldData, setFieldData] = useState({
    name: '',
    label: '',
    type: 'text' as const,
    required: false,
  });

  useEffect(() => {
    fetchForm();
  }, [tabId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const [fieldsData, submissionsData] = await Promise.all([
        apiCall(`/api/tab-form-fields/${tabId}`),
        apiCall(`/api/tab-form-submissions/${tabId}`),
      ]);
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldData.name.trim() || !fieldData.label.trim()) {
      setError('Field name and label are required');
      return;
    }

    try {
      await apiCall('/api/tab-form-fields', {
        method: 'POST',
        body: JSON.stringify({
          tab_id: tabId,
          name: fieldData.name,
          label: fieldData.label,
          type: fieldData.type,
          required: fieldData.required,
          sort_order: fields.length,
        }),
      });

      setFieldData({ name: '', label: '', type: 'text', required: false });
      setIsAddingField(false);
      setError('');
      fetchForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm('Delete this field?')) return;

    try {
      await apiCall(`/api/tab-form-fields/${id}`, { method: 'DELETE' });
      fetchForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = fields.filter((f) => f.required && !formValues[f.name]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`);
      return;
    }

    try {
      await apiCall('/api/tab-form-submissions', {
        method: 'POST',
        body: JSON.stringify({
          tab_id: tabId,
          data: formValues,
        }),
      });

      setFormValues({});
      setError('');
      setView('submissions');
      fetchForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading form...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setView('form')}
          className={`px-4 py-2 font-medium border-b-2 -mb-1 transition ${
            view === 'form'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Fill Form
        </button>
        <button
          onClick={() => setView('submissions')}
          className={`px-4 py-2 font-medium border-b-2 -mb-1 transition ${
            view === 'submissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Submissions ({submissions.length})
        </button>
      </div>

      {view === 'form' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Form Fields ({fields.length})</h2>
            <button
              onClick={() => setIsAddingField(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              + Add Field
            </button>
          </div>

          {isAddingField && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-4">New Field</h3>
              <form onSubmit={handleAddField} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name (internal)
                  </label>
                  <input
                    type="text"
                    value={fieldData.name}
                    onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
                    placeholder="e.g., email, phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label (displayed to users)
                  </label>
                  <input
                    type="text"
                    value={fieldData.label}
                    onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
                    placeholder="e.g., Email Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={fieldData.type}
                    onChange={(e) =>
                      setFieldData({
                        ...fieldData,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={fieldData.required}
                    onChange={(e) =>
                      setFieldData({ ...fieldData, required: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="required" className="text-sm font-medium text-gray-700">
                    Required
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Field
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingField(false);
                      setFieldData({ name: '', label: '', type: 'text', required: false });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {fields.length === 0 ? (
            <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center mb-4">
              <p className="text-gray-500">No fields yet. Add one to create the form.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">{field.label}</p>
                    <p className="text-sm text-gray-600">
                      {field.type}
                      {field.required && ' (required)'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <form onSubmit={handleSubmitForm} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-bold">Fill Form</h3>
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.name] || ''}
                      onChange={(e) =>
                        setFormValues({ ...formValues, [field.name]: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.name] || ''}
                      onChange={(e) =>
                        setFormValues({ ...formValues, [field.name]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Submit Form
              </button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold mb-4">Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(submission.created_at || '').toLocaleString()}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(submission.data).map(([key, value]) => (
                      <div key={key} className="flex gap-4">
                        <div className="font-medium text-gray-700 min-w-32">
                          {fields.find((f) => f.name === key)?.label || key}:
                        </div>
                        <div className="text-gray-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
