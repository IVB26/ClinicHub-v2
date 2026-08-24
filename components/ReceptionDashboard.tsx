'use client';

import { useState } from 'react';
import type { Client, Appointment, CallLog } from '@/lib/types';

interface ReceptionDashboardProps {
  clients: Client[];
  appointments: Appointment[];
  callLogs: CallLog[];
  onRefresh: () => void;
}

export function ReceptionDashboard({
  clients,
  appointments,
  callLogs,
  onRefresh,
}: ReceptionDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Get today's appointments
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((apt) => new Date(apt.dateTime).toDateString() === today);

  // Count stats
  const totalClients = clients.length;
  const scheduledCount = todayAppointments.filter((apt) => apt.status === 'scheduled').length;
  const completedToday = todayAppointments.filter((apt) => apt.status === 'completed').length;
  const callsToday = callLogs.filter((log) => new Date(log.dateTime).toDateString() === today).length;

  // Search clients
  const searchResults = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-sm font-medium text-blue-600">Total Clients</div>
          <div className="text-3xl font-bold text-blue-900">{totalClients}</div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-sm font-medium text-purple-600">Today's Appointments</div>
          <div className="text-3xl font-bold text-purple-900">{scheduledCount}</div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="text-3xl mb-2">✓</div>
          <div className="text-sm font-medium text-green-600">Completed Today</div>
          <div className="text-3xl font-bold text-green-900">{completedToday}</div>
        </div>

        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <div className="text-3xl mb-2">☎️</div>
          <div className="text-sm font-medium text-orange-600">Calls Today</div>
          <div className="text-3xl font-bold text-orange-900">{callsToday}</div>
        </div>
      </div>

      {/* Quick Client Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">🔍 Quick Client Search</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
        />

        {searchTerm.trim() && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No clients found</div>
            ) : (
              searchResults.map((client) => (
                <div key={client.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.phone}</div>
                  {client.pets.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {client.pets.map((p) => p.name).join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">📅 Today's Appointments</h2>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No appointments scheduled for today</div>
        ) : (
          <div className="space-y-3">
            {todayAppointments
              .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-lg">{apt.clientName}</div>
                      <div className="text-sm text-gray-600">
                        {apt.petName && `Pet: ${apt.petName}`}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : apt.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-gray-600">Time: </span>
                      <span className="font-medium">
                        {new Date(apt.dateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Service: </span>
                      <span className="font-medium capitalize">{apt.service}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration: </span>
                      <span className="font-medium">{apt.duration || 30} min</span>
                    </div>
                  </div>

                  {apt.notes && <div className="text-sm text-gray-700 bg-white p-2 rounded">{apt.notes}</div>}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">☎️ Recent Calls</h2>

        {callLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No calls logged yet</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {callLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${log.type === 'incoming' ? '📥' : '📤'}`} />
                      <span className="font-medium">{log.clientName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.dateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{log.outcome}</div>
                  </div>
                  {log.duration && <div className="text-xs text-gray-500">{log.duration} min</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onRefresh}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Refresh Data
      </button>
    </div>
  );
}
