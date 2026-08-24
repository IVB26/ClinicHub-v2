'use client';

import { useState } from 'react';
import { receptionAPI } from '@/lib/api';
import type { Appointment, Client, AppointmentStatus, AppointmentService } from '@/lib/types';

interface AppointmentManagerProps {
  appointments: Appointment[];
  clients: Client[];
  onAppointmentsChange: () => void;
}

const SERVICES: AppointmentService[] = ['checkup', 'vaccination', 'surgery', 'grooming', 'dental', 'other'];

export function AppointmentManager({
  appointments,
  clients,
  onAppointmentsChange,
}: AppointmentManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formData, setFormData] = useState<Appointment>({
    clientId: 0,
    petId: undefined,
    petName: '',
    dateTime: '',
    service: 'checkup',
    duration: 30,
    notes: '',
    status: 'scheduled',
    reminderSent: false,
  });

  // Filter appointments by date or show all
  const filteredAppointments = dateFilter
    ? appointments.filter((apt) => apt.dateTime.startsWith(dateFilter))
    : appointments;

  // Sort by date/time
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const getClientName = (clientId: number) => {
    return clients.find((c) => c.id === clientId)?.name || 'Unknown Client';
  };

  const getClientPets = (clientId: number) => {
    return clients.find((c) => c.id === clientId)?.pets || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.dateTime || !formData.service) {
      setError('Client, date/time, and service are required');
      return;
    }

    try {
      const payload = {
        clientId: formData.clientId,
        petId: formData.petId,
        petName: formData.petName,
        clientName: getClientName(formData.clientId),
        dateTime: formData.dateTime,
        service: formData.service,
        duration: formData.duration,
        notes: formData.notes,
        status: formData.status,
        reminderSent: formData.reminderSent,
      };

      if (editingId) {
        await receptionAPI.appointments.update(editingId, payload);
      } else {
        await receptionAPI.appointments.create(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        clientId: 0,
        petId: undefined,
        petName: '',
        dateTime: '',
        service: 'checkup',
        duration: 30,
        notes: '',
        status: 'scheduled',
        reminderSent: false,
      });
      setError('');
      onAppointmentsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (apt: Appointment) => {
    setFormData(apt);
    setEditingId(apt.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await receptionAPI.appointments.delete(id);
      onAppointmentsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      clientId: 0,
      petId: undefined,
      petName: '',
      dateTime: '',
      service: 'checkup',
      duration: 30,
      notes: '',
      status: 'scheduled',
      reminderSent: false,
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
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Clear Filter
            </button>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + New Appointment
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold">{editingId ? 'Edit Appointment' : 'New Appointment'}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => {
                    const clientId = parseInt(e.target.value);
                    setFormData({ ...formData, clientId });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.clientId > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet (Optional)</label>
                  <select
                    value={formData.petId || ''}
                    onChange={(e) => {
                      const petId = e.target.value ? parseInt(e.target.value) : undefined;
                      const petName =
                        getClientPets(formData.clientId).find((p) => p.id === petId)?.name || '';
                      setFormData({ ...formData, petId, petName });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All pets</option>
                    {getClientPets(formData.clientId).map((pet, idx) => (
                      <option key={idx} value={pet.id}>
                        {pet.name} ({pet.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value as AppointmentService })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as AppointmentStatus })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-Show</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.reminderSent}
                onChange={(e) => setFormData({ ...formData, reminderSent: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                Reminder sent
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update Appointment' : 'Create Appointment'}
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

      {/* Appointments List */}
      <div className="space-y-3">
        {sortedAppointments.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            No appointments scheduled{dateFilter && ' for this date'}.
          </div>
        ) : (
          sortedAppointments.map((apt) => (
            <div
              key={apt.id}
              className={`p-4 border rounded-lg transition ${
                apt.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : apt.status === 'cancelled'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{apt.clientName}</h3>
                  {apt.petName && <div className="text-sm text-gray-600">Pet: {apt.petName}</div>}
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

              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 text-sm mb-2">
                <div>
                  <span className="text-gray-600">Date & Time: </span>
                  <span className="font-medium">
                    {new Date(apt.dateTime).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Service: </span>
                  <span className="font-medium capitalize">{apt.service}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration: </span>
                  <span className="font-medium">{apt.duration} min</span>
                </div>
                <div>
                  <span className="text-gray-600">Reminder: </span>
                  <span className="font-medium">{apt.reminderSent ? '✓ Sent' : 'Not sent'}</span>
                </div>
              </div>

              {apt.notes && (
                <div className="mb-3 p-2 bg-gray-100 rounded text-sm text-gray-700">
                  {apt.notes}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(apt)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => apt.id && handleDelete(apt.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
