'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { operationsAPI } from '@/lib/api';
import type { OperationTask } from '@/lib/types';

const OperationsDashboard = dynamic(() => import('@/components/OperationsDashboard'), { ssr: false });
const TaskManager = dynamic(() => import('@/components/TaskManager'), { ssr: false });

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>('dashboard');
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsAPI.tasks.getAll();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (task: OperationTask) => {
    setTasks((prev) => [task, ...prev]);
    setActiveTab('tasks');
  };

  const handleTaskUpdated = (updatedTask: OperationTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Operations Diaries</h1>
          <p className="text-gray-600">Daily operations task management and tracking</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-blue-600">⏳</div>
            <p className="text-gray-600 mt-2">Loading operations...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <OperationsDashboard tasks={tasks} onRefresh={fetchTasks} />
            )}
            {activeTab === 'tasks' && (
              <TaskManager
                tasks={tasks}
                onTaskCreated={handleTaskCreated}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onRefresh={fetchTasks}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
