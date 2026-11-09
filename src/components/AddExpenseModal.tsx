import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Globe, FileText, Check, Plus } from 'lucide-react';
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
    categories,
    addExpense,
    updateExpense,
  } = useApp();

  const [amountStr, setAmountStr] = useState<string>('');
  const [paidBy, setPaidBy] = useState<UserId>(currentUser.id);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [customCountry, setCustomCountry] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (editingExpense) {
      setAmountStr(editingExpense.amount.toString());
      setPaidBy(editingExpense.paid_by);
      setCategoryId(editingExpense.category_id);
      setSubcategory(editingExpense.subcategory);
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
      setNote(editingExpense.note || '');
    } else {
      // Default new expense
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      setAmountStr('');
      setPaidBy(currentUser.id);
      const defaultCat = categories[0]?.id || '';
      setCategoryId(defaultCat);
      setSubcategory(categories[0]?.subcategories[0] || '');
      setCountry('');
      setCustomCountry('');
      setDateStr(`${yyyy}-${mm}-${dd}`);
      setNote('');
    }
    setErrorMessage(null);
  }, [editingExpense, isAddModalOpen, currentUser, categories]);

  if (!isAddModalOpen && !editingExpense) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isTripCategory =
    selectedCategory?.name.toLowerCase().includes('výlet') ||
    selectedCategory?.name.toLowerCase().includes('vylet') ||
    selectedCategory?.name.toLowerCase().includes('trip');

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
      setErrorMessage('Vyberte prosím kategóriu.');
      return;
    }

    const finalCountry = isTripCategory
      ? country === 'other'
        ? customCountry.trim()
        : country
      : undefined;

    setIsSubmitting(true);

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: parsedAmount,
          paid_by: paidBy,
          category_id: categoryId,
          subcategory: subcategory || selectedCategory?.subcategories[0] || 'Všeobecné',
          country: finalCountry || undefined,
          date: dateStr,
          note: note.trim() || undefined,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          paid_by: paidBy,
          category_id: categoryId,
          subcategory: subcategory || selectedCategory?.subcategories[0] || 'Všeobecné',
          country: finalCountry || undefined,
          date: dateStr,
          note: note.trim() || undefined,
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editingExpense ? 'Upraviť výdavok' : 'Nový výdavok'}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 no-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. KTO PLATIL (Segmented switch) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Kto platil?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              {profiles.map((p) => {
                const isSelected = paidBy === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPaidBy(p.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-2'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`}
                    style={isSelected ? { boxShadow: `0 0 0 2px ${p.avatarColor}` } : {}}
                  >
                    <span className="text-base">{p.emoji}</span>
                    <span className="text-sm truncate">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SUMA V EUR */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
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
                className="w-full h-16 px-4 pr-12 text-3xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center tabular-nums transition-all"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                €
              </span>
            </div>

            {/* Quick add denomination buttons */}
            <div className="flex gap-2 mt-2">
              {[5, 10, 20, 50].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAddAmount(val)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg active:scale-95 transition-all"
                >
                  +{val}€
                </button>
              ))}
            </div>
          </div>

          {/* 3. KATEGÓRIA */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Kategória
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. PODKATEGÓRIA */}
          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Podkategória
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedCategory.subcategories.map((sub) => {
                  const isSelected = subcategory === sub;
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. AK JE VÝLET -> KRAJINA / DESTINÁCIA */}
          {isTripCategory && (
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>Krajina / Názov výletu</span>
              </div>

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Vyberte krajinu alebo vlastnú --</option>
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
                  placeholder="Názov krajiny alebo destinácie (napr. Island, Madeira...)"
                  value={country === 'other' ? customCountry : country}
                  onChange={(e) => {
                    if (country === 'other') {
                      setCustomCountry(e.target.value);
                    } else {
                      setCountry(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              )}
            </div>
          )}

          {/* 6. DÁTUM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dátum
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPresetDate(0)}
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline px-1"
                >
                  Dnes
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setPresetDate(1)}
                  className="text-[11px] font-semibold text-slate-500 hover:underline px-1"
                >
                  Včera
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. POZNÁMKA */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Poznámka (voliteľné)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Napr. Večera s vínom, Nákup potravín..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2.5 pr-9 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-sky-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editingExpense ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Uložiť zmeny</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Pridať výdavok</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
