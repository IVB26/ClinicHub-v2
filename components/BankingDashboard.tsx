'use client';

import { useMemo } from 'react';
import type { BankingTransaction, DailyReconciliation } from '@/lib/types';

interface BankingDashboardProps {
  transactions: BankingTransaction[];
  reconciliation: DailyReconciliation | null;
  onRefresh: () => void;
}

export function BankingDashboard({
  transactions,
  reconciliation,
  onRefresh,
}: BankingDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date === today);

  // Calculate totals by payment method
  const totals = useMemo(() => {
    const result = {
      cash: 0,
      card: 0,
      check: 0,
      bank_transfer: 0,
      other: 0,
      total: 0,
    };

    todayTransactions.forEach((t) => {
      result[t.paymentMethod] += t.amount;
      result.total += t.amount;
    });

    return result;
  }, [todayTransactions]);

  const paymentMethods = [
    { key: 'cash', label: '💵 Cash', color: 'from-green-400 to-green-600' },
    { key: 'card', label: '💳 Card', color: 'from-blue-400 to-blue-600' },
    { key: 'check', label: '✓ Check', color: 'from-purple-400 to-purple-600' },
    { key: 'bank_transfer', label: '🏦 Bank Transfer', color: 'from-orange-400 to-orange-600' },
    { key: 'other', label: '💎 Other', color: 'from-pink-400 to-pink-600' },
  ];

  const chartData = paymentMethods
    .map((pm) => ({
      ...pm,
      amount: totals[pm.key as keyof typeof totals],
      percentage: totals.total > 0 ? ((totals[pm.key as keyof typeof totals] / totals.total) * 100).toFixed(1) : '0',
    }))
    .filter((pm) => pm.amount > 0);

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm font-medium text-blue-600">Today's Total</div>
          <div className="text-4xl font-bold text-blue-900 mt-2">
            ${totals.total.toFixed(2)}
          </div>
          <div className="text-xs text-blue-600 mt-2">{todayTransactions.length} transactions</div>
        </div>

        <div className={`bg-gradient-to-br ${reconciliation?.status === 'reconciled' ? 'from-green-50 to-green-100' : 'from-yellow-50 to-yellow-100'} rounded-lg border ${reconciliation?.status === 'reconciled' ? 'border-green-200' : 'border-yellow-200'} p-6`}>
          <div className="text-3xl mb-2">{reconciliation?.status === 'reconciled' ? '✓' : '⏳'}</div>
          <div className={`text-sm font-medium ${reconciliation?.status === 'reconciled' ? 'text-green-600' : 'text-yellow-600'}`}>
            Reconciliation Status
          </div>
          <div className={`text-2xl font-bold mt-2 ${reconciliation?.status === 'reconciled' ? 'text-green-900' : 'text-yellow-900'}`}>
            {reconciliation?.status === 'reconciled' ? 'Reconciled' : 'Pending'}
          </div>
          {reconciliation && (
            <div className={`text-xs mt-2 ${reconciliation?.status === 'reconciled' ? 'text-green-600' : 'text-yellow-600'}`}>
              Variance: ${reconciliation.variance.toFixed(2)}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-sm font-medium text-purple-600">Expected vs. Actual</div>
          {reconciliation ? (
            <div className="mt-2">
              <div className="text-xs text-purple-600 mb-1">Expected: ${reconciliation.expectedTotal.toFixed(2)}</div>
              <div className="text-xs text-purple-600">Actual: ${reconciliation.actualTotal.toFixed(2)}</div>
              <div className={`text-lg font-bold mt-1 ${reconciliation.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reconciliation.variance >= 0 ? '+' : ''} ${reconciliation.variance.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-purple-600 mt-2">No reconciliation yet</div>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">Payment Method Breakdown</h2>

        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions today</div>
        ) : (
          <div className="space-y-3">
            {chartData.map((pm) => (
              <div key={pm.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700">{pm.label}</span>
                  <span className="text-sm font-bold text-gray-900">${pm.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${pm.color}`}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-right mt-1">{pm.percentage}%</div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>

        {todayTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions recorded today</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todayTransactions
              .slice()
              .reverse()
              .slice(0, 10)
              .map((t) => (
                <div key={t.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {t.paymentMethod === 'cash' && '💵'}
                        {t.paymentMethod === 'card' && '💳'}
                        {t.paymentMethod === 'check' && '✓'}
                        {t.paymentMethod === 'bank_transfer' && '🏦'}
                        {t.paymentMethod === 'other' && '💎'}
                        {' '}
                        {t.service || t.clientName || 'Transaction'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.reference && `Ref: ${t.reference}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${t.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 capitalize">{t.paymentMethod}</div>
                    </div>
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
