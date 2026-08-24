'use client';

import { useState, useMemo } from 'react';
import { operationsAPI } from '@/lib/api';
import type { OperationTask, TaskCategory, TaskPriority, TaskStatus } from '@/lib/types';

interface TaskManagerProps {
  tasks: OperationTask[];
  onTaskCreated: (task: OperationTask) => void;
  onTaskUpdated: (task: OperationTask) => void;
  onTaskDeleted: (taskId: number) => void;
  onRefresh: () => void;
}

const CATEGORIES: TaskCategory[] = ['Morning Tasks', 'Midday Tasks', 'Afternoon/Evening', 'Daily Tasks'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

export function TaskManager({
  tasks,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onRefresh,
}: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [formData, setFormData] = useState<Partial<OperationTask>>({
    title: '',
    description: '',
    category: 'Daily Tasks',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    assigned_to: '',
    status: 'pending',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const handleInputChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        const updated = await operationsAPI.tasks.update(editingId, formData);
        onTaskUpdated(updated);
        setEditingId(null);
      } else {
        const created = await operationsAPI.tasks.create(formData);
        onTaskCreated(created);
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      console.error('Failed to save task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: OperationTask) => {
    setFormData(task);
    setEditingId(task.id || null);
    setShowForm(true);
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    setError(null);

    try {
      await operationsAPI.tasks.delete(taskId);
      onTaskDeleted(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await operationsAPI.tasks.update(taskId, { status: newStatus });
      onTaskUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Daily Tasks',
      priority: 'medium',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '',
      assigned_to: '',
      status: 'pending',
      notes: '',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Morning Tasks': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Midday Tasks': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Afternoon/Evening': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Daily Tasks': { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⏳' };
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '▶' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✕' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
        >
          ✚ New Task
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority || ''}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                <input
                  type="time"
                  value={formData.due_time || ''}
                  onChange={(e) => handleInputChange('due_time', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  placeholder="Staff member name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any notes or comments"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...STATUSES] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All Tasks' : status.replace('_', ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            {status !== 'all' && ` (${tasks.filter((t) => t.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const catColor = getCategoryColor(task.category);
            const prioColor = getPriorityColor(task.priority);
            const statusColor = getStatusColor(task.status);

            return (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`text-lg mt-1 flex-shrink-0 ${statusColor.text}`}>
                        {statusColor.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 mb-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${catColor.bg} ${catColor.text}`}>
                        {task.category}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${prioColor.bg} ${prioColor.text}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColor.bg} ${statusColor.text}`}>
                        {task.status.replace('_', ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>

                    {task.assigned_to && (
                      <p className="text-xs text-gray-600">👤 Assigned to: {task.assigned_to}</p>
                    )}
                  </div>

                  {/* Due Date & Time */}
                  <div className="flex-shrink-0 text-right text-sm text-gray-600">
                    <div>📅 {task.due_date}</div>
                    {task.due_time && <div>🕐 {task.due_time}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 md:flex-col lg:flex-row">
                    <button
                      onClick={() => handleEdit(task)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => task.id && handleDelete(task.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 font-medium rounded hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Status Quick Actions */}
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    {task.status !== 'in_progress' && (
                      <button
                        onClick={() => task.id && handleStatusChange(task.id, 'in_progress')}
                        disabled={loading}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition disabled:opacity-50"
                      >
                        ▶ Start
                      </button>
                    )}
                    {task.status !== 'pending' && (
                      <button
                        onClick={() => task.id && handleStatusChange(task.id, 'pending')}
                        disabled={loading}
                        className="text-xs px-3 py-1 bg-orange-100 text-orange-700 font-medium rounded hover:bg-orange-200 transition disabled:opacity-50"
                      >
                        ⏳ Pending
                      </button>
                    )}
                    <button
                      onClick={() => task.id && handleStatusChange(task.id, 'completed')}
                      disabled={loading}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 font-medium rounded hover:bg-green-200 transition disabled:opacity-50"
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() => task.id && handleStatusChange(task.id, 'cancelled')}
                      disabled={loading}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                )}

                {task.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Notes:</p>
                    <p className="text-xs text-gray-700 mt-1">{task.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TaskManager;
