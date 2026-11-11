import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  Globe,
  Check,
  Plus,
  Coins,
  ArrowRight,
  ArrowLeft,
  FolderPlus,
  Lock,
} from 'lucide-react';
import { UserId, Expense, EventType, AppEvent, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { COUNTRY_CURRENCY_MAP, getCurrencyForCountry } from '../lib/currencies';
import { CreateEventModal } from './CreateEventModal';

const COMMON_TRIP_CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'CZK', symbol: 'Kč', label: 'Česká koruna (CZK / Kč)' },
  { code: 'PLN', symbol: 'zł', label: 'Poľský zlotý (PLN / zł)' },
  { code: 'HUF', symbol: 'Ft', label: 'Maďarský forint (HUF / Ft)' },
  { code: 'GBP', symbol: '£', label: 'Britská libra (GBP / £)' },
  { code: 'USD', symbol: '$', label: 'Americký dolár (USD / $)' },
  { code: 'CHF', symbol: 'CHF', label: 'Švajčiarsky frank (CHF)' },
  { code: 'JPY', symbol: '¥', label: 'Japonský jen (JPY / ¥)' },
];

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

  // Progressive Wizard Step: 1 = Event, 2 = PaidBy, 3 = Category & Currency, 4 = Amount & Date
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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

  // Selected event object
  const selectedEvent = events.find((e) => e.id === eventId) || selectableEvents[0];
  const isTrip = selectedEvent?.type === 'trip';

  // Filter categories strictly according to the selected event type!
  const matchingCategories = useMemo(() => {
    if (!selectedEvent) return categories;

    if (selectedEvent.type === 'trip') {
      return categories.filter((c) => c.defaultEventType === 'trip');
    }
    if (selectedEvent.type === 'dates') {
      return categories.filter((c) => c.defaultEventType === 'dates');
    }
    if (selectedEvent.type === 'renovation') {
      return categories.filter((c) => c.defaultEventType === 'renovation');
    }
    if (selectedEvent.type === 'household') {
      return categories.filter((c) => c.defaultEventType === 'household');
    }
    return categories;
  }, [categories, selectedEvent]);

  const selectedCategory = categories.find((c) => c.id === categoryId) || matchingCategories[0];

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
      setStep(4); // When editing, jump straight to Amount & Details
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
      setAmountInCurrency('');
      setStep(1);

      // Sync event settings
      const ev = events.find((e) => e.id === initialEventId);
      applyEventSettings(ev);
    }
    setErrorMessage(null);
  }, [editingExpense, isAddModalOpen, currentUser, categories, events, selectedEventId, preselectedEventIdForAdd, openEvents]);

  const applyEventSettings = (ev?: AppEvent) => {
    if (!ev) return;

    if (ev.type === 'trip') {
      const countryVal = ev.destination_country || 'Česko';
      setCountry(countryVal);
      const curr = getCurrencyForCountry(countryVal);
      setCurrencyCode(curr.currencyCode);
      setCurrencySymbol(curr.currencySymbol);
      setExchangeRate(curr.defaultRateToEur);
    } else {
      // Dates, Renovation, Household ALWAYS strictly EUR (€)
      setCountry('');
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

  const handleSelectEvent = (newEvId: string) => {
    setEventId(newEvId);
    const ev = events.find((e) => e.id === newEvId);
    applyEventSettings(ev);
    setStep(2); // Auto advance to Step 2
  };

  const handleSelectPaidBy = (userId: UserId) => {
    setPaidBy(userId);
    setStep(3); // Auto advance to Step 3
  };

  const handleCountrySelect = (chosenCountry: string) => {
    setCountry(chosenCountry);
    const curr = getCurrencyForCountry(chosenCountry);
    setCurrencyCode(curr.currencyCode);
    setCurrencySymbol(curr.currencySymbol);
    setExchangeRate(curr.defaultRateToEur);
  };

  const handleCurrencySelect = (code: string, symbol: string) => {
    setCurrencyCode(code);
    setCurrencySymbol(symbol);
    if (code === 'EUR') {
      setExchangeRate(1);
    } else {
      const curr = COUNTRY_CURRENCY_MAP.find((c) => c.currencyCode === code);
      if (curr) setExchangeRate(curr.defaultRateToEur);
    }
  };

  // Calculate EUR amount from currency
  const numericInput = parseFloat(amountInCurrency.replace(',', '.')) || 0;
  const calculatedEurAmount =
    currencyCode === 'EUR' ? numericInput : exchangeRate > 0 ? numericInput / exchangeRate : numericInput;

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
    setStep(1);
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
        country: isTrip ? (country || undefined) : undefined,
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
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingExpense ? 'Upraviť výdavok' : 'Nový spoločný výdavok'}
              </h2>
              <span className="text-[11px] text-slate-400">
                Postupný výber · {selectedEvent ? `${selectedEvent.emoji} ${selectedEvent.name}` : 'Danko & Simonka'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4-Step Wizard Progress Bar */}
          <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 1 ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>1</span>
                <span>Projekt</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">→</span>

              <button
                type="button"
                onClick={() => eventId && setStep(2)}
                disabled={!eventId}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 2 ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>2</span>
                <span>Kto platil</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">→</span>

              <button
                type="button"
                onClick={() => eventId && setStep(3)}
                disabled={!eventId}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 3 ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>3</span>
                <span>Kategória</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">→</span>

              <button
                type="button"
                onClick={() => eventId && setStep(4)}
                disabled={!eventId}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 4 ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 4 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>4</span>
                <span>Suma</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 no-scrollbar text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: VOĽBA EVENTU */}
            {step === 1 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      1. Krok: Vyberte projekt / event
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Do ktorého projektu chcete výdavok zapísať?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInlineCreateEventOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Nový projekt</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectableEvents.map((ev) => {
                    const isSelected = eventId === ev.id;
                    const isClosed = ev.status === 'closed';

                    return (
                      <button
                        type="button"
                        key={ev.id}
                        onClick={() => handleSelectEvent(ev.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 text-slate-900 dark:text-white font-bold ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 rounded-xl bg-white dark:bg-slate-700 shadow-xs">
                          {ev.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold truncate block">{ev.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {isClosed ? '🔒 Ukončený projekt' : ev.destination_country ? `📍 ${ev.destination_country}` : (ev.type === 'dates' ? 'Spoločné rande' : 'Domácnosť & projekt')}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: KTO PLATIL (DANKO vs SIMONKA) */}
            {step === 2 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      2. Krok: Kto to platil?
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Vyberte partnera, ktorý za položku zaplatil
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Späť
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {profiles.map((p) => {
                    const isSelected = paidBy === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleSelectPaidBy(p.id)}
                        className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-2.5 transition-all text-center ${
                          isSelected
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                        style={isSelected ? { boxShadow: `0 0 0 2.5px ${p.avatarColor}` } : {}}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ring-2 ring-white dark:ring-slate-900"
                          style={{ backgroundColor: `${p.avatarColor}20` }}
                        >
                          {p.emoji}
                        </div>
                        <div>
                          <span className="text-sm font-extrabold block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">Platil/a zo svojho</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: KATEGÓRIA PODĽA DRUHU EVENTU + MENA & KRAJINA */}
            {step === 3 && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      3. Krok: Kategória pre {selectedEvent?.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Kategórie sú prísne filtrované podľa druhu projektu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Späť
                  </button>
                </div>

                {/* Ak ide o výlet: Krajina a výber meny */}
                {isTrip && (
                  <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-900/60 rounded-2xl space-y-3">
                    {/* Krajina výletu */}
                    <div>
                      <label className="font-bold text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-1.5 uppercase tracking-wider mb-1">
                        <Globe className="w-3.5 h-3.5 text-amber-600" />
                        <span>Krajina výletu (iba pri výletoch)</span>
                      </label>
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

                    {/* Výber meny pre pridávanie položky */}
                    <div>
                      <label className="font-bold text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-1.5 uppercase tracking-wider mb-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>V akej mene chcete položku pridať?</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {COMMON_TRIP_CURRENCIES.map((c) => (
                          <button
                            type="button"
                            key={c.code}
                            onClick={() => handleCurrencySelect(c.code, c.symbol)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-between ${
                              currencyCode === c.code
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/50'
                            }`}
                          >
                            <span>{c.code} {c.symbol}</span>
                            {currencyCode === c.code && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rande / Prerábka / Domácnosť: Informácia že platí vždy EUR (€) */}
                {!isTrip && (
                  <div className="p-2.5 bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-xl flex items-center justify-between text-xs text-sky-800 dark:text-sky-300 font-semibold">
                    <span>Mena projektu: Euro (€)</span>
                    <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded-full">
                      Vždy v €
                    </span>
                  </div>
                )}

                {/* Výber podkategórie */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Podkategórie ({selectedCategory?.name})
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedCategory?.subcategories.map((sub) => {
                      const isSelected = subcategory === sub;
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => {
                            setSubcategory(sub);
                            setStep(4); // Advance to Step 4!
                          }}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold border-slate-900 dark:border-white'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{sub}</span>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>Pokračovať na sumu a dátum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUMA, POLOŽKA, KOMENTÁR A DÁTUM */}
            {step === 4 && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      4. Krok: Suma, položka a dátum
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedEvent?.name} · {subcategory || selectedCategory?.name} · Platil {paidBy === 'user_1' ? (profiles[0]?.name || 'Danko') : (profiles[1]?.name || 'Simonka')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Späť
                  </button>
                </div>

                {/* Suma s menou */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      Suma ({currencyCode}) *
                    </label>
                    {currencyCode !== 'EUR' && (
                      <span className="text-[10px] text-amber-600 font-bold">
                        Prepočet na EUR: ≈ {calculatedEurAmount.toFixed(2)} €
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="0.00"
                      value={amountInCurrency}
                      onChange={(e) => setAmountInCurrency(e.target.value)}
                      autoFocus
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
                </div>

                {/* Čo to bolo? */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[11px]">
                    Čo to bolo? (Položka) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isTrip
                        ? 'Napr. Lístky na vlak, Večera, Ubytovanie...'
                        : selectedEvent?.type === 'renovation'
                        ? 'Napr. Sadrokartón z OBI, Práca vodára...'
                        : 'Napr. Nákup v Bille, Káva a koláčik...'
                    }
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Komentár k tomu */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[11px]">
                    Komentár k tomu (voliteľné)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Doplňujúca poznámka k výdavku..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Dátum */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      Dátum *
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
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Submit button */}
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
                        <span>Uložiť zmeny ({calculatedEurAmount.toFixed(2)} €)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        <span>Pridať výdavok ({calculatedEurAmount.toFixed(2)} €)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
