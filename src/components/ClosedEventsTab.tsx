import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Unlock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { CategoryDonutChart } from './Charts';
import { DEFAULT_PROFILES } from '../lib/defaultData';

export const ClosedEventsTab: React.FC = () => {
  const {
    closedEvents,
    expenses,
    categories,
    profiles,
    reopenEvent,
    setSelectedEventId,
    setActiveTab,
  } = useApp();

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [showReopenConfirmId, setShowReopenConfirmId] = useState<string | null>(null);

  const dankoProfile = profiles.find((p) => p.id === 'user_1') || profiles[0] || DEFAULT_PROFILES[0];
  const simonkaProfile = profiles.find((p) => p.id === 'user_2') || profiles[1] || DEFAULT_PROFILES[1];

  const handleToggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const handleReopen = async (id: string) => {
    await reopenEvent(id);
    setShowReopenConfirmId(null);
    setSelectedEventId(id);
    setActiveTab('open_events');
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-xs">
            🔒
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Uzavreté eventy a archív
            </h2>
            <p className="text-xs text-slate-400">
              Ukončené výlety, dokončené prerábky a uzavreté zbery
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
          {closedEvents.length} {closedEvents.length === 1 ? 'projekt' : 'projektov'}
        </span>
      </div>

      {/* Empty State */}
      {closedEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            📦
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Zatiaľ nemáte žiadne uzavreté eventy
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Keď sa výlet alebo prerábka bytu skončí, v záložke Otvorené kliknite na <strong>Ukončiť zber výdavkov</strong>. Projekt sa archivuje sem.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {closedEvents.map((ev) => {
            const evExpenses = expenses.filter((e) => e.event_id === ev.id);
            const evTotal = evExpenses.reduce((s, e) => s + e.amount, 0);
            let u1 = 0;
            let u2 = 0;
            evExpenses.forEach((e) => {
              if (e.paid_by === 'user_1') u1 += e.amount;
              if (e.paid_by === 'user_2') u2 += e.amount;
            });

            const isExpanded = expandedEventId === ev.id;

            return (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Header card */}
                <div
                  onClick={() => handleToggleExpand(ev.id)}
                  className="p-4.5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-3"
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
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Ukončený zber
                          </span>
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

                  {/* 50/50 Share Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>{dankoProfile.emoji} {dankoProfile.name}:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{u1.toFixed(2)} €</strong>
                        <span className="text-[10px] text-slate-400">({evTotal > 0 ? Math.round((u1 / evTotal) * 100) : 50}%)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{simonkaProfile.name}:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{u2.toFixed(2)} €</strong>
                        <span>{simonkaProfile.emoji}</span>
                        <span className="text-[10px] text-slate-400">({evTotal > 0 ? Math.round((u2 / evTotal) * 100) : 50}%)</span>
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

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReopenConfirmId(ev.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Znovu otvoriť zber</span>
                    </button>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                      <span>{isExpanded ? 'Skryť položky' : 'Rozbaliť archív položiek'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized List & Mini Donut */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-200">
                    {/* Donut Chart if items exist */}
                    {evExpenses.length > 0 && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Rozdelenie nákladov uzavretého projektu
                        </span>
                        <CategoryDonutChart expenses={evExpenses} categories={categories} />
                      </div>
                    )}

                    {/* Receipts List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Archív položiek ({evExpenses.length})
                      </span>
                      <div className="divide-y divide-slate-200/60 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
                        {evExpenses.map((item) => {
                          const payer = profiles.find((p) => p.id === item.paid_by);
                          const cat = categories.find((c) => c.id === item.category_id);

                          return (
                            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-slate-900 dark:text-white block truncate">
                                  {item.item_title || item.note || item.subcategory}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                  <span>{item.date}</span>
                                  <span>·</span>
                                  <span>{item.subcategory}</span>
                                  <span>·</span>
                                  <span>{payer?.name}</span>
                                </div>
                              </div>
                              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0">
                                {item.amount.toFixed(2)} €
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Reopen Event */}
      {showReopenConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Unlock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Znovu otvoriť zber výdavkov?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Projekt sa presunie späť do sekcie <strong>Otvorené eventy</strong> a budete doň môcť zapisovať nové výdavky.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowReopenConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Zrušiť
              </button>
              <button
                onClick={() => handleReopen(showReopenConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Áno, otvoriť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
