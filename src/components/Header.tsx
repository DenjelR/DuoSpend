import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Cloud, CloudOff, RefreshCw, ChevronDown, Lock, Check } from 'lucide-react';
import { UserId } from '../types';

interface HeaderProps {
  onOpenSupabaseModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSupabaseModal, onOpenProfileModal }) => {
  const {
    currentUser,
    otherUser,
    profiles,
    setCurrentUserId,
    isDarkMode,
    toggleDarkMode,
    supabaseStatus,
    refreshSupabaseSync,
  } = useApp();

  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 pt-safe bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: App Brand & Profile Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all text-left"
            title="Prepnúť používateľa"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: currentUser.avatarColor + '20', color: currentUser.avatarColor }}
            >
              <span>{currentUser.emoji}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Píše výdavok
              </span>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </button>

          {/* Quick Dropdown to switch partner */}
          {showSwitchDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSwitchDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Kto práve používa mobil?
                </div>
                {profiles.map((p) => {
                  const isCurrent = p.id === currentUser.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentUserId(p.id as UserId);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: p.avatarColor + '25', color: p.avatarColor }}
                        >
                          {p.emoji}
                        </div>
                        <span className="text-sm">{p.name}</span>
                        {p.pin && <Lock className="w-3 h-3 text-amber-500 ml-1" />}
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowSwitchDropdown(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-center py-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Upraviť mená a PIN kódy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Title / Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-rose-500 animate-pulse" />
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">
            DuoSpend
          </span>
        </div>

        {/* Right: Supabase Sync Status & Dark Mode */}
        <div className="flex items-center gap-1">
          {/* Supabase status button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-medium ${
              supabaseStatus.isConfigured
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
            title={
              supabaseStatus.isConfigured
                ? `Supabase Realtime: Pripojené (${supabaseStatus.lastSyncTime || 'Teraz'})`
                : 'Lokálny režim (Kliknite pre nastavenie Supabase)'
            }
          >
            {supabaseStatus.isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
            ) : supabaseStatus.isConfigured ? (
              <Cloud className="w-4 h-4" />
            ) : (
              <CloudOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {supabaseStatus.isConfigured ? 'Live Sync' : 'Offline'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
