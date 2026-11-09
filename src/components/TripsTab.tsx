import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Plane,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const TripsTab: React.FC = () => {
  const { expenses, categories, profiles, currentUser, otherUser, setIsAddModalOpen } = useApp();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Group all expenses that have a country or are under "Výlet" category
  const tripExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const cat = categories.find((c) => c.id === e.category_id);
      const isTripCat =
        cat?.name.toLowerCase().includes('výlet') ||
        cat?.name.toLowerCase().includes('vylet') ||
        cat?.name.toLowerCase().includes('trip');
      return Boolean(e.country || isTripCat);
    });
  }, [expenses, categories]);

  // Group by country / trip destination
  const tripGroups = useMemo(() => {
    const groups: {
      [country: string]: {
        country: string;
        items: Expense[];
        total: number;
        user1Paid: number;
        user2Paid: number;
        earliestDate: string;
        latestDate: string;
      };
    } = {};

    tripExpenses.forEach((e) => {
      const dest = e.country?.trim() || 'Ostatné výlety';
      if (!groups[dest]) {
        groups[dest] = {
          country: dest,
          items: [],
          total: 0,
          user1Paid: 0,
          user2Paid: 0,
          earliestDate: e.date,
          latestDate: e.date,
        };
      }
      groups[dest].items.push(e);
      groups[dest].total += e.amount;
      if (e.paid_by === 'user_1') groups[dest].user1Paid += e.amount;
      if (e.paid_by === 'user_2') groups[dest].user2Paid += e.amount;

      if (e.date < groups[dest].earliestDate) groups[dest].earliestDate = e.date;
      if (e.date > groups[dest].latestDate) groups[dest].latestDate = e.date;
    });

    // Convert to sorted array by total spent descending
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [tripExpenses]);

  // Overall trips total
  const allTripsTotal = tripGroups.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-950/30 rounded-3xl p-5 border border-amber-500/30 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Spoločné cestovanie
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Prehľad výletov a dovoleniek
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Pridať výlet</span>
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Celkovo minuté na cesty
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {allTripsTotal.toFixed(2)} €
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Evidované destinácie
            </span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {tripGroups.length} {tripGroups.length === 1 ? 'výlet' : 'výlety'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Destination Cards List */}
      {tripGroups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center">
          <Plane className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Zatiaľ nemáte zaznamenané žiadne výlety
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Pri pridávaní výdavku zvoľte kategóriu "Výlet" a zadajte krajinu alebo destináciu.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Pridať prvý výlet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tripGroups.map((trip) => {
            const isExpanded = expandedCountry === trip.country;

            return (
              <div
                key={trip.country}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Trip Card Header (clickable to expand) */}
                <button
                  onClick={() => setExpandedCountry(isExpanded ? null : trip.country)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm text-lg">
                      ✈️
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {trip.country}
                        </h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium">
                          {trip.items.length} {trip.items.length === 1 ? 'položka' : 'položiek'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {trip.earliestDate === trip.latestDate
                            ? trip.earliestDate
                            : `${trip.earliestDate} - ${trip.latestDate}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums block">
                        {trip.total.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-slate-400">spolu</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Sub-breakdown bar (Who paid how much for this trip) */}
                <div className="px-4 pb-3">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      <span>{profiles[0].emoji} {profiles[0].name}:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{trip.user1Paid.toFixed(2)} €</strong>
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <span>{profiles[1].emoji} {profiles[1].name}:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{trip.user2Paid.toFixed(2)} €</strong>
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      style={{
                        width: `${trip.total > 0 ? (trip.user1Paid / trip.total) * 100 : 50}%`,
                        backgroundColor: profiles[0].avatarColor,
                      }}
                      className="h-full"
                    />
                    <div
                      style={{
                        width: `${trip.total > 0 ? (trip.user2Paid / trip.total) * 100 : 50}%`,
                        backgroundColor: profiles[1].avatarColor,
                      }}
                      className="h-full"
                    />
                  </div>
                </div>

                {/* Itemized List when expanded */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-2 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Položky tohto výletu
                    </span>

                    <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                      {trip.items.map((item) => {
                        const payer = profiles.find((p) => p.id === item.paid_by);
                        const cat = categories.find((c) => c.id === item.category_id);

                        return (
                          <div
                            key={item.id}
                            className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                {item.note || item.subcategory}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                <span>{item.date}</span>
                                <span>·</span>
                                <span>{item.subcategory}</span>
                                <span>·</span>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {payer?.emoji} {payer?.name}
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0">
                              {item.amount.toFixed(2)} €
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
