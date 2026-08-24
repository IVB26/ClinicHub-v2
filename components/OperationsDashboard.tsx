'use client';

import { useMemo } from 'react';
import type { OperationTask } from '@/lib/types';

interface OperationsDashboardProps {
  tasks: OperationTask[];
  onRefresh: () => void;
}

export function OperationsDashboard({ tasks, onRefresh }: OperationsDashboardProps) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.due_date === today);

    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completedToday: todayTasks.filter((t) => t.status === 'completed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
    };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'cancelled')
      .sort((a, b) => {
        const aDate = new Date(a.due_date + (a.due_time ? `T${a.due_time}` : 'T00:00')).getTime();
        const bDate = new Date(b.due_date + (b.due_time ? `T${b.due_time}` : 'T00:00')).getTime();
        return bDate - aDate;
      })
      .slice(0, 8);
  }, [tasks]);

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
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '⏳' };
      case 'in_progress':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '▶' };
      case 'completed':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✓' };
      case 'cancelled':
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '✕' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '?' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="text-orange-600 text-3xl mb-2">⏳</div>
          <div className="text-sm text-gray-600">Pending Tasks</div>
          <div className="text-4xl font-bold text-gray-900">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="text-blue-600 text-3xl mb-2">▶</div>
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-4xl font-bold text-gray-900">{stats.inProgress}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="text-green-600 text-3xl mb-2">✓</div>
          <div className="text-sm text-gray-600">Completed Today</div>
          <div className="text-4xl font-bold text-gray-900">{stats.completedToday}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="text-gray-600 text-3xl mb-2">✕</div>
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-4xl font-bold text-gray-900">{stats.cancelled}</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No tasks yet</p>
            <p className="text-sm mt-1">Create your first operation task to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => {
              const catColor = getCategoryColor(task.category);
              const prioColor = getPriorityColor(task.priority);
              const statusColor = getStatusColor(task.status);

              return (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-gray-50 transition border-l-4 ${statusColor.border}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={statusColor.text}>{statusColor.icon}</span>
                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${catColor.bg} ${catColor.text}`}>
                          {task.category}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${prioColor.bg} ${prioColor.text}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-gray-600">
                        {task.due_date}
                        {task.due_time && <div className="text-xs text-gray-500">{task.due_time}</div>}
                      </div>
                      {task.assigned_to && (
                        <div className="text-xs text-gray-500 mt-1">Assigned to {task.assigned_to}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperationsDashboard;
