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
  Clock,
  Check,
  Tag,
  Plus,
} from 'lucide-react';
import { Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const TransactionsTab: React.FC = () => {
  const {
    expenses,
    events,
    categories,
    profiles,
    deleteExpense,
    setEditingExpense,
    setIsAddModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [filterPayer, setFilterPayer] = useState<'all' | 'user_1' | 'user_2'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Event filter
      if (filterEvent !== 'all' && e.event_id !== filterEvent) {
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

      // Search query (item_title, note, subcategory, country)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = e.item_title?.toLowerCase().includes(q);
        const noteMatch = e.note?.toLowerCase().includes(q);
        const subMatch = e.subcategory?.toLowerCase().includes(q);
        const countryMatch = e.country?.toLowerCase().includes(q);
        const ev = events.find((v) => v.id === e.event_id);
        const eventMatch = ev?.name.toLowerCase().includes(q);

        if (!titleMatch && !noteMatch && !subMatch && !countryMatch && !eventMatch) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filterEvent, filterPayer, filterCategory, searchQuery, events]);

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    filteredExpenses.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: groups[date],
      dayTotal: groups[date].reduce((acc, curr) => acc + curr.amount, 0),
    }));
  }, [filteredExpenses]);

  // Total
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const formatTimestamp = (dateIso?: string) => {
    if (!dateIso) return null;
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString('sk-SK', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

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

  // Export to CSV
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['Dátum', 'Suma (€)', 'Kto platil', 'Projekt / Event', 'Čo to bolo', 'Kategória', 'Podkategória', 'Komentár', 'Zmenené', 'Vyrovnané'];
    const rows = filteredExpenses.map((e) => {
      const payer = profiles.find((p) => p.id === e.paid_by)?.name || e.paid_by;
      const ev = events.find((v) => v.id === e.event_id)?.name || e.event_id;
      const cat = categories.find((c) => c.id === e.category_id)?.name || e.category_id;
      return [
        e.date,
        e.amount.toFixed(2),
        `"${payer}"`,
        `"${ev}"`,
        `"${(e.item_title || '').replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${e.subcategory || ''}"`,
        `"${(e.note || '').replace(/"/g, '""')}"`,
        `"${e.updated_at ? formatTimestamp(e.updated_at) : 'Pôvodný'}"`,
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
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Fulltext Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Hľadať položku, komentár, materiál, reštauráciu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {/* Event Filter Selector */}
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500 max-w-[150px] truncate"
          >
            <option value="all">Všetky projekty</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.emoji} {ev.name}
              </option>
            ))}
          </select>

          {/* Payer Filter */}
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
                <span className="truncate max-w-[45px]">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500 max-w-[130px] truncate"
          >
            <option value="all">Kategória</option>
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
            className="ml-auto p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Kicker */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Zobrazených: <strong className="text-slate-800 dark:text-slate-200">{filteredExpenses.length}</strong> výdavkov
        </span>
        <span>
          Spolu: <strong className="text-slate-900 dark:text-white tabular-nums text-sm font-bold">{filteredTotal.toFixed(2)} €</strong>
        </span>
      </div>

      {/* Grouped Expenses List */}
      {groupedExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 text-xs">
          Nenašli sa žiadne výdavky pre zvolené filtre.
        </div>
      ) : (
        <div className="space-y-3">
          {groupedExpenses.map((group) => (
            <div
              key={group.date}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{formatDateHeader(group.date)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({group.date})</span>
                </div>
                <span className="font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
                  {group.dayTotal.toFixed(2)} €
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.items.map((exp) => {
                  const ev = events.find((v) => v.id === exp.event_id);
                  const cat = categories.find((c) => c.id === exp.category_id);
                  const payer = profiles.find((p) => p.id === exp.paid_by) || profiles[0];
                  const formattedUpdated = formatTimestamp(exp.updated_at);

                  return (
                    <div key={exp.id} className="py-2.5 first:pt-1 last:pb-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs"
                            style={{ backgroundColor: cat?.color || '#0284c7' }}
                          >
                            <CategoryIcon name={cat?.iconName || 'Tag'} className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            {/* What it was */}
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {exp.item_title || exp.note || exp.subcategory}
                            </h4>

                            {/* Event & Category details */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap mt-0.5">
                              {ev && (
                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                  {ev.emoji} {ev.name}
                                </span>
                              )}
                              <span>·</span>
                              <span>{exp.subcategory}</span>
                              <span>·</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                                <span>{payer.emoji}</span>
                                <span>{payer.name}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums block">
                            {exp.amount.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      {/* Comment note if present */}
                      {exp.note && exp.note !== exp.item_title && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 pl-2.5 border-l-2 border-sky-500">
                          💬 {exp.note}
                        </div>
                      )}

                      {/* Audit Timestamp Row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <div>
                          {formattedUpdated ? (
                            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>Zmenené: {formattedUpdated}</span>
                            </span>
                          ) : (
                            <span>Zadané: {exp.date}</span>
                          )}
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1 rounded text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-0.5"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Upraviť</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(exp.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Zmazať</span>
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

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vymazať tento výdavok?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Záznam bude natrvalo odstránený.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Zrušiť
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
