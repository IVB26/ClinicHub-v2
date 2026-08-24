'use client';

import { useState } from 'react';
import { receptionAPI } from '@/lib/api';
import type { Client, Pet } from '@/lib/types';

interface ClientManagerProps {
  clients: Client[];
  onClientsChange: () => void;
}

export function ClientManager({ clients, onClientsChange }: ClientManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Client>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergencyContact: '',
    emergencyPhone: '',
    pets: [],
    notes: '',
  });
  const [newPet, setNewPet] = useState<Pet>({
    name: '',
    type: 'Dog',
    breed: '',
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPet = () => {
    if (!newPet.name.trim() || !newPet.breed.trim()) {
      setError('Pet name and breed are required');
      return;
    }
    setFormData({
      ...formData,
      pets: [...formData.pets, { ...newPet }],
    });
    setNewPet({ name: '', type: 'Dog', breed: '' });
  };

  const handleRemovePet = (index: number) => {
    setFormData({
      ...formData,
      pets: formData.pets.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    try {
      if (editingId) {
        await receptionAPI.clients.update(editingId, formData as unknown as Record<string, unknown>);
      } else {
        await receptionAPI.clients.create(formData as unknown as Record<string, unknown>);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        emergencyContact: '',
        emergencyPhone: '',
        pets: [],
        notes: '',
      });
      setError('');
      onClientsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      await receptionAPI.clients.delete(id);
      onClientsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergencyContact: '',
      emergencyPhone: '',
      pets: [],
      notes: '',
    });
    setNewPet({ name: '', type: 'Dog', breed: '' });
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
            placeholder="Search clients by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Client
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold">{editingId ? 'Edit Client' : 'New Client'}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
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

            {/* Pets Section */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">Pets ({formData.pets.length})</h4>

              <div className="space-y-2 mb-4">
                {formData.pets.map((pet, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{pet.name}</div>
                      <div className="text-sm text-gray-600">
                        {pet.type} - {pet.breed}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePet(idx)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newPet.name}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      placeholder="Pet name"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Type</label>
                    <select
                      value={newPet.type}
                      onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Rabbit</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Breed</label>
                    <input
                      type="text"
                      value={newPet.breed}
                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                      placeholder="Breed"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPet}
                  className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
                >
                  Add Pet
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update Client' : 'Create Client'}
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

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            {clients.length === 0
              ? 'No clients yet. Create one to get started!'
              : 'No clients match your search.'}
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{client.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="font-medium">{client.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="font-medium">{client.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">City: </span>
                      <span className="font-medium">{client.city || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pets: </span>
                      <span className="font-medium">{client.pets.length}</span>
                    </div>
                  </div>

                  {client.pets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {client.pets.map((pet, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {pet.name} ({pet.type})
                        </span>
                      ))}
                    </div>
                  )}

                  {client.notes && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                      {client.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(client)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => client.id && handleDelete(client.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
