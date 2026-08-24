'use client';

import { useState, useEffect } from 'react';
import { receptionAPI } from '@/lib/api';
import type { Client, Appointment, CallLog } from '@/lib/types';
import { ReceptionDashboard } from '@/components/ReceptionDashboard';
import { ClientManager } from '@/components/ClientManager';
import { AppointmentManager } from '@/components/AppointmentManager';
import { CallLogManager } from '@/components/CallLogManager';

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'appointments' | 'calls'>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [clientsData, appointmentsData, callsData] = await Promise.all([
        receptionAPI.clients.getAll(),
        receptionAPI.appointments.getAll(),
        receptionAPI.callLog.getAll(),
      ]);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setCallLogs(Array.isArray(callsData) ? callsData : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading reception data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reception</h1>
          <p className="text-gray-600 mt-1">Manage clients, appointments, and communications</p>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'clients', label: 'Clients', icon: '👥' },
              { id: 'appointments', label: 'Appointments', icon: '📅' },
              { id: 'calls', label: 'Call Log', icon: '☎️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <ReceptionDashboard
            clients={clients}
            appointments={appointments}
            callLogs={callLogs}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === 'clients' && (
          <ClientManager clients={clients} onClientsChange={loadAllData} />
        )}
        {activeTab === 'appointments' && (
          <AppointmentManager
            appointments={appointments}
            clients={clients}
            onAppointmentsChange={loadAllData}
          />
        )}
        {activeTab === 'calls' && (
          <CallLogManager
            callLogs={callLogs}
            clients={clients}
            onCallsChange={loadAllData}
          />
        )}
      </div>
    </div>
  );
}
