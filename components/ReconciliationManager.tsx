'use client';

import { useState, useMemo } from 'react';
import { bankingAPI } from '@/lib/api';
import type { BankingTransaction, DailyReconciliation, ReconciliationStatus } from '@/lib/types';

interface ReconciliationManagerProps {
  transactions: BankingTransaction[];
  reconciliation: DailyReconciliation | null;
  onReconciliationChange: () => void;
}

export function ReconciliationManager({
  transactions,
  reconciliation,
  onReconciliationChange,
}: ReconciliationManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const todayTransactions = transactions.filter((t) => t.date === today);
  const actualTotal = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const [formData, setFormData] = useState<DailyReconciliation>(
    reconciliation || {
      date: today,
      openingBalance: 500,
      expectedTotal: 0,
      actualTotal: actualTotal,
      variance: 0,
      varianceReason: '',
      reconciliationNotes: '',
      status: 'pending',
    }
  );

  // Update actualTotal when transactions change
  useMemo(() => {
    setFormData((prev) => ({
      ...prev,
      actualTotal: actualTotal,
      variance: actualTotal - prev.expectedTotal,
    }));
  }, [actualTotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || formData.expectedTotal <= 0) {
      setError('Date and expected total are required');
      return;
    }

    try {
      if (reconciliation) {
        await bankingAPI.reconciliation.update(reconciliation.id || 0, formData as unknown as Record<string, unknown>);
      } else {
        await bankingAPI.reconciliation.create(formData as unknown as Record<string, unknown>);
      }

      setShowForm(false);
      setError('');
      onReconciliationChange();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(
      reconciliation || {
        date: today,
        openingBalance: 500,
        expectedTotal: 0,
        actualTotal: actualTotal,
        variance: 0,
        varianceReason: '',
        reconciliationNotes: '',
        status: 'pending',
      }
    );
    setError('');
  };

  const variancePercentage = formData.expectedTotal > 0 ? ((Math.abs(formData.variance) / formData.expectedTotal) * 100).toFixed(2) : '0';
  const isBalanced = Math.abs(formData.variance) < 0.01;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      {/* Reconciliation Status Card */}
      <div
        className={`rounded-lg border p-6 ${
          isBalanced
            ? 'bg-green-50 border-green-200'
            : formData.variance > 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isBalanced ? '✓ Balanced' : formData.variance > 0 ? '↑ Over' : '↓ Under'}
            </h2>
            <p className={`text-sm ${isBalanced ? 'text-green-600' : formData.variance > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {isBalanced
                ? 'Daily transactions reconciled perfectly'
                : `Variance of $${Math.abs(formData.variance).toFixed(2)} (${variancePercentage}%)`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">
              {isBalanced
                ? '✓'
                : formData.variance > 0
                  ? '↑'
                  : '↓'}
            </div>
            <div
              className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : formData.variance > 0 ? 'text-blue-600' : 'text-orange-600'}`}
            >
              ${Math.abs(formData.variance).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded p-3 opacity-75">
            <div className="text-gray-600">Opening Balance</div>
            <div className="font-bold text-lg">${formData.openingBalance.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded p-3 opacity-75">
            <div className="text-gray-600">Expected Total</div>
            <div className="font-bold text-lg">${formData.expectedTotal.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded p-3 opacity-75">
            <div className="text-gray-600">Actual Total</div>
            <div className="font-bold text-lg">${formData.actualTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold mb-3">Today's Transaction Summary</h3>
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-blue-600 mb-2">${actualTotal.toFixed(2)}</div>
          <div className="text-gray-600">{todayTransactions.length} transactions recorded</div>
        </div>
      </div>

      {/* Reconciliation Form */}
      {!showForm && reconciliation ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Daily Reconciliation - {reconciliation.date}</h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Update Reconciliation
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Opening Balance</div>
                <div className="font-bold text-lg">${reconciliation.openingBalance.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Expected Total</div>
                <div className="font-bold text-lg">${reconciliation.expectedTotal.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Actual Total</div>
                <div className="font-bold text-lg">${reconciliation.actualTotal.toFixed(2)}</div>
              </div>
              <div
                className={`p-3 rounded ${isBalanced ? 'bg-green-50' : 'bg-orange-50'}`}
              >
                <div className={`text-sm ${isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
                  Variance
                </div>
                <div className={`font-bold text-lg ${isBalanced ? 'text-green-700' : 'text-orange-700'}`}>
                  ${reconciliation.variance.toFixed(2)}
                </div>
              </div>
            </div>

            {reconciliation.varianceReason && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="text-sm font-medium text-orange-700 mb-1">Variance Reason</div>
                <div className="text-orange-900">{reconciliation.varianceReason}</div>
              </div>
            )}

            {reconciliation.reconciliationNotes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium text-blue-700 mb-1">Notes</div>
                <div className="text-blue-900">{reconciliation.reconciliationNotes}</div>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  reconciliation.status === 'reconciled'
                    ? 'bg-green-100 text-green-700'
                    : reconciliation.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {reconciliation.status.charAt(0).toUpperCase() + reconciliation.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold">
            {reconciliation ? 'Update Reconciliation' : 'Create Daily Reconciliation'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Total ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expectedTotal}
                  onChange={(e) => {
                    const expected = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      expectedTotal: expected,
                      variance: formData.actualTotal - expected,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="text-xs text-gray-500 mt-1">Enter the amount you expected to receive</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Total ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.actualTotal}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
                <div className="text-xs text-gray-500 mt-1">Auto-calculated from transactions</div>
              </div>
            </div>

            {!isBalanced && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variance Reason</label>
                  <input
                    type="text"
                    value={formData.varianceReason}
                    onChange={(e) => setFormData({ ...formData, varianceReason: e.target.value })}
                    placeholder="Why is there a difference?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reconciliation Notes</label>
              <textarea
                value={formData.reconciliationNotes}
                onChange={(e) => setFormData({ ...formData, reconciliationNotes: e.target.value })}
                rows={3}
                placeholder="Any notes about this reconciliation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ReconciliationStatus })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="reconciled">Reconciled</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {reconciliation ? 'Update Reconciliation' : 'Create Reconciliation'}
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
    </div>
  );
}
