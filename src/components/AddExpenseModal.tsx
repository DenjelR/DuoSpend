import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Globe, FileText, Check, Plus, Tag } from 'lucide-react';
import { UserId, Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { POPULAR_COUNTRIES } from '../lib/defaultData';

export const AddExpenseModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingExpense,
    setEditingExpense,
    currentUser,
    profiles,
    events,
    selectedEventId,
    categories,
    addExpense,
    updateExpense,
    preselectedEventIdForAdd,
    setPreselectedEventIdForAdd,
  } = useApp();

  const [eventId, setEventId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paidBy, setPaidBy] = useState<UserId>(currentUser.id);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [customCountry, setCustomCountry] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (editingExpense) {
      setEventId(editingExpense.event_id || events[0]?.id || 'event_prerabka');
      setAmountStr(editingExpense.amount.toString());
      setPaidBy(editingExpense.paid_by);
      setCategoryId(editingExpense.category_id);
      setSubcategory(editingExpense.subcategory);
      setItemTitle(editingExpense.item_title || '');
      setNote(editingExpense.note || '');
      if (editingExpense.country) {
        if (POPULAR_COUNTRIES.includes(editingExpense.country)) {
          setCountry(editingExpense.country);
        } else {
          setCountry('other');
          setCustomCountry(editingExpense.country);
        }
      } else {
        setCountry('');
        setCustomCountry('');
      }
      setDateStr(editingExpense.date);
    } else {
      // New expense
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      const initialEventId =
        preselectedEventIdForAdd ||
        (selectedEventId !== 'all' ? selectedEventId : events[0]?.id || 'event_prerabka');

      setEventId(initialEventId);
      setAmountStr('');
      setPaidBy(currentUser.id);
      setItemTitle('');
      setNote('');

      // Auto-match category to the event type if possible
      const ev = events.find((e) => e.id === initialEventId);
      let matchedCat = categories.find((c) => c.defaultEventType === ev?.type) || categories[0];
      setCategoryId(matchedCat?.id || '');
      setSubcategory(matchedCat?.subcategories[0] || '');

      setCountry(ev?.destination || '');
      setCustomCountry('');
      setDateStr(`${yyyy}-${mm}-${dd}`);
    }
    setErrorMessage(null);
  }, [editingExpense, isAddModalOpen, currentUser, categories, events, selectedEventId, preselectedEventIdForAdd]);

  // When event changes, auto-adjust category if appropriate
  const handleEventChange = (newEvId: string) => {
    setEventId(newEvId);
    const ev = events.find((e) => e.id === newEvId);
    if (ev) {
      const matched = categories.find((c) => c.defaultEventType === ev.type);
      if (matched) {
        setCategoryId(matched.id);
        setSubcategory(matched.subcategories[0] || '');
      }
      if (ev.destination) {
        setCountry(ev.destination);
      }
    }
  };

  if (!isAddModalOpen && !editingExpense) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedEvent = events.find((ev) => ev.id === eventId);
  const isTrip =
    selectedEvent?.type === 'trip' ||
    selectedCategory?.name.toLowerCase().includes('výlet') ||
    selectedCategory?.name.toLowerCase().includes('vylet');

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + addVal).toFixed(current % 1 === 0 ? 0 : 2));
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

    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Zadajte platnú sumu vyššiu ako 0 €.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Vyberte kategóriu výdavku.');
      return;
    }

    const finalCountry = isTrip
      ? country === 'other'
        ? customCountry.trim()
        : country
      : undefined;

    setIsSubmitting(true);

    try {
      if (editingExpense) {
        // Will set updated_at timestamp in AppContext
        await updateExpense(editingExpense.id, {
          amount: parsedAmount,
          paid_by: paidBy,
          event_id: eventId || events[0]?.id || 'event_prerabka',
          category_id: categoryId,
          subcategory: subcategory || selectedCategory?.subcategories[0] || 'Všeobecné',
          item_title: itemTitle.trim() || undefined,
          note: note.trim() || undefined,
          country: finalCountry || undefined,
          date: dateStr,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          paid_by: paidBy,
          event_id: eventId || events[0]?.id || 'event_prerabka',
          category_id: categoryId,
          subcategory: subcategory || selectedCategory?.subcategories[0] || 'Všeobecné',
          item_title: itemTitle.trim() || undefined,
          note: note.trim() || undefined,
          country: finalCountry || undefined,
          date: dateStr,
        });
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage('Nepodarilo sa uložiť výdavok: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            {editingExpense && editingExpense.created_at && (
              <span className="text-[10px] text-slate-400">
                Pôvodne pridané: {new Date(editingExpense.created_at).toLocaleDateString('sk-SK')}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 no-scrollbar text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. VYBRANÝ PROJEKT / EVENT */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Projekt / Event
            </label>
            <div className="grid grid-cols-2 gap-2">
              {events.map((ev) => {
                const isSelected = eventId === ev.id;
                return (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() => handleEventChange(ev.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-lg shrink-0">{ev.emoji}</span>
                    <span className="truncate text-xs">{ev.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. KTO PLATIL (Segmented switch) */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Kto to zaplatil?
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
                    <span className="text-xs truncate">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SUMA V EUR */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Suma
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus={!editingExpense}
                className="w-full h-14 px-4 pr-12 text-2xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center tabular-nums"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                €
              </span>
            </div>

            <div className="flex gap-2 mt-1.5">
              {[5, 10, 20, 50, 100].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAddAmount(val)}
                  className="flex-1 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg active:scale-95 transition-all"
                >
                  +{val}€
                </button>
              ))}
            </div>
          </div>

          {/* 4. ČO TO BOLO (Názov položky) */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Čo to bolo? (Položka / Názov) *
            </label>
            <input
              type="text"
              required
              placeholder={
                selectedEvent?.type === 'renovation'
                  ? 'Napr. Sadrokartónové dosky, Kúpeľňová batéria...'
                  : selectedEvent?.type === 'trip'
                  ? 'Napr. Letenky Viedeň - Rím, Večera v trattórii...'
                  : 'Napr. Romantická večera, Káva a koláčik...'
              }
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* 5. KATEGÓRIA A PODKATEGÓRIA */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Kategória
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setSubcategory(cat.subcategories[0] || '');
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Podkategória Pills */}
            {selectedCategory && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
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
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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

          {/* 6. AK JE VÝLET -> KRAJINA */}
          {isTrip && (
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">
                Krajina / Destinácia výletu
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-xl text-xs"
              >
                <option value="">-- Vyberte krajinu --</option>
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="other">Iná krajina (zadať vlastnú)...</option>
              </select>

              {(country === 'other' || (!POPULAR_COUNTRIES.includes(country) && country !== '')) && (
                <input
                  type="text"
                  placeholder="Názov krajiny alebo destinácie..."
                  value={country === 'other' ? customCountry : country}
                  onChange={(e) => {
                    if (country === 'other') setCustomCountry(e.target.value);
                    else setCountry(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-xl text-xs"
                />
              )}
            </div>
          )}

          {/* 7. DÁTUM */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dátum výdavku
              </label>
              <div className="flex gap-1.5">
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

          {/* 8. KOMENTÁR / POZNÁMKA */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Komentár k tomu (voliteľné)
            </label>
            <textarea
              rows={2}
              placeholder="Poznámka napr. Kúpené v OBI Ružinov, faktúra odložená..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
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
                  <span>Pridať výdavok do projektu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
