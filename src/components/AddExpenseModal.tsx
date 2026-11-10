import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Globe, Check, Plus, Coins, ArrowRight, FolderPlus } from 'lucide-react';
import { UserId, Expense, EventType, AppEvent } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { COUNTRY_CURRENCY_MAP, getCurrencyForCountry } from '../lib/currencies';
import { CreateEventModal } from './CreateEventModal';

export const AddExpenseModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingExpense,
    setEditingExpense,
    currentUser,
    profiles,
    events,
    openEvents,
    selectedEventId,
    categories,
    addExpense,
    updateExpense,
    preselectedEventIdForAdd,
    setPreselectedEventIdForAdd,
  } = useApp();

  const [isInlineCreateEventOpen, setIsInlineCreateEventOpen] = useState(false);

  // Form states
  const [eventId, setEventId] = useState<string>('');
  const [paidBy, setPaidBy] = useState<UserId>(currentUser.id);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  // Currency & Amount
  const [amountInCurrency, setAmountInCurrency] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<string>('EUR');
  const [currencySymbol, setCurrencySymbol] = useState<string>('€');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [country, setCountry] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    if (editingExpense) {
      setEventId(editingExpense.event_id || events[0]?.id || '');
      setPaidBy(editingExpense.paid_by);
      setCategoryId(editingExpense.category_id);
      setSubcategory(editingExpense.subcategory);
      setItemTitle(editingExpense.item_title || '');
      setNote(editingExpense.note || '');
      setDateStr(editingExpense.date);
      setCountry(editingExpense.country || '');

      if (editingExpense.currency && editingExpense.currency !== 'EUR' && editingExpense.original_amount) {
        setCurrencyCode(editingExpense.currency);
        setCurrencySymbol(editingExpense.currency_symbol || editingExpense.currency);
        setExchangeRate(editingExpense.exchange_rate || 1);
        setAmountInCurrency(editingExpense.original_amount.toString());
      } else {
        setCurrencyCode('EUR');
        setCurrencySymbol('€');
        setExchangeRate(1);
        setAmountInCurrency(editingExpense.amount.toString());
      }
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      const initialEventId =
        preselectedEventIdForAdd ||
        (selectedEventId !== 'all' ? selectedEventId : (openEvents[0]?.id || events[0]?.id || ''));

      setEventId(initialEventId);
      setPaidBy(currentUser.id);
      setItemTitle('');
      setNote('');
      setDateStr(`${yyyy}-${mm}-${dd}`);

      // Sync event settings
      const ev = events.find((e) => e.id === initialEventId);
      applyEventSettings(ev);
    }
    setErrorMessage(null);
  }, [editingExpense, isAddModalOpen, currentUser, categories, events, selectedEventId, preselectedEventIdForAdd, openEvents]);

  // Selectable events: open events + current editing event if closed
  const selectableEvents: AppEvent[] = useMemo(() => {
    if (editingExpense) {
      const currentEv = events.find((e) => e.id === editingExpense.event_id);
      if (currentEv && currentEv.status === 'closed') {
        const others = openEvents.filter((e) => e.id !== currentEv.id);
        return [currentEv, ...others];
      }
    }
    return openEvents.length > 0 ? openEvents : events;
  }, [events, openEvents, editingExpense]);

  const applyEventSettings = (ev?: typeof events[0]) => {
    if (!ev) return;
    if (ev.destination_country) {
      setCountry(ev.destination_country);
    }
    if (ev.currency) {
      setCurrencyCode(ev.currency);
      setCurrencySymbol(ev.currency_symbol || '€');
      setExchangeRate(ev.exchange_rate_to_eur || 1);
    } else {
      setCurrencyCode('EUR');
      setCurrencySymbol('€');
      setExchangeRate(1);
    }

    // Auto match category to event type
    const matched = categories.find((c) => c.defaultEventType === ev.type);
    if (matched) {
      setCategoryId(matched.id);
      setSubcategory(matched.subcategories[0] || '');
    } else {
      setCategoryId(categories[0]?.id || '');
      setSubcategory(categories[0]?.subcategories[0] || '');
    }
  };

  const handleEventChange = (newEvId: string) => {
    setEventId(newEvId);
    const ev = events.find((e) => e.id === newEvId);
    applyEventSettings(ev);
  };

  const handleCountrySelect = (chosenCountry: string) => {
    setCountry(chosenCountry);
    const curr = getCurrencyForCountry(chosenCountry);
    setCurrencyCode(curr.currencyCode);
    setCurrencySymbol(curr.currencySymbol);
    setExchangeRate(curr.defaultRateToEur);
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedEvent = events.find((e) => e.id === eventId);
  const isTrip = selectedEvent?.type === 'trip' || selectedCategory?.defaultEventType === 'trip';

  // Calculate EUR amount from currency
  const numericInput = parseFloat(amountInCurrency.replace(',', '.')) || 0;
  const calculatedEurAmount = currencyCode === 'EUR' ? numericInput : (exchangeRate > 0 ? numericInput / exchangeRate : numericInput);

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amountInCurrency) || 0;
    setAmountInCurrency((current + addVal).toFixed(current % 1 === 0 ? 0 : 2));
  };

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
    setPreselectedEventIdForAdd(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (calculatedEurAmount <= 0) {
      setErrorMessage('Zadajte platnú sumu vyššiu ako 0.');
      return;
    }

    if (!eventId) {
      setErrorMessage('Vyberte otvorený projekt alebo vytvorte nový.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Vyberte kategóriu výdavku.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: Number(calculatedEurAmount.toFixed(2)),
        original_amount: currencyCode !== 'EUR' ? numericInput : undefined,
        currency: currencyCode,
        currency_symbol: currencySymbol,
        exchange_rate: exchangeRate,
        paid_by: paidBy,
        event_id: eventId,
        category_id: categoryId,
        subcategory: subcategory || selectedCategory?.subcategories[0] || 'Všeobecné',
        item_title: itemTitle.trim() || undefined,
        note: note.trim() || undefined,
        country: country || undefined,
        date: dateStr,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage('Nepodarilo sa uložiť výdavok: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAddModalOpen && !editingExpense) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          role="dialog"
        >
          {/* iOS Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingExpense ? 'Upraviť výdavok' : 'Nový výdavok'}
              </h2>
              <span className="text-[11px] text-slate-400">
                Párové sledovanie pre Danka a Simonku
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4.5 no-scrollbar text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* 1. OTVORENÉ EVENTY ALEBO VYTVORIŤ NOVÝ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  1. Otvorené projekty / eventy
                </label>
                <button
                  type="button"
                  onClick={() => setIsInlineCreateEventOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Vytvoriť nový</span>
                </button>
              </div>

              {selectableEvents.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl text-center">
                  <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
                    Nemáte žiadny projekt.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsInlineCreateEventOpen(true)}
                    className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-xs"
                  >
                    Vytvoriť prvý projekt
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {selectableEvents.map((ev) => {
                    const isSelected = eventId === ev.id;
                    const isClosed = ev.status === 'closed';
                    return (
                      <button
                        type="button"
                        key={ev.id}
                        onClick={() => handleEventChange(ev.id)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl shrink-0">{ev.emoji}</span>
                        <div className="min-w-0">
                          <span className="text-xs truncate block">{ev.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {isClosed ? '🔒 Ukončený' : ev.destination_country ? `📍 ${ev.destination_country}` : (ev.type === 'dates' ? 'Rande' : 'Projekt')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. KTO PLATIL (DANKO vs SIMONKA) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                2. Kto to platil?
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
                {profiles.map((p) => {
                  const isSelected = paidBy === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaidBy(p.id)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                      style={isSelected ? { boxShadow: `0 0 0 2px ${p.avatarColor}` } : {}}
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span className="text-xs truncate font-bold">{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. KATEGORICKÉ ČLENENIE (VÝLET / RANDE / PRERÁBKA / DOMÁCNOSŤ) */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                3. Kategória a Podkategória
              </label>

              {/* 4 Hlavné Kategórie */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setCategoryId(cat.id);
                        setSubcategory(cat.subcategories[0] || '');
                        if (cat.defaultEventType === 'trip' && !country) {
                          handleCountrySelect('Česko');
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] leading-tight font-bold truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Podkategórie pre zvolenú kategóriu */}
              {selectedCategory && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Podkategória ({selectedCategory.name})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.subcategories.map((sub) => {
                      const isSelected = subcategory === sub;
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => setSubcategory(sub)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* VÝLET KRAJINA & MENA - Pokiaľ ide o výlet */}
            {isTrip && (
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-900/60 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <span>Krajina výletu & Lokálna mena</span>
                  </label>
                  {currencyCode !== 'EUR' && (
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                      1 € ≈ {exchangeRate} {currencyCode}
                    </span>
                  )}
                </div>

                <select
                  value={country || 'Česko'}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {COUNTRY_CURRENCY_MAP.map((item) => (
                    <option key={item.country} value={item.country}>
                      {item.flag} {item.country} — {item.currencyCode} ({item.currencySymbol})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. SUMA A MENA KRAJINY */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  4. Suma ({currencyCode})
                </label>
                {isTrip && currencyCode !== 'EUR' && (
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                    Platba v {currencyCode} ({currencySymbol})
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountInCurrency}
                  onChange={(e) => setAmountInCurrency(e.target.value)}
                  autoFocus={!editingExpense}
                  className="w-full h-14 px-4 pr-16 text-2xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500 dark:text-slate-400">
                  {currencySymbol}
                </span>
              </div>

              {/* Rýchle čiastky */}
              <div className="flex gap-2">
                {[5, 10, 20, 50, 100].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => handleQuickAddAmount(val)}
                    className="flex-1 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg active:scale-95 transition-all"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              {/* Cudzia mena & Prepočet na EUR */}
              {currencyCode !== 'EUR' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-800 dark:text-amber-300 font-semibold block">
                      Lokálna mena ({country}): {numericInput.toFixed(2)} {currencyCode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Kurz: 1 € ≈ {exchangeRate} {currencyCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Prepočet na EUR:
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                      ≈ {calculatedEurAmount.toFixed(2)} €
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. ČO TO BOLO */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[11px]">
                5. Čo to bolo? (Položka) *
              </label>
              <input
                type="text"
                required
                placeholder={
                  selectedCategory?.defaultEventType === 'trip'
                    ? 'Napr. Lístky na metro v Prahe, Večera v reštaurácii...'
                    : selectedCategory?.defaultEventType === 'renovation'
                    ? 'Napr. Dlažba a lepidlo z OBI, Práca vodára...'
                    : 'Napr. Večera, Káva a koláčik, Nákup v Bille...'
                }
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* 6. KOMENTÁR K TOMU */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[11px]">
                6. Komentár k tomu (voliteľné)
              </label>
              <textarea
                rows={2}
                placeholder="Doplňujúca poznámka k výdavku..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* 7. DÁTUM */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  7. Dátum
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetDate(0)}
                    className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
                  >
                    Dnes
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setPresetDate(1)}
                    className="text-slate-500 hover:underline"
                  >
                    Včera
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : editingExpense ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Uložiť zmeny (s dátovou pečiatkou)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>Pridať výdavok ({calculatedEurAmount.toFixed(2)} €)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline Event Creation */}
      <CreateEventModal
        isOpen={isInlineCreateEventOpen}
        onClose={() => setIsInlineCreateEventOpen(false)}
      />
    </>
  );
};
