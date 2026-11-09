import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scale,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Receipt,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { CategoryDonutChart, MonthlyTrendChart } from './Charts';
import { CategoryIcon } from './CategoryIcon';

export const DashboardTab: React.FC = () => {
  const {
    currentUser,
    otherUser,
    expenses,
    categories,
    selectedMonth,
    setSelectedMonth,
    settleBalance,
    setActiveTab,
    setIsAddModalOpen,
  } = useApp();

  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [justSettled, setJustSettled] = useState(false);

  // Month navigation helpers
  const [yearStr, monthStr] = selectedMonth.split('-');
  const currDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);

  const prevMonthKey = () => {
    const d = new Date(currDate);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const nextMonthKey = () => {
    const d = new Date(currDate);
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const monthLabel = currDate.toLocaleDateString('sk-SK', {
    month: 'long',
    year: 'numeric',
  });

  // Filter expenses for current month
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // Calculate un-settled expenses for settlement (can be from this month or previous)
  const unsettledExpenses = expenses.filter((e) => !e.is_settled);

  // Totals for the current month
  let totalMonthSpend = 0;
  let user1MonthSpend = 0;
  let user2MonthSpend = 0;

  monthExpenses.forEach((e) => {
    totalMonthSpend += e.amount;
    if (e.paid_by === 'user_1') user1MonthSpend += e.amount;
    if (e.paid_by === 'user_2') user2MonthSpend += e.amount;
  });

  // Balance calculation for UNSETTLED expenses (fair 50/50 split)
  let user1UnsettledPaid = 0;
  let user2UnsettledPaid = 0;

  unsettledExpenses.forEach((e) => {
    if (e.paid_by === 'user_1') user1UnsettledPaid += e.amount;
    if (e.paid_by === 'user_2') user2UnsettledPaid += e.amount;
  });

  const totalUnsettled = user1UnsettledPaid + user2UnsettledPaid;
  const fairShare = totalUnsettled / 2;

  // Difference: who owes whom?
  // positive diff means user_1 paid more than fair share, so user_2 owes user_1
  const balanceDiff = user1UnsettledPaid - fairShare;

  const currentIsUser1 = currentUser.id === 'user_1';
  let settlementMessage = '';
  let settlementAmount = Math.abs(balanceDiff);
  let whoOwesWho: 'i_am_owed' | 'i_owe' | 'even' = 'even';
  let debtorUser = otherUser;
  let creditorUser = currentUser;

  if (Math.abs(balanceDiff) < 0.01) {
    whoOwesWho = 'even';
    settlementMessage = 'Účty sú dokonale vyrovnané! 🎉';
  } else if (balanceDiff > 0) {
    // user_1 paid more
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
    // user_2 paid more
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

  const handleSettleDebt = async () => {
    if (unsettledExpenses.length === 0 || whoOwesWho === 'even') return;

    await settleBalance(
      settlementAmount,
      debtorUser.id,
      creditorUser.id,
      unsettledExpenses.map((e) => e.id)
    );

    setShowSettlementConfirm(false);
    setJustSettled(true);
    setTimeout(() => setJustSettled(false), 4000);
  };

  // Recent 4 expenses from current month
  const recentExpenses = monthExpenses.slice(0, 4);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* 1. Month Selector Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setSelectedMonth(prevMonthKey())}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Predchádzajúci mesiac"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            {monthLabel}
          </span>
        </div>

        <button
          onClick={() => setSelectedMonth(nextMonthKey())}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Nasledujúci mesiac"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. AUTOMATIC SETTLEMENT / FAIR BALANCE CARD */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 shadow-lg border transition-all ${
          whoOwesWho === 'even'
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 dark:bg-emerald-950/20'
            : whoOwesWho === 'i_am_owed'
            ? 'bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent border-sky-500/30 dark:bg-sky-950/30'
            : 'bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-transparent border-rose-500/30 dark:bg-rose-950/30'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                whoOwesWho === 'even'
                  ? 'bg-emerald-500 text-white'
                  : whoOwesWho === 'i_am_owed'
                  ? 'bg-sky-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Párové vyrovnanie (50/50)
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {settlementMessage}
              </h3>
            </div>
          </div>

          {unsettledExpenses.length > 0 && whoOwesWho !== 'even' && (
            <button
              onClick={() => setShowSettlementConfirm(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Vyrovnať
            </button>
          )}
        </div>

        {/* Breakdown bar between partners */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>{currentUser.emoji}</span>
              <span>{currentUser.name}: {(currentIsUser1 ? user1UnsettledPaid : user2UnsettledPaid).toFixed(2)} €</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>{otherUser.name}: {(currentIsUser1 ? user2UnsettledPaid : user1UnsettledPaid).toFixed(2)} €</span>
              <span>{otherUser.emoji}</span>
            </span>
          </div>

          {/* Dual Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{
                width: `${totalUnsettled > 0 ? ((currentIsUser1 ? user1UnsettledPaid : user2UnsettledPaid) / totalUnsettled) * 100 : 50}%`,
                backgroundColor: currentUser.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
            <div
              style={{
                width: `${totalUnsettled > 0 ? ((currentIsUser1 ? user2UnsettledPaid : user1UnsettledPaid) / totalUnsettled) * 100 : 50}%`,
                backgroundColor: otherUser.avatarColor,
              }}
              className="h-full transition-all duration-500"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            <span>Nevyrovnané výdavky: {unsettledExpenses.length}</span>
            <span>Férový podiel: {fairShare.toFixed(2)} €</span>
          </div>
        </div>

        {justSettled && (
          <div className="absolute inset-0 bg-emerald-600 text-white flex flex-col items-center justify-center p-4 rounded-3xl animate-in zoom-in-95 duration-200">
            <Sparkles className="w-8 h-8 animate-bounce mb-1" />
            <h4 className="text-base font-bold">Účty boli úspešne vyrovnané!</h4>
            <p className="text-xs text-emerald-100">Dlh bol vynulovaný a záznam archivovaný.</p>
          </div>
        )}
      </div>

      {/* 3. MONTHLY KPI STATS (3-card grid) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
            Celkom mesiac
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
            {totalMonthSpend.toFixed(2)} €
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {monthExpenses.length} položiek
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs">{currentUser.emoji}</span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">
              {currentUser.name}
            </span>
          </div>
          <span className="text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums mt-1">
            {(currentIsUser1 ? user1MonthSpend : user2MonthSpend).toFixed(2)} €
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {totalMonthSpend > 0
              ? `${Math.round(((currentIsUser1 ? user1MonthSpend : user2MonthSpend) / totalMonthSpend) * 100)}%`
              : '0%'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs">{otherUser.emoji}</span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">
              {otherUser.name}
            </span>
          </div>
          <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 tabular-nums mt-1">
            {(currentIsUser1 ? user2MonthSpend : user1MonthSpend).toFixed(2)} €
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {totalMonthSpend > 0
              ? `${Math.round(((currentIsUser1 ? user2MonthSpend : user1MonthSpend) / totalMonthSpend) * 100)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* 4. CATEGORY BREAKDOWN DONUT CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Rozdelenie podľa kategórií
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {monthLabel}
          </span>
        </div>

        <CategoryDonutChart expenses={monthExpenses} categories={categories} />
      </div>

      {/* 5. 6-MONTH SPENDING TREND */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              História za posledných 6 mesiacov
            </h3>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
          Kliknutím na stĺpec sa prepnete na daný mesiac.
        </p>

        <MonthlyTrendChart
          expenses={expenses}
          currentMonth={selectedMonth}
          onSelectMonth={(m) => setSelectedMonth(m)}
        />
      </div>

      {/* 6. RECENT TRANSACTIONS PREVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nedávne položky ({monthLabel})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
          >
            <span>Všetky</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Žiadne výdavky za tento mesiac.{' '}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-sky-600 font-bold hover:underline"
            >
              Pridajte prvý výdavok!
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentExpenses.map((exp) => {
              const cat = categories.find((c) => c.id === exp.category_id);
              const payer = exp.paid_by === currentUser.id ? currentUser : otherUser;

              return (
                <div
                  key={exp.id}
                  className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat?.color || '#0284c7' }}
                    >
                      <CategoryIcon name={cat?.iconName || 'Tag'} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {exp.note || exp.subcategory || cat?.name}
                        </span>
                        {exp.country && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            ✈️ {exp.country}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{exp.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 font-medium text-slate-600 dark:text-slate-400">
                          {payer.emoji} {payer.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0 ml-3">
                    {exp.amount.toFixed(2)} €
                  </span>
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
              Označiť účty ako vyrovnané?
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Vyrovnáte sumu <strong>{settlementAmount.toFixed(2)} €</strong> ({debtorUser.name} vyplatí {creditorUser.name}). {unsettledExpenses.length} položiek bude označených ako vysporiadaných.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowSettlementConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSettleDebt}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
              >
                Áno, vyrovnať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
