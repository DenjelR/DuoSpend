import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Sparkles, Check, Globe } from 'lucide-react';
import { EventType } from '../types';
import { POPULAR_COUNTRIES } from '../lib/defaultData';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_EMOJIS = ['🔨', '✈️', '🍷', '🛋️', '🏖️', '🏠', '☕', '🚗', '⛺', '🎿', '🚢', '🎨', '🎁', '🍕'];
const EVENT_COLORS = ['#0ea5e9', '#f59e0b', '#e11d48', '#10b981', '#8b5cf6', '#f97316', '#06b6d4'];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { addEvent, setSelectedEventId } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('trip');
  const [emoji, setEmoji] = useState('✈️');
  const [color, setColor] = useState('#f59e0b');
  const [destination, setDestination] = useState('');
  const [budgetStr, setBudgetStr] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTypeSelect = (newType: EventType) => {
    setType(newType);
    if (newType === 'trip') {
      setEmoji('✈️');
      setColor('#f59e0b');
    } else if (newType === 'renovation') {
      setEmoji('🔨');
      setColor('#0ea5e9');
    } else if (newType === 'dates') {
      setEmoji('🍷');
      setColor('#e11d48');
    } else {
      setEmoji('⭐');
      setColor('#8b5cf6');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await addEvent({
        name: name.trim(),
        type,
        emoji,
        color,
        destination: type === 'trip' ? destination.trim() || undefined : undefined,
        target_budget: budgetStr ? parseFloat(budgetStr) : undefined,
        description: description.trim() || undefined,
      });

      setSelectedEventId(created.id);
      onClose();
      // Reset
      setName('');
      setBudgetStr('');
      setDescription('');
      setDestination('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Vytvoriť nový projekt / event
            </h2>
            <p className="text-xs text-slate-400">
              Pridajte nový výlet, prerábku bytu alebo spoločnú aktivitu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto no-scrollbar text-xs">
          {/* Typ eventu */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
              Typ projektu
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('trip')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  type === 'trip'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg block mb-0.5">✈️</span>
                <span>Výlet / Cesta</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('renovation')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  type === 'renovation'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg block mb-0.5">🔨</span>
                <span>Prerábka bytu</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('dates')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  type === 'dates'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg block mb-0.5">🍷</span>
                <span>Rande & Zážitky</span>
              </button>
            </div>
          </div>

          {/* Názov */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
              Názov eventu *
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'trip'
                  ? 'Napr. Výlet do Ríma, Madeira 2026...'
                  : type === 'renovation'
                  ? 'Napr. Rekonštrukcia kúpeľne, Kuchynská linka...'
                  : 'Napr. Víkendové večere, Oslava výročia...'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Destination for trips */}
          {type === 'trip' && (
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                Krajina / Destinácia
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Napr. Taliansko, Japonsko, Španielsko..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Emoji & Farba */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                Emoji ikona
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {EVENT_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform ${
                      emoji === em
                        ? 'bg-slate-200 dark:bg-slate-700 scale-110 ring-2 ring-sky-500'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                Farba
              </label>
              <div className="flex gap-2 flex-wrap pt-1">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white dark:ring-slate-900' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rozpočet */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
              Orientačný rozpočet v € (voliteľné)
            </label>
            <input
              type="number"
              placeholder="Napr. 1500"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white tabular-nums"
            />
          </div>

          {/* Popis */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
              Poznámka / Popis (voliteľné)
            </label>
            <textarea
              rows={2}
              placeholder="Poznámka o tomto projekte..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Vytvoriť a otvoriť projekt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
