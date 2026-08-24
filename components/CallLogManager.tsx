'use client';

import { useState } from 'react';
import { receptionAPI } from '@/lib/api';
import type { CallLog, Client, CallType, CallOutcome } from '@/lib/types';

interface CallLogManagerProps {
  callLogs: CallLog[];
  clients: Client[];
  onCallsChange: () => void;
}

const CALL_OUTCOMES: CallOutcome[] = ['note', 'appointment', 'follow-up', 'question', 'complaint', 'other'];

export function CallLogManager({ callLogs, clients, onCallsChange }: CallLogManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CallLog>({
    clientId: 0,
    type: 'incoming',
    dateTime: new Date().toISOString().slice(0, 16),
    duration: 5,
    outcome: 'note',
    notes: '',
  });

  const filteredCallLogs = callLogs.filter(
    (log) =>
      log.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.outcome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLogs = [...filteredCallLogs].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  const getClientName = (clientId: number) => {
    return clients.find((c) => c.id === clientId)?.name || 'Unknown Client';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.dateTime) {
      setError('Client and date/time are required');
      return;
    }

    try {
      const payload = {
        clientId: formData.clientId,
        clientName: getClientName(formData.clientId),
        type: formData.type,
        dateTime: formData.dateTime,
        duration: formData.duration,
        outcome: formData.outcome,
        notes: formData.notes,
      };

      await receptionAPI.callLog.create(payload);

      setShowForm(false);
      setFormData({
        clientId: 0,
        type: 'incoming',
        dateTime: new Date().toISOString().slice(0, 16),
        duration: 5,
        outcome: 'note',
        notes: '',
      });
      setError('');
      onCallsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      clientId: 0,
      type: 'incoming',
      dateTime: new Date().toISOString().slice(0, 16),
      duration: 5,
      outcome: 'note',
      notes: '',
    });
    setError('');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          <input
            type="text"
            placeholder="Search by client name or outcome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Log Call
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold">Log Call</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={0}>Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CallType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="incoming">📥 Incoming</option>
                  <option value="outgoing">📤 Outgoing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value as CallOutcome })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {CALL_OUTCOMES.map((o) => (
                    <option key={o} value={o}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Call details, client concerns, follow-up actions needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Call Log
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Call Log List */}
      <div className="space-y-3">
        {sortedLogs.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            No calls logged yet.
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div
              key={log.id}
              className={`p-4 border rounded-lg transition ${
                log.type === 'incoming'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{log.type === 'incoming' ? '📥' : '📤'}</span>
                    <h3 className="text-lg font-bold">{log.clientName}</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date & Time: </span>
                      <span className="font-medium">
                        {new Date(log.dateTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration: </span>
                      <span className="font-medium">{log.duration} min</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Outcome: </span>
                      <span className="font-medium capitalize">{log.outcome}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type: </span>
                      <span className="font-medium capitalize">{log.type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {log.notes && (
                <div className="mt-2 p-3 bg-white rounded border border-gray-200 text-sm text-gray-700">
                  {log.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
