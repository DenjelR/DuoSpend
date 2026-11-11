import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Lock, Unlock, User, Sparkles, Palette, Smile } from 'lucide-react';
import { UserId } from '../types';
import { PROFILE_THEMES, DEFAULT_PROFILES } from '../lib/defaultData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    category: 'Párové a tváre',
    emojis: ['🧔', '👩', '🧑', '👨', '👧', '👑', '🤴', '👸', '💍', '❤️', '💖', '✨'],
  },
  {
    category: 'Zvieratká a maskoti',
    emojis: ['🦁', '🐱', '🦊', '🐶', '🐻', '🐼', '🐨', '🐯', '🐰', '🦄', '🐧', '🦉', '🦋'],
  },
  {
    category: 'Životný štýl a záľuby',
    emojis: ['☕', '🍷', '🥂', '🍕', '🥑', '🍔', '✈️', '🏖️', '🚀', '🎨', '🎮', '🎸', '🚴', '⛺', '🚗'],
  },
  {
    category: 'Šťastie a štýl',
    emojis: ['🌟', '💎', '🌸', '🌺', '⚡', '🕶️', '🧸', '🎁', '⭐', '🍀', '🔥', '🏆'],
  },
];

const COLOR_OPTIONS = [
  '#0284c7', // Sky Blue
  '#e11d48', // Rose Red
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profiles, updateProfile } = useApp();

  const [activeTab, setActiveTab] = useState<UserId>('user_1');

  // Form states for user 1 & user 2
  const targetProfile = profiles.find((p) => p.id === activeTab) || profiles[0];

  const [name, setName] = useState(targetProfile.name);
  const [emoji, setEmoji] = useState(targetProfile.emoji);
  const [avatarColor, setAvatarColor] = useState(targetProfile.avatarColor);
  const [themeId, setThemeId] = useState(targetProfile.themeId || 'ocean');
  const [pin, setPin] = useState(targetProfile.pin || '');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // When switching active tab inside modal, update local inputs
  const switchTarget = (id: UserId) => {
    setActiveTab(id);
    const p = profiles.find((pr) => pr.id === id) || profiles[0] || DEFAULT_PROFILES[0];
    setName(p.name);
    setEmoji(p.emoji);
    setAvatarColor(p.avatarColor);
    setThemeId(p.themeId || (id === 'user_1' ? 'ocean' : 'rose'));
    setPin(p.pin || '');
    setPinError(null);
    setIsSaved(false);
  };

  if (!isOpen) return null;

  const selectedTheme = PROFILE_THEMES.find((t) => t.id === themeId) || PROFILE_THEMES[0];

  const handleSave = async () => {
    // Validate PIN (must be 4 digits or empty)
    if (pin.trim() && !/^\d{4}$/.test(pin.trim())) {
      setPinError('PIN kód musí obsahovať presne 4 číslice (alebo nechajte prázdne).');
      return;
    }
    setPinError(null);

    await updateProfile(activeTab, {
      name: name.trim() || targetProfile.name,
      emoji,
      avatarColor,
      themeId,
      themeGradient: selectedTheme.gradient,
      pin: pin.trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Profily páru, témy a emotikony
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between the 2 profiles (Danko / Simonka) */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            {profiles.map((p) => {
              const isSelected = p.id === activeTab;
              return (
                <button
                  key={p.id}
                  onClick={() => switchTarget(p.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                  style={isSelected ? { boxShadow: `0 0 0 2px ${p.avatarColor}` } : {}}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar text-xs">
          {/* Live Preview Card */}
          <div
            className={`p-4 rounded-2xl border bg-gradient-to-br ${selectedTheme.gradient} ${selectedTheme.borderClass} shadow-xs flex items-center gap-3.5 transition-all`}
          >
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-md ring-2 ring-white dark:ring-slate-900 shrink-0"
              style={{ backgroundColor: `${avatarColor}25`, color: avatarColor }}
            >
              {emoji}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ukážka profilovej karty
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {name || 'Meno používateľa'}
              </h3>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                Téma: {selectedTheme.name}
              </span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Meno / Prezývka
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Napr. Danko, Simonka..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Variácia pozadia a témy v profile */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-500" />
              <span>Variácia pozadia a téma profilu</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROFILE_THEMES.map((theme) => {
                const isSelected = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setThemeId(theme.id);
                      setAvatarColor(theme.accentColor);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all bg-gradient-to-r ${theme.gradient} ${
                      isSelected
                        ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="text-xs text-slate-900 dark:text-white truncate">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rozšírený výber emotikonov s kategóriami */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Výber emotikonu (Viac ako 50 emotikonov)</span>
            </label>
            <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {cat.category}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {cat.emojis.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform ${
                          emoji === em
                            ? 'bg-white dark:bg-slate-700 scale-125 ring-2 ring-sky-500 shadow-xs'
                            : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farba profilu */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              Vlastná farba ikony
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-6.5 h-6.5 rounded-full transition-transform ${
                    avatarColor === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : ''
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
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setPinError(null);
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            {pinError && (
              <p className="text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                {pinError}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Uložené!</span>
                </>
              ) : (
                <span>Uložiť profil a tému</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
