'use client';

import { useState } from 'react';
import { bankingAPI } from '@/lib/api';
import type { BankingTransaction, PaymentMethod } from '@/lib/types';

interface TransactionManagerProps {
  transactions: BankingTransaction[];
  onTransactionsChange: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'check', label: 'Check', icon: '✓' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'other', label: 'Other', icon: '💎' },
];

export function TransactionManager({ transactions, onTransactionsChange }: TransactionManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<BankingTransaction>({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    amount: 0,
    clientName: '',
    service: '',
    reference: '',
    notes: '',
    status: 'recorded',
  });

  const filteredTransactions = transactions
    .filter((t) => !dateFilter || t.date === dateFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      if (editingId) {
        await bankingAPI.transactions.update(editingId, formData as unknown as Record<string, unknown>);
      } else {
        await bankingAPI.transactions.create(formData as unknown as Record<string, unknown>);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        amount: 0,
        clientName: '',
        service: '',
        reference: '',
        notes: '',
        status: 'recorded',
      });
      setError('');
      onTransactionsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (transaction: BankingTransaction) => {
    setFormData(transaction);
    setEditingId(transaction.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await bankingAPI.transactions.delete(id);
      onTransactionsChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      amount: 0,
      clientName: '',
      service: '',
      reference: '',
      notes: '',
      status: 'recorded',
    });
    setError('');
  };

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      acc.total += t.amount;
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
      return acc;
    },
    { total: 0, cash: 0, card: 0, check: 0, bank_transfer: 0, other: 0 } as Record<string, number>
  );

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
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Transaction
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold">{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount * ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <div className="grid grid-cols-5 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: pm.value })}
                    className={`p-3 rounded-lg border-2 transition text-center ${
                      formData.paymentMethod === pm.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pm.icon}</div>
                    <div className="text-xs font-medium">{pm.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service/Item</label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Invoice #, Check #, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update Transaction' : 'Record Transaction'}
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

      {/* Totals Summary */}
      {filteredTransactions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-3">Daily Summary</h3>
          <div className="grid grid-cols-6 gap-3 text-sm">
            <div>
              <div className="text-gray-600">💵 Cash</div>
              <div className="font-bold text-lg">${totals.cash.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">💳 Card</div>
              <div className="font-bold text-lg">${totals.card.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">✓ Check</div>
              <div className="font-bold text-lg">${totals.check.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">🏦 Transfer</div>
              <div className="font-bold text-lg">${totals.bank_transfer.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">💎 Other</div>
              <div className="font-bold text-lg">${totals.other.toFixed(2)}</div>
            </div>
            <div className="bg-blue-100 rounded p-2">
              <div className="text-blue-700 font-medium">Total</div>
              <div className="font-bold text-xl text-blue-900">${totals.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            No transactions for this date.
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {PAYMENT_METHODS.find((pm) => pm.value === t.paymentMethod)?.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">
                        ${t.amount.toFixed(2)}
                        {t.service && ` - ${t.service}`}
                      </h3>
                      {t.clientName && <div className="text-sm text-gray-600">{t.clientName}</div>}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {PAYMENT_METHODS.find((pm) => pm.value === t.paymentMethod)?.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                {t.reference && (
                  <div>
                    <span className="text-gray-600">Ref: </span>
                    <span className="font-medium">{t.reference}</span>
                  </div>
                )}
                {t.notes && (
                  <div className="col-span-3">
                    <span className="text-gray-600">Notes: </span>
                    <span className="text-gray-700">{t.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(t)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => t.id && handleDelete(t.id)}
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
