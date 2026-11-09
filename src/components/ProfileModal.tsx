import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Lock, Unlock, User, Sparkles } from 'lucide-react';
import { UserId } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['🧔', '👩', '🧑', '👨', '👧', '🦁', '🦊', '🐱', '🐼', '🐨', '🚀', '☕'];
const COLOR_OPTIONS = ['#0284c7', '#e11d48', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profiles, updateProfile } = useApp();

  const [activeTab, setActiveTab] = useState<UserId>('user_1');

  // Form states for user 1 & user 2
  const targetProfile = profiles.find((p) => p.id === activeTab) || profiles[0];

  const [name, setName] = useState(targetProfile.name);
  const [emoji, setEmoji] = useState(targetProfile.emoji);
  const [avatarColor, setAvatarColor] = useState(targetProfile.avatarColor);
  const [pin, setPin] = useState(targetProfile.pin || '');
  const [isSaved, setIsSaved] = useState(false);

  // When switching active tab inside modal, update local inputs
  const switchTarget = (id: UserId) => {
    setActiveTab(id);
    const p = profiles.find((pr) => pr.id === id) || profiles[0];
    setName(p.name);
    setEmoji(p.emoji);
    setAvatarColor(p.avatarColor);
    setPin(p.pin || '');
    setIsSaved(false);
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    // Validate PIN (must be 4 digits or empty)
    if (pin.trim() && !/^\d{4}$/.test(pin.trim())) {
      alert('PIN kód musí obsahovať presne 4 číslice (alebo nechajte prázdne pre vypnutie PIN).');
      return;
    }

    await updateProfile(activeTab, {
      name: name.trim() || targetProfile.name,
      emoji,
      avatarColor,
      pin: pin.trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Profily páru a PIN kód
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between the 2 profiles */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            {profiles.map((p) => {
              const isSelected = p.id === activeTab;
              return (
                <button
                  key={p.id}
                  onClick={() => switchTarget(p.id)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <span className="text-sm">{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar text-xs">
          {/* Name */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
              Meno / Prezývka
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Napr. Michal, Zuzka..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Emoji Avatar */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
              Emoji ikona
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    emoji === em
                      ? 'bg-sky-100 dark:bg-sky-950 scale-110 ring-2 ring-sky-500'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color accent */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
              Farba profilu
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    avatarColor === c ? 'scale-125 ring-2 ring-white dark:ring-slate-900' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Optional 4-digit PIN code */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Voliteľný 4-miestny PIN kód</span>
              </div>
              {pin ? (
                <span className="text-[10px] text-emerald-600 font-semibold">Aktívny</span>
              ) : (
                <span className="text-[10px] text-slate-400">Vypnutý</span>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Ak zadáte 4-miestny kód, pri prepnutí na tento profil bude vyžadované jeho zadanie. Ak nechcete kód, nechajte pole prázdne.
            </p>

            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="•••• (4 číslice)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Uložené!</span>
                </>
              ) : (
                <span>Uložiť zmeny profilu</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
