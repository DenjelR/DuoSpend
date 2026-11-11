import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  Clock,
  Check,
  ChevronRight,
  FolderOpen,
  PieChart,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { CreateEventModal } from './CreateEventModal';
import { Expense } from '../types';
import { DEFAULT_PROFILES, DEFAULT_EVENTS } from '../lib/defaultData';

export const OpenEventsTab: React.FC = () => {
  const {
    openEvents,
    selectedEventId,
    setSelectedEventId,
    expenses,
    categories,
    profiles,
    closeEvent,
    setIsAddModalOpen,
    setEditingExpense,
    deleteExpense,
    setPreselectedEventIdForAdd,
    setActiveTab,
  } = useApp();

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active event object
  const activeEvent = openEvents.find((ev) => ev.id === selectedEventId) || openEvents[0] || DEFAULT_EVENTS[0];

  // Filter expenses belonging to the selected open event
  const eventExpenses = useMemo(() => {
    if (!activeEvent) return [];
    return expenses.filter((e) => e.event_id === activeEvent.id);
  }, [expenses, activeEvent]);

  // Calculate totals and 50/50 share (WITHOUT debt messages)
  const { totalSpent, user1Paid, user2Paid } = useMemo(() => {
    let total = 0;
    let u1 = 0;
    let u2 = 0;

    eventExpenses.forEach((e) => {
      total += e.amount;
      if (e.paid_by === 'user_1') u1 += e.amount;
      if (e.paid_by === 'user_2') u2 += e.amount;
    });

    return { totalSpent: total, user1Paid: u1, user2Paid: u2 };
  }, [eventExpenses]);

  const dankoProfile = profiles.find((p) => p.id === 'user_1') || profiles[0] || DEFAULT_PROFILES[0];
  const simonkaProfile = profiles.find((p) => p.id === 'user_2') || profiles[1] || DEFAULT_PROFILES[1];

  const handleQuickAdd = () => {
    setPreselectedEventIdForAdd(activeEvent?.id || null);
    setIsAddModalOpen(true);
  };

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

  if (openEvents.length === 0) {
    return (
      <div className="space-y-4 pb-28 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto text-2xl">
            📂
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Žiadny otvorený projekt
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Všetky eventy sú ukončené alebo zatiaľ nebol vytvorený žiadny nový projekt.
          </p>
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            + Vytvoriť nový projekt
          </button>
        </div>
        <CreateEventModal isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. SELECTOR OTVORENÝCH EVENTOV */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Otvorené projekty ({openEvents.length})</span>
          </span>
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nový projekt</span>
          </button>
        </div>

        {/* Scrollable open event chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {openEvents.map((ev) => {
            const isSelected = activeEvent?.id === ev.id;
            const evExpenses = expenses.filter((e) => e.event_id === ev.id);

            return (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-2xl whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={isSelected ? { boxShadow: `0 0 0 2px ${ev.color}` } : {}}
              >
                <span className="text-base">{ev.emoji}</span>
                <span className="text-xs">{ev.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 dark:bg-slate-800 text-white dark:text-slate-200'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {evExpenses.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE EVENT HERO CARD */}
      {activeEvent && (
        <div
          className="rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all space-y-4"
          style={{
            background: `linear-gradient(135deg, ${activeEvent.color}15 0%, transparent 70%)`,
            borderColor: `${activeEvent.color}40`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ring-2 ring-white dark:ring-slate-900 shrink-0"
                style={{ backgroundColor: `${activeEvent.color}30` }}
              >
                {activeEvent.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Prebiehajúci zber
                  </span>

                  {activeEvent.destination_country && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      📍 {activeEvent.destination_country}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate mt-1">
                  {activeEvent.name}
                </h2>
              </div>
            </div>

            {/* Actions: Add Expense & Close Collection */}
            <div className="flex flex-col gap-1.5 shrink-0 items-end">
              <button
                onClick={handleQuickAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Pridať výdavok</span>
              </button>

              <button
                onClick={() => setShowCloseConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Ukončiť zber výdavkov a archivovať projekt"
              >
                <Lock className="w-3 h-3" />
                <span>Ukončiť zber výdavkov</span>
              </button>
            </div>
          </div>

          {activeEvent.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeEvent.description}
            </p>
          )}

          {/* 3. SPOLOČNÝ PODIEL NÁKLADOV 50/50 (BEZ KTO KOMU ČO DLHUJE) */}
          <div className="bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Spoločný podiel nákladov (50 / 50)
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                Celkovo: {totalSpent.toFixed(2)} €
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{dankoProfile.emoji} {dankoProfile.name}:</span>
                <strong className="text-sky-600 dark:text-sky-400">{user1Paid.toFixed(2)} €</strong>
                <span className="text-[10px] text-slate-400">({totalSpent > 0 ? Math.round((user1Paid / totalSpent) * 100) : 50}%)</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{simonkaProfile.name}:</span>
                <strong className="text-rose-600 dark:text-rose-400">{user2Paid.toFixed(2)} €</strong>
                <span>{simonkaProfile.emoji}</span>
                <span className="text-[10px] text-slate-400">({totalSpent > 0 ? Math.round((user2Paid / totalSpent) * 100) : 50}%)</span>
              </span>
            </div>

            {/* Visual dual contribution bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{
                  width: `${totalSpent > 0 ? (user1Paid / totalSpent) * 100 : 50}%`,
                  backgroundColor: dankoProfile.avatarColor,
                }}
                className="h-full transition-all duration-500"
              />
              <div
                style={{
                  width: `${totalSpent > 0 ? (user2Paid / totalSpent) * 100 : 50}%`,
                  backgroundColor: simonkaProfile.avatarColor,
                }}
                className="h-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. POLOŽKOVÝ ZOZNAM VÝDAVKOV TOHTO OTVORENÉHO PROJEKTU */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Položky a výdavky ({eventExpenses.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Suma, kto to pridal, čo to bolo, komentár a dátum zmeny
            </p>
          </div>
          <button
            onClick={handleQuickAdd}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pridať položku</span>
          </button>
        </div>

        {eventExpenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-2">
            <p>V tomto projekte zatiaľ nie sú žiadne výdavky.</p>
            <button
              onClick={handleQuickAdd}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              + Pridať prvý výdavok
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {eventExpenses.map((exp) => {
              const payer = profiles.find((p) => p.id === exp.paid_by) || profiles[0];
              const cat = categories.find((c) => c.id === exp.category_id);
              const formattedUpdated = formatTimestamp(exp.updated_at);

              return (
                <div key={exp.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs"
                        style={{ backgroundColor: cat?.color || '#0284c7' }}
                      >
                        <CategoryIcon name={cat?.iconName || 'Tag'} className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        {/* Čo to bolo */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {exp.item_title || exp.note || exp.subcategory}
                        </h4>

                        {/* Kto to pridal + Podkategória */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <span>{payer.emoji}</span>
                            <span>{payer.name}</span>
                          </span>
                          <span>·</span>
                          <span>{exp.subcategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums block">
                        {exp.amount.toFixed(2)} €
                      </span>
                      {exp.currency && exp.currency !== 'EUR' && exp.original_amount && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                          ({exp.original_amount.toFixed(0)} {exp.currency})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {exp.date}
                      </span>
                    </div>
                  </div>

                  {/* Komentár k tomu */}
                  {exp.note && exp.note !== exp.item_title && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 pl-2.5 border-l-2 border-sky-500">
                      💬 {exp.note}
                    </div>
                  )}

                  {/* Dátová pečiatka zmeny & akcie */}
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                    <div>
                      {formattedUpdated ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Zmenené: {formattedUpdated}</span>
                        </span>
                      ) : (
                        <span>Pridané: {exp.date}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="p-1 text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Upraviť</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-0.5"
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
        )}
      </div>

      {/* Confirmation Modal: Close Event (Ukončiť zber) */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ukončiť zber výdavkov pre {activeEvent?.name}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Projekt sa presunie do sekcie <strong>Uzavreté eventy</strong>. Všetky výdavky zostanú archivované a kedykoľvek ho budete môcť znovu otvoriť.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Zrušiť
              </button>
              <button
                onClick={async () => {
                  if (activeEvent) await closeEvent(activeEvent.id);
                  setShowCloseConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
              >
                Áno, ukončiť zber
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vymazať tento výdavok?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Záznam bude natrvalo odstránený.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600"
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
                Áno, vymazať
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateEventModal isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
    </div>
  );
};
