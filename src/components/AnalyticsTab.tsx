import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  PieChart,
  BarChart3,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CategoryDonutChart } from './Charts';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_PROFILES } from '../lib/defaultData';

export const AnalyticsTab: React.FC = () => {
  const { expenses, categories, events, profiles } = useApp();

  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');

  // Filter expenses by event
  const filteredExpenses = useMemo(() => {
    if (selectedEventFilter === 'all') return expenses;
    return expenses.filter((e) => e.event_id === selectedEventFilter);
  }, [expenses, selectedEventFilter]);

  // Aggregate totals
  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );

  let u1Paid = 0;
  let u2Paid = 0;
  filteredExpenses.forEach((e) => {
    if (e.paid_by === 'user_1') u1Paid += e.amount;
    if (e.paid_by === 'user_2') u2Paid += e.amount;
  });

  const dankoProfile = profiles.find((p) => p.id === 'user_1') || profiles[0] || DEFAULT_PROFILES[0];
  const simonkaProfile = profiles.find((p) => p.id === 'user_2') || profiles[1] || DEFAULT_PROFILES[1];

  // Subcategory breakdown
  const subcategoryBreakdown = useMemo(() => {
    const map: { [sub: string]: { name: string; amount: number; count: number } } = {};
    filteredExpenses.forEach((e) => {
      const sub = e.subcategory || 'Ostatné';
      if (!map[sub]) map[sub] = { name: sub, amount: 0, count: 0 };
      map[sub].amount += e.amount;
      map[sub].count += 1;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header with Project Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Štatistiky a analytika
              </h2>
              <p className="text-xs text-slate-400">
                Rozdelenie nákladov podľa kategórií a podkategórií
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector Filter */}
        <div className="pt-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filtrovať podľa projektu
          </label>
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Všetky projekty a výlety spolu</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.emoji} {ev.name} ({ev.status === 'closed' ? 'Uzavretý' : 'Otvorený'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Numbers & 50/50 comparison */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Minutá suma celkovo
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {totalAmount.toFixed(2)} €
          </span>
        </div>

        {/* Dual Progress Bar for Danko & Simonka */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{dankoProfile.emoji} {dankoProfile.name}:</span>
              <strong className="text-sky-600 dark:text-sky-400">{u1Paid.toFixed(2)} €</strong>
              <span className="text-[10px] text-slate-400">({totalAmount > 0 ? Math.round((u1Paid / totalAmount) * 100) : 50}%)</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{simonkaProfile.name}:</span>
              <strong className="text-rose-600 dark:text-rose-400">{u2Paid.toFixed(2)} €</strong>
              <span>{simonkaProfile.emoji}</span>
              <span className="text-[10px] text-slate-400">({totalAmount > 0 ? Math.round((u2Paid / totalAmount) * 100) : 50}%)</span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{
                width: `${totalAmount > 0 ? (u1Paid / totalAmount) * 100 : 50}%`,
                backgroundColor: dankoProfile.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
            <div
              style={{
                width: `${totalAmount > 0 ? (u2Paid / totalAmount) * 100 : 50}%`,
                backgroundColor: simonkaProfile.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Graf rozdelenia podľa hlavných kategórií
        </h3>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Žiadne výdavky pre vybraný filter.
          </div>
        ) : (
          <CategoryDonutChart expenses={filteredExpenses} categories={categories} />
        )}
      </div>

      {/* Detailed Subcategory Analytics Table */}
      {filteredExpenses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Podrobný rozbor podkategórií
            </h3>
            <span className="text-xs text-slate-400">
              {subcategoryBreakdown.length} podkategórií
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {subcategoryBreakdown.map((item) => {
              const percent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
              const avg = item.count > 0 ? item.amount / item.count : 0;

              return (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {item.amount.toFixed(2)} €
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{item.count} {item.count === 1 ? 'nákup' : 'nákupov'}</span>
                    <span>Priemer: {avg.toFixed(2)} € / položka</span>
                    <span>{percent.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
