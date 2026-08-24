'use client';

import { useState, useMemo } from 'react';
import type { BankingTransaction } from '@/lib/types';

interface BankingReportsProps {
  transactions: BankingTransaction[];
}

export function BankingReports({ transactions }: BankingReportsProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const reportData = useMemo(() => {
    const dailyTotals: Record<string, Record<string, number>> = {};

    filteredTransactions.forEach((t) => {
      if (!dailyTotals[t.date]) {
        dailyTotals[t.date] = {
          cash: 0,
          card: 0,
          check: 0,
          bank_transfer: 0,
          other: 0,
          total: 0,
          count: 0,
        };
      }

      dailyTotals[t.date][t.paymentMethod] += t.amount;
      dailyTotals[t.date].total += t.amount;
      dailyTotals[t.date].count += 1;
    });

    const sorted = Object.entries(dailyTotals).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    return {
      daily: sorted,
      weekly: calculateWeeklySummary(sorted),
      monthly: calculateMonthlySummary(sorted),
      totals: calculateTotals(sorted),
    };
  }, [filteredTransactions]);

  function calculateWeeklySummary(daily: [string, Record<string, number>][]) {
    const weeks: Record<string, Record<string, number>> = {};

    daily.forEach(([date, data]) => {
      const d = new Date(date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { cash: 0, card: 0, check: 0, bank_transfer: 0, other: 0, total: 0, count: 0 };
      }

      weeks[weekKey].cash += data.cash;
      weeks[weekKey].card += data.card;
      weeks[weekKey].check += data.check;
      weeks[weekKey].bank_transfer += data.bank_transfer;
      weeks[weekKey].other += data.other;
      weeks[weekKey].total += data.total;
      weeks[weekKey].count += data.count;
    });

    return Object.entries(weeks).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }

  function calculateMonthlySummary(daily: [string, Record<string, number>][]) {
    const months: Record<string, Record<string, number>> = {};

    daily.forEach(([date, data]) => {
      const monthKey = date.substring(0, 7);

      if (!months[monthKey]) {
        months[monthKey] = { cash: 0, card: 0, check: 0, bank_transfer: 0, other: 0, total: 0, count: 0 };
      }

      months[monthKey].cash += data.cash;
      months[monthKey].card += data.card;
      months[monthKey].check += data.check;
      months[monthKey].bank_transfer += data.bank_transfer;
      months[monthKey].other += data.other;
      months[monthKey].total += data.total;
      months[monthKey].count += data.count;
    });

    return Object.entries(months).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }

  function calculateTotals(daily: [string, Record<string, number>][]) {
    return daily.reduce(
      (acc, [, data]) => ({
        cash: acc.cash + data.cash,
        card: acc.card + data.card,
        check: acc.check + data.check,
        bank_transfer: acc.bank_transfer + data.bank_transfer,
        other: acc.other + data.other,
        total: acc.total + data.total,
        count: acc.count + data.count,
      }),
      { cash: 0, card: 0, check: 0, bank_transfer: 0, other: 0, total: 0, count: 0 }
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatMonth = (dateStr: string) => {
    return new Date(dateStr + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Period Summary</h2>
        <div className="grid grid-cols-6 gap-4">
          <div>
            <div className="text-sm text-blue-700">Transactions</div>
            <div className="text-3xl font-bold text-blue-900">{reportData.totals.count}</div>
          </div>
          <div>
            <div className="text-sm text-blue-700">💵 Cash</div>
            <div className="text-2xl font-bold text-blue-900">${reportData.totals.cash.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-blue-700">💳 Card</div>
            <div className="text-2xl font-bold text-blue-900">${reportData.totals.card.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-blue-700">✓ Check</div>
            <div className="text-2xl font-bold text-blue-900">${reportData.totals.check.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-blue-700">🏦 Transfer</div>
            <div className="text-2xl font-bold text-blue-900">${reportData.totals.bank_transfer.toFixed(2)}</div>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Total</div>
            <div className="text-3xl font-bold">${reportData.totals.total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Daily Report */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold">Date</th>
                <th className="text-right py-3 px-4">💵 Cash</th>
                <th className="text-right py-3 px-4">💳 Card</th>
                <th className="text-right py-3 px-4">✓ Check</th>
                <th className="text-right py-3 px-4">🏦 Transfer</th>
                <th className="text-right py-3 px-4">💎 Other</th>
                <th className="text-right py-3 px-4 font-bold">Total</th>
                <th className="text-right py-3 px-4">Count</th>
              </tr>
            </thead>
            <tbody>
              {reportData.daily.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No transactions in this period.
                  </td>
                </tr>
              ) : (
                reportData.daily.map(([date, data]) => (
                  <tr key={date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(date)}</td>
                    <td className="text-right py-3 px-4">${data.cash.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.card.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.check.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.bank_transfer.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.other.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold">${data.total.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{data.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Report */}
      {reportData.weekly.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Weekly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold">Week Starting</th>
                  <th className="text-right py-3 px-4">💵 Cash</th>
                  <th className="text-right py-3 px-4">💳 Card</th>
                  <th className="text-right py-3 px-4">✓ Check</th>
                  <th className="text-right py-3 px-4">🏦 Transfer</th>
                  <th className="text-right py-3 px-4 font-bold">Total</th>
                  <th className="text-right py-3 px-4">Days</th>
                </tr>
              </thead>
              <tbody>
                {reportData.weekly.map(([date, data]) => (
                  <tr key={date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(date)}</td>
                    <td className="text-right py-3 px-4">${data.cash.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.card.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.check.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.bank_transfer.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold">${data.total.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {reportData.monthly.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold">Month</th>
                  <th className="text-right py-3 px-4">💵 Cash</th>
                  <th className="text-right py-3 px-4">💳 Card</th>
                  <th className="text-right py-3 px-4">✓ Check</th>
                  <th className="text-right py-3 px-4">🏦 Transfer</th>
                  <th className="text-right py-3 px-4 font-bold">Total</th>
                  <th className="text-right py-3 px-4">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {reportData.monthly.map(([month, data]) => (
                  <tr key={month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{formatMonth(month)}</td>
                    <td className="text-right py-3 px-4">${data.cash.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.card.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.check.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${data.bank_transfer.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold">${data.total.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
