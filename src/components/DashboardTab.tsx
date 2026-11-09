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
  Target,
  ArrowRight,
  Filter,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { CreateEventModal } from './CreateEventModal';
import { Expense } from '../types';

export const DashboardTab: React.FC = () => {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    expenses,
    categories,
    currentUser,
    otherUser,
    profiles,
    settleBalance,
    setIsAddModalOpen,
    setEditingExpense,
    deleteExpense,
    setPreselectedEventIdForAdd,
  } = useApp();

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [justSettled, setJustSettled] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active event object
  const activeEvent = events.find((ev) => ev.id === selectedEventId) || events[0];

  // Filter expenses belonging to the selected event (or all if selectedEventId === 'all')
  const eventExpenses = useMemo(() => {
    if (selectedEventId === 'all') return expenses;
    return expenses.filter((e) => e.event_id === selectedEventId);
  }, [expenses, selectedEventId]);

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

  // Balance difference and message
  const currentIsUser1 = currentUser.id === 'user_1';
  let whoOwesWho: 'i_am_owed' | 'i_owe' | 'even' = 'even';
  let settlementAmount = Math.abs(balanceDiff);
  let settlementMessage = '';
  let debtorUser = otherUser;
  let creditorUser = currentUser;

  if (Math.abs(balanceDiff) < 0.01) {
    whoOwesWho = 'even';
    settlementMessage = 'Účty za tento projekt sú vyrovnané! 🎉';
  } else if (balanceDiff > 0) {
    if (currentIsUser1) {
      whoOwesWho = 'i_am_owed';
      settlementMessage = `${otherUser.name} ti dlhuje ${settlementAmount.toFixed(2)} €`;
      debtorUser = otherUser;
      creditorUser = currentUser;
    } else {
      whoOwesWho = 'i_owe';
      settlementMessage = `Ty dlhuješ ${otherUser.name} ${settlementAmount.toFixed(2)} €`;
      debtorUser = currentUser;
      creditorUser = otherUser;
    }
  } else {
    if (currentIsUser1) {
      whoOwesWho = 'i_owe';
      settlementMessage = `Ty dlhuješ ${otherUser.name} ${settlementAmount.toFixed(2)} €`;
      debtorUser = currentUser;
      creditorUser = otherUser;
    } else {
      whoOwesWho = 'i_am_owed';
      settlementMessage = `${otherUser.name} ti dlhuje ${settlementAmount.toFixed(2)} €`;
      debtorUser = otherUser;
      creditorUser = currentUser;
    }
  }

  const handleSettle = async () => {
    if (unsettledExpenses.length === 0 || whoOwesWho === 'even') return;
    await settleBalance(
      settlementAmount,
      debtorUser.id,
      creditorUser.id,
      unsettledExpenses.map((e) => e.id),
      selectedEventId === 'all' ? undefined : selectedEventId
    );
    setShowSettlementConfirm(false);
    setJustSettled(true);
    setTimeout(() => setJustSettled(false), 3500);
  };

  // Subcategory breakdown for this event
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

  // Open add modal preselected to this event
  const handleQuickAddExpenseToEvent = () => {
    setPreselectedEventIdForAdd(activeEvent?.id || null);
    setIsAddModalOpen(true);
  };

  // Format date and updated_at timestamp in clean Slovak
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

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. TOP EVENT SELECTOR CAROUSEL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Vybraný projekt / event
          </span>
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nový projekt</span>
          </button>
        </div>

        {/* Horizontal Event Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {events.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            const evCount = expenses.filter((e) => e.event_id === ev.id).length;

            return (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-2xl whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-bold ring-2'
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
                  {evCount}
                </span>
              </button>
            );
          })}

          {/* Option for ALL projects */}
          <button
            onClick={() => setSelectedEventId('all')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-2xl whitespace-nowrap transition-all shrink-0 ${
              selectedEventId === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🌟</span>
            <span className="text-xs">Všetky projekty spolu</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE EVENT HERO CARD */}
      <div
        className="rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all"
        style={{
          background: `linear-gradient(135deg, ${activeEvent?.color || '#0ea5e9'}15 0%, transparent 70%)`,
          borderColor: `${activeEvent?.color || '#0ea5e9'}40`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: `${activeEvent?.color || '#0ea5e9'}30` }}
            >
              {activeEvent?.emoji || '📋'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeEvent?.type === 'renovation'
                    ? 'Rekonštrukcia'
                    : activeEvent?.type === 'trip'
                    ? 'Výlet / Dovolenka'
                    : activeEvent?.type === 'dates'
                    ? 'Spoločné rande'
                    : 'Projekt'}
                </span>
                {activeEvent?.destination && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md">
                    📍 {activeEvent.destination}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {selectedEventId === 'all' ? 'Všetky spoločné projekty' : activeEvent?.name}
              </h2>
            </div>
          </div>

          <button
            onClick={handleQuickAddExpenseToEvent}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Pridať výdavok</span>
          </button>
        </div>

        {activeEvent?.description && selectedEventId !== 'all' && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5">
            {activeEvent.description}
          </p>
        )}

        {/* Budget & Spend Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Minuté na tento projekt
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {totalSpent.toFixed(2)} €
            </div>
            <span className="text-[10px] text-slate-400">
              {eventExpenses.length} evidovaných položiek
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Rozpočet
            </span>
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
              {activeEvent?.target_budget ? `${activeEvent.target_budget.toFixed(0)} €` : 'Nenastavený'}
            </div>
            {activeEvent?.target_budget && (
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                {Math.round((totalSpent / activeEvent.target_budget) * 100)}% z rozpočtu
              </span>
            )}
          </div>
        </div>

        {/* Budget Progress Bar */}
        {activeEvent?.target_budget && (
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                totalSpent > activeEvent.target_budget ? 'bg-rose-500' : 'bg-sky-500'
              }`}
              style={{
                width: `${Math.min((totalSpent / activeEvent.target_budget) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* 3. EVENT SETTLEMENT / WHO OWES WHO (50/50 SPLIT) */}
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
                Vyrovnanie nákladov projektu (50/50)
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
              Vyrovnať
            </button>
          )}
        </div>

        {/* Payer balance bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{currentUser.emoji}</span>
              <span>{currentUser.name}: {(currentIsUser1 ? user1Paid : user2Paid).toFixed(2)} €</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{otherUser.name}: {(currentIsUser1 ? user2Paid : user1Paid).toFixed(2)} €</span>
              <span>{otherUser.emoji}</span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{
                width: `${totalSpent > 0 ? ((currentIsUser1 ? user1Paid : user2Paid) / totalSpent) * 100 : 50}%`,
                backgroundColor: currentUser.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
            <div
              style={{
                width: `${totalSpent > 0 ? ((currentIsUser1 ? user2Paid : user1Paid) / totalSpent) * 100 : 50}%`,
                backgroundColor: otherUser.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
          </div>
        </div>

        {justSettled && (
          <div className="absolute inset-0 bg-emerald-600 text-white flex flex-col items-center justify-center p-4 rounded-3xl animate-in zoom-in-95 duration-200">
            <Sparkles className="w-8 h-8 animate-bounce mb-1" />
            <h4 className="text-base font-bold">Účty boli vyrovnané!</h4>
            <p className="text-xs text-emerald-100">Dlh bol označený za vysporiadaný.</p>
          </div>
        )}
      </div>

      {/* 4. SUBCATEGORY BREAKDOWN & STATS TABLE */}
      {subcategoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rozdelenie nákladov podľa kategórií
              </h3>
            </div>
            <span className="text-xs text-slate-400">{subcategoryBreakdown.length} oblastí</span>
          </div>

          <div className="space-y-2 pt-1">
            {subcategoryBreakdown.map((item) => {
              const percent = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name} <span className="text-[10px] text-slate-400">({item.count}x)</span>
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {item.amount.toFixed(2)} €
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ITEM-BY-ITEM EXPENSES TABLE & LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Zoznam výdavkov projektu
            </h3>
            <p className="text-[11px] text-slate-400">
              Suma, kto to pridal, čo to bolo, komentár a dátová pečiatka
            </p>
          </div>
          <button
            onClick={handleQuickAddExpenseToEvent}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pridať</span>
          </button>
        </div>

        {eventExpenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            V tomto projekte zatiaľ nie sú žiadne výdavky.{' '}
            <button
              onClick={handleQuickAddExpenseToEvent}
              className="text-sky-600 font-bold hover:underline"
            >
              Pridajte prvú položku!
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
                  {/* Top line: What it was + Amount */}
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

                        {/* Kto to pridal + Kategória */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <span>{payer.emoji}</span>
                            <span>{payer.name}</span>
                          </span>
                          <span>·</span>
                          <span>{exp.subcategory}</span>
                          {exp.country && (
                            <>
                              <span>·</span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                📍 {exp.country}
                              </span>
                            </>
                          )}
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

                  {/* Audit Row: Date & Change Timestamp + Edit / Delete Actions */}
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      {formattedUpdated ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          <span>Zmenené: {formattedUpdated}</span>
                        </span>
                      ) : (
                        <span>Pridané: {exp.date}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Upraviť</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(exp.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Vymazať</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Settlement */}
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
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSettle}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Tento záznam bude natrvalo vymazaný.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Zrušiť
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold active:scale-95"
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
