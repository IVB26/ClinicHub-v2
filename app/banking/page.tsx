'use client';

import { useState, useEffect } from 'react';
import { bankingAPI } from '@/lib/api';
import type { BankingTransaction, DailyReconciliation } from '@/lib/types';
import { BankingDashboard } from '@/components/BankingDashboard';
import { TransactionManager } from '@/components/TransactionManager';
import { ReconciliationManager } from '@/components/ReconciliationManager';
import { BankingReports } from '@/components/BankingReports';

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reconciliation' | 'reports'>('dashboard');
  const [transactions, setTransactions] = useState<BankingTransaction[]>([]);
  const [reconciliations, setReconciliations] = useState<DailyReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [transactionsData, reconciliationData] = await Promise.all([
        bankingAPI.transactions.getAll(),
        bankingAPI.reconciliation.getByDate(today).catch(() => null),
      ]);

      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setReconciliations(reconciliationData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading banking data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Banking & Reconciliation</h1>
          <p className="text-gray-600 mt-1">Track daily transactions and financial operations</p>
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
              { id: 'dashboard', label: 'Dashboard', icon: '💰' },
              { id: 'transactions', label: 'Transactions', icon: '📝' },
              { id: 'reconciliation', label: 'Reconciliation', icon: '✓' },
              { id: 'reports', label: 'Reports', icon: '📊' },
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
          <BankingDashboard
            transactions={transactions}
            reconciliation={reconciliations}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionManager
            transactions={transactions}
            onTransactionsChange={loadAllData}
          />
        )}
        {activeTab === 'reconciliation' && (
          <ReconciliationManager
            transactions={transactions}
            reconciliation={reconciliations}
            onReconciliationChange={loadAllData}
          />
        )}
        {activeTab === 'reports' && (
          <BankingReports transactions={transactions} />
        )}
      </div>
    </div>
  );
}
