import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Plus,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
  Clock,
  Check,
  PieChart,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Globe,
  Coins,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { CreateEventModal } from './CreateEventModal';
import { CategoryDonutChart } from './Charts';
import { Expense } from '../types';

export const DashboardTab: React.FC = () => {
  const {
    events,
    openEvents,
    closedEvents,
    selectedEventId,
    setSelectedEventId,
    expenses,
    categories,
    currentUser,
    otherUser,
    profiles,
    settleBalance,
    closeEvent,
    reopenEvent,
    setIsAddModalOpen,
    setEditingExpense,
    deleteExpense,
    setPreselectedEventIdForAdd,
  } = useApp();

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [justSettled, setJustSettled] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active view: 'list' (overview of all events) or 'detail' (deep dive into single event)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('detail');

  // Active event object
  const activeEvent = events.find((ev) => ev.id === selectedEventId) || events[0];

  // Filter expenses belonging to the selected event
  const eventExpenses = useMemo(() => {
    if (!activeEvent) return [];
    return expenses.filter((e) => e.event_id === activeEvent.id);
  }, [expenses, activeEvent]);

  // Calculate totals and 50/50 balance for the active event
  const { totalSpent, user1Paid, user2Paid, unsettledExpenses, balanceDiff, fairShare } = useMemo(() => {
    let total = 0;
    let u1 = 0;
    let u2 = 0;
    const unsettled = eventExpenses.filter((e) => !e.is_settled);
    let u1Unsettled = 0;
    let u2Unsettled = 0;

    eventExpenses.forEach((e) => {
      total += e.amount;
      if (e.paid_by === 'user_1') u1 += e.amount;
      if (e.paid_by === 'user_2') u2 += e.amount;
    });

    unsettled.forEach((e) => {
      if (e.paid_by === 'user_1') u1Unsettled += e.amount;
      if (e.paid_by === 'user_2') u2Unsettled += e.amount;
    });

    const unTotal = u1Unsettled + u2Unsettled;
    const fair = unTotal / 2;
    const diff = u1Unsettled - fair;

    return {
      totalSpent: total,
      user1Paid: u1,
      user2Paid: u2,
      unsettledExpenses: unsettled,
      balanceDiff: diff,
      fairShare: fair,
    };
  }, [eventExpenses]);

  // Difference: who owes whom?
  // User 1 is Danko, User 2 is Simonka
  const dankoProfile = profiles.find((p) => p.id === 'user_1') || profiles[0];
  const simonkaProfile = profiles.find((p) => p.id === 'user_2') || profiles[1];

  let settlementMessage = '';
  let settlementAmount = Math.abs(balanceDiff);
  let whoOwesWho: 'i_am_owed' | 'i_owe' | 'even' = 'even';
  let debtorUser = simonkaProfile;
  let creditorUser = dankoProfile;

  if (Math.abs(balanceDiff) < 0.01) {
    whoOwesWho = 'even';
    settlementMessage = 'Účty za tento projekt sú vyrovnané! 🎉';
  } else if (balanceDiff > 0) {
    // Danko paid more than fair share -> Simonka owes Danko
    debtorUser = simonkaProfile;
    creditorUser = dankoProfile;
    if (currentUser.id === 'user_1') {
      whoOwesWho = 'i_am_owed';
      settlementMessage = `Simonka ti dlhuje ${settlementAmount.toFixed(2)} €`;
    } else {
      whoOwesWho = 'i_owe';
      settlementMessage = `Ty dlhuješ Dankovi ${settlementAmount.toFixed(2)} €`;
    }
  } else {
    // Simonka paid more than fair share -> Danko owes Simonka
    debtorUser = dankoProfile;
    creditorUser = simonkaProfile;
    if (currentUser.id === 'user_2') {
      whoOwesWho = 'i_am_owed';
      settlementMessage = `Danko ti dlhuje ${settlementAmount.toFixed(2)} €`;
    } else {
      whoOwesWho = 'i_owe';
      settlementMessage = `Ty dlhuješ Simonke ${settlementAmount.toFixed(2)} €`;
    }
  }

  const handleSettle = async () => {
    if (unsettledExpenses.length === 0 || whoOwesWho === 'even') return;
    await settleBalance(
      settlementAmount,
      debtorUser.id,
      creditorUser.id,
      unsettledExpenses.map((e) => e.id),
      activeEvent.id
    );
    setShowSettlementConfirm(false);
    setJustSettled(true);
    setTimeout(() => setJustSettled(false), 3500);
  };

  const handleToggleCloseEvent = async () => {
    if (activeEvent.status === 'active') {
      await closeEvent(activeEvent.id);
    } else {
      await reopenEvent(activeEvent.id);
    }
    setShowCloseConfirm(false);
  };

  // Subcategory breakdown
  const subcategoryBreakdown = useMemo(() => {
    const map: { [sub: string]: { name: string; amount: number; count: number } } = {};
    eventExpenses.forEach((e) => {
      const sub = e.subcategory || 'Ostatné';
      if (!map[sub]) map[sub] = { name: sub, amount: 0, count: 0 };
      map[sub].amount += e.amount;
      map[sub].count += 1;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [eventExpenses]);

  const handleQuickAddExpenseToEvent = () => {
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

  if (events.length === 0) {
    return (
      <div className="space-y-4 pb-28 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✨
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Vitajte v DuoSpend, Danko & Simonka!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Všetky výdavky sú pripravené na 0 €. Vytvorte si svoj prvý spoločný event (výlet, prerábku bytu alebo rande).
            </p>
          </div>
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-600/30 active:scale-95 transition-all"
          >
            + Vytvoriť prvý projekt
          </button>
        </div>
        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. TOP EVENT SELECTOR & SWITCHER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Výber projektu / eventu
          </span>
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nový projekt</span>
          </button>
        </div>

        {/* Scrollable event chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {events.map((ev) => {
            const isSelected = activeEvent?.id === ev.id;
            const evExpenses = expenses.filter((e) => e.event_id === ev.id);
            const isClosed = ev.status === 'closed';

            return (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  setViewMode('detail');
                }}
                className={`flex items-center gap-2 py-2 px-3 rounded-2xl whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={isSelected ? { boxShadow: `0 0 0 2px ${ev.color}` } : {}}
              >
                <span className="text-base">{ev.emoji}</span>
                <span className="text-xs">{ev.name}</span>
                {isClosed && (
                  <span className="text-[10px] text-amber-500 font-bold" title="Ukončený zber">
                    🔒
                  </span>
                )}
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

        {/* Mode Selector Segmented Switch: Detail vs All Events */}
        <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl text-xs font-bold pt-1 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setViewMode('detail')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'detail'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>📌</span>
            <span className="truncate">Detail: {activeEvent?.name}</span>
          </button>
          <button
            onClick={() => setViewMode('overview')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>🗂️</span>
            <span>Prehľad všetkých ({events.length})</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN VIEWPORT: ALL EVENTS OVERVIEW vs SINGLE EVENT DEEP DIVE */}
      {viewMode === 'overview' ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Overview Aggregates Card */}
          <div className="bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-rose-500/10 dark:from-sky-950/20 dark:via-indigo-950/20 dark:to-rose-950/20 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  DuoSpend Prehľad projektov
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Všetky spoločné eventy Danka a Simonky
                </h3>
              </div>
              <button
                onClick={() => setIsCreateEventOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                + Nový projekt
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Spolu</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)} €
                </span>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Otvorené</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {openEvents.length}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Ukončené</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  {closedEvents.length}
                </span>
              </div>
            </div>
          </div>

          {/* Cards for each event */}
          <div className="space-y-3">
            {events.map((ev) => {
              const evExpenses = expenses.filter((e) => e.event_id === ev.id);
              const evTotal = evExpenses.reduce((s, e) => s + e.amount, 0);
              let u1 = 0;
              let u2 = 0;
              evExpenses.forEach((e) => {
                if (e.paid_by === 'user_1') u1 += e.amount;
                if (e.paid_by === 'user_2') u2 += e.amount;
              });
              const isClosed = ev.status === 'closed';

              return (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0"
                        style={{ backgroundColor: `${ev.color}25` }}
                      >
                        {ev.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isClosed ? (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Ukončený zber
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5" /> Prebiehajúci zber
                            </span>
                          )}
                          {ev.destination_country && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                              📍 {ev.destination_country}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-1">
                          {ev.name}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums block">
                        {evTotal.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {evExpenses.length} položiek
                      </span>
                    </div>
                  </div>

                  {/* Dual contribution bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>{dankoProfile.emoji} {dankoProfile.name}:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{u1.toFixed(2)} €</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{simonkaProfile.name}:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{u2.toFixed(2)} €</strong>
                        <span>{simonkaProfile.emoji}</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        style={{
                          width: `${evTotal > 0 ? (u1 / evTotal) * 100 : 50}%`,
                          backgroundColor: dankoProfile.avatarColor,
                        }}
                        className="h-full"
                      />
                      <div
                        style={{
                          width: `${evTotal > 0 ? (u2 / evTotal) * 100 : 50}%`,
                          backgroundColor: simonkaProfile.avatarColor,
                        }}
                        className="h-full"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setViewMode('detail');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <PieChart className="w-3.5 h-3.5" />
                      <span>Rozkliknúť štatistiku & grafy</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (ev.status === 'active') {
                          await closeEvent(ev.id);
                        } else {
                          await reopenEvent(ev.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all"
                      title={ev.status === 'active' ? 'Ukončiť zber výdavkov' : 'Znovu otvoriť zber'}
                    >
                      {ev.status === 'active' ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeEvent ? (
        <>
          {/* EVENT HERO & ACTION BAR (Otvorenie / Ukončenie zberu) */}
          <div
            className="rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all"
            style={{
              background: `linear-gradient(135deg, ${activeEvent.color}15 0%, transparent 70%)`,
              borderColor: `${activeEvent.color}40`,
            }}
          >
          {/* Top row: Emoji, Title, Status & Close button */}
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
                  {/* Status Badge */}
                  {activeEvent.status === 'closed' ? (
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Ukončený zber
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Prebiehajúci zber
                    </span>
                  )}

                  {activeEvent.destination_country && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      📍 {activeEvent.destination_country}
                    </span>
                  )}

                  {activeEvent.currency && activeEvent.currency !== 'EUR' && (
                    <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full">
                      Mena: {activeEvent.currency} ({activeEvent.currency_symbol})
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate mt-1">
                  {activeEvent.name}
                </h2>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col gap-1.5 shrink-0 items-end">
              {activeEvent.status === 'active' ? (
                <button
                  onClick={handleQuickAddExpenseToEvent}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Pridať výdavok</span>
                </button>
              ) : null}

              {/* Ukončiť / Znovu otvoriť zber button */}
              <button
                onClick={() => setShowCloseConfirm(true)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  activeEvent.status === 'active'
                    ? 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {activeEvent.status === 'active' ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Ukončiť zber výdavkov</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Znovu otvoriť zber</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {activeEvent.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              {activeEvent.description}
            </p>
          )}

          {/* Aggregate Numbers & Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Celkovo minuté
              </span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                {totalSpent.toFixed(2)} €
              </div>
              <span className="text-[10px] text-slate-400">
                {eventExpenses.length} položiek
              </span>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                {dankoProfile.name} dal(a)
              </span>
              <div className="text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                {user1Paid.toFixed(2)} €
              </div>
              <span className="text-[10px] text-slate-400">
                {totalSpent > 0 ? `${Math.round((user1Paid / totalSpent) * 100)}%` : '0%'}
              </span>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                {simonkaProfile.name} dal(a)
              </span>
              <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                {user2Paid.toFixed(2)} €
              </div>
              <span className="text-[10px] text-slate-400">
                {totalSpent > 0 ? `${Math.round((user2Paid / totalSpent) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

      {/* 3. SETTLEMENT CARD (VYROVNANIE 50/50 PRE DANKA A SIMONKU) */}
      <div
        className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all ${
          whoOwesWho === 'even'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
            : whoOwesWho === 'i_am_owed'
            ? 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800/80'
            : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                whoOwesWho === 'even'
                  ? 'bg-emerald-500'
                  : whoOwesWho === 'i_am_owed'
                  ? 'bg-sky-600'
                  : 'bg-rose-600'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Vyrovnanie nákladov (Danko & Simonka 50/50)
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {settlementMessage}
              </h3>
            </div>
          </div>

          {unsettledExpenses.length > 0 && whoOwesWho !== 'even' && (
            <button
              onClick={() => setShowSettlementConfirm(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              Vyrovnať dlh
            </button>
          )}
        </div>

        {/* Dual progress bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{dankoProfile.emoji} {dankoProfile.name}:</span>
              <strong>{user1Paid.toFixed(2)} €</strong>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{simonkaProfile.name}:</span>
              <strong>{user2Paid.toFixed(2)} €</strong>
              <span>{simonkaProfile.emoji}</span>
            </span>
          </div>

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

        {justSettled && (
          <div className="absolute inset-0 bg-emerald-600 text-white flex flex-col items-center justify-center p-4 rounded-3xl animate-in zoom-in-95 duration-200">
            <Sparkles className="w-8 h-8 animate-bounce mb-1" />
            <h4 className="text-base font-bold">Účty boli vyrovnané!</h4>
            <p className="text-xs text-emerald-100">Dlh bol vynulovaný a archivovaný.</p>
          </div>
        )}
      </div>

      {/* 4. ANALYTICKÉ GRAFY A TABUĽKY EVENTU */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Analytika a rozdelenie nákladov
            </h3>
          </div>
          <span className="text-xs text-slate-400">{subcategoryBreakdown.length} podkategórií</span>
        </div>

        {eventExpenses.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Zatiaľ nie sú zaevidované žiadne výdavky pre tento projekt.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut Chart */}
            <CategoryDonutChart expenses={eventExpenses} categories={categories} />

            {/* Podrobná tabuľka rozdelenia nákladov */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Analytický prehľad podkategórií
              </span>
              <div className="space-y-2">
                {subcategoryBreakdown.map((item) => {
                  const percent = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
                  const avg = item.count > 0 ? item.amount / item.count : 0;
                  return (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
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
                        <span>{item.count} {item.count === 1 ? 'položka' : 'položiek'}</span>
                        <span>Priemer: {avg.toFixed(2)} € / nákup</span>
                        <span>{percent.toFixed(1)}% z projektu</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. POLOŽKOVÝ ZOZNAM VÝDAVKOV S DÁTOVOU PEČIATKOU */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Položky a výdavky eventu
            </h3>
            <p className="text-[11px] text-slate-400">
              Suma, kto to pridal, čo to bolo, komentár a auditná zmena
            </p>
          </div>
          {activeEvent?.status === 'active' && (
            <button
              onClick={handleQuickAddExpenseToEvent}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pridať</span>
            </button>
          )}
        </div>

        {eventExpenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            V tomto projekte zatiaľ nie sú žiadne výdavky.{' '}
            {activeEvent?.status === 'active' && (
              <button
                onClick={handleQuickAddExpenseToEvent}
                className="text-sky-600 font-bold hover:underline"
              >
                Pridajte prvú položku!
              </button>
            )}
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
                          {exp.is_settled && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> vyrovnané
                              </span>
                            </>
                          )}
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
                        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
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
      </>
      ) : null}

      {/* Confirmation Modal: Close / Reopen Event */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeEvent.status === 'active'
                ? 'Ukončiť zber výdavkov pre tento projekt?'
                : 'Znovu otvoriť zber výdavkov?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {activeEvent.status === 'active'
                ? 'Projekt bude označený ako ukončený a archivovaný. Všetky čísla a štatistiky zostanú prehľadne zachované.'
                : 'Projekt sa znovu prepne do aktívneho stavu a budete doň môcť priamo zapisovať nové položky.'}
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Zrušiť
              </button>
              <button
                onClick={handleToggleCloseEvent}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
              >
                {activeEvent.status === 'active' ? 'Áno, ukončiť zber' : 'Znovu otvoriť'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Settlement */}
      {showSettlementConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vyrovnať účty projektu?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Vyrovnáte sumu <strong>{settlementAmount.toFixed(2)} €</strong> ({debtorUser.name} vyplatí {creditorUser.name}). {unsettledExpenses.length} položiek bude označených ako vysporiadaných.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowSettlementConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSettle}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Áno, vyrovnať
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
              Naozaj vymazať tento výdavok?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Tento záznam bude natrvalo odstránený.
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

      {/* Modal na vytvorenie nového projektu */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
      />
    </div>
  );
};
