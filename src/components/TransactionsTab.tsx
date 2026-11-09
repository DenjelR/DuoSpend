import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Download,
  AlertTriangle,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const TransactionsTab: React.FC = () => {
  const {
    expenses,
    categories,
    profiles,
    deleteExpense,
    setEditingExpense,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayer, setFilterPayer] = useState<'all' | 'user_1' | 'user_2'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<'month' | 'all'>('month');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Month filter
      if (filterTime === 'month' && !e.date.startsWith(selectedMonth)) {
        return false;
      }

      // Payer filter
      if (filterPayer !== 'all' && e.paid_by !== filterPayer) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && e.category_id !== filterCategory) {
        return false;
      }

      // Search query (note, subcategory, country)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const noteMatch = e.note?.toLowerCase().includes(q);
        const subMatch = e.subcategory?.toLowerCase().includes(q);
        const countryMatch = e.country?.toLowerCase().includes(q);
        const cat = categories.find((c) => c.id === e.category_id);
        const catMatch = cat?.name.toLowerCase().includes(q);

        if (!noteMatch && !subMatch && !countryMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filterTime, selectedMonth, filterPayer, filterCategory, searchQuery, categories]);

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    filteredExpenses.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: groups[date],
      dayTotal: groups[date].reduce((acc, curr) => acc + curr.amount, 0),
    }));
  }, [filteredExpenses]);

  // Format date helper for human Slovak display
  const formatDateHeader = (dateStr: string) => {
    const today = new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    const itemDate = new Date(y, m - 1, d);

    const diffDays = Math.round(
      (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
        itemDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Dnes';
    if (diffDays === 1) return 'Včera';

    return itemDate.toLocaleDateString('sk-SK', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  };

  // Total amount of filtered results
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['Dátum', 'Suma (€)', 'Kto platil', 'Kategória', 'Podkategória', 'Krajina/Výlet', 'Poznámka', 'Vyrovnané'];
    const rows = filteredExpenses.map((e) => {
      const payer = profiles.find((p) => p.id === e.paid_by)?.name || e.paid_by;
      const cat = categories.find((c) => c.id === e.category_id)?.name || e.category_id;
      return [
        e.date,
        e.amount.toFixed(2),
        `"${payer}"`,
        `"${cat}"`,
        `"${e.subcategory || ''}"`,
        `"${e.country || ''}"`,
        `"${(e.note || '').replace(/"/g, '""')}"`,
        e.is_settled ? 'Áno' : 'Nie',
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `duospend_vydavky_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Hľadať v poznámkach, kategóriách, krajinách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Time switch: Current month vs All */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setFilterTime('month')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterTime === 'month'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Vybraný mesiac
            </button>
            <button
              onClick={() => setFilterTime('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterTime === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Všetky časy
            </button>
          </div>

          {/* Payer filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setFilterPayer('all')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                filterPayer === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Obaja
            </button>
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPayer(p.id)}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  filterPayer === p.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500'
                }`}
              >
                <span>{p.emoji}</span>
                <span className="truncate max-w-[50px]">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Category filter dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Všetky kategórie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            title="Exportovať do CSV"
            className="ml-auto p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Results Summary Kicker */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Nájdené: <strong className="text-slate-800 dark:text-slate-200">{filteredExpenses.length}</strong> položiek
        </span>
        <span>
          Spolu: <strong className="text-slate-900 dark:text-white tabular-nums text-sm font-bold">{filteredTotal.toFixed(2)} €</strong>
        </span>
      </div>

      {/* 3. Grouped Transactions List */}
      {groupedExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs">
          Nenašli sa žiadne položky pre zvolené filtre.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedExpenses.map((group) => (
            <div
              key={group.date}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatDateHeader(group.date)}
                  </span>
                  <span className="text-[10px] text-slate-400">({group.date})</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {group.dayTotal.toFixed(2)} €
                </span>
              </div>

              {/* Day Items */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {group.items.map((exp) => {
                  const cat = categories.find((c) => c.id === exp.category_id);
                  const payer = profiles.find((p) => p.id === exp.paid_by);

                  return (
                    <div
                      key={exp.id}
                      className="py-3 flex items-center justify-between first:pt-1 last:pb-1 group"
                    >
                      {/* Left: Category Icon + Description */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: cat?.color || '#0284c7' }}
                        >
                          <CategoryIcon name={cat?.iconName || 'Tag'} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {exp.note || exp.subcategory || cat?.name}
                            </span>
                            {exp.country && (
                              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded-md">
                                ✈️ {exp.country}
                              </span>
                            )}
                            {exp.is_settled && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> vyrovnané
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            <span className="truncate">{cat?.name}</span>
                            {exp.subcategory && (
                              <>
                                <span>·</span>
                                <span className="truncate">{exp.subcategory}</span>
                              </>
                            )}
                            <span>·</span>
                            <span className="flex items-center gap-0.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span>{payer?.emoji}</span>
                              <span>{payer?.name}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {exp.amount.toFixed(2)} €
                        </span>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Upraviť položku"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Vymazať položku"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Naozaj vymazať tento výdavok?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Tento záznam bude natrvalo odstránený zo zoznamu aj zo Supabase.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95"
              >
                Áno, vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
