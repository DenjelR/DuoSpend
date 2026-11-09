import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Tags,
  Cloud,
  Rocket,
  Smartphone,
  Moon,
  Sun,
  Download,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Heart,
  History,
  Lock,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SAMPLE_EXPENSES, DEFAULT_CATEGORIES, DEFAULT_PROFILES } from '../lib/defaultData';

interface SettingsTabProps {
  onOpenProfilesModal: () => void;
  onOpenCategoriesModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenVercelModal: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onOpenProfilesModal,
  onOpenCategoriesModal,
  onOpenSupabaseModal,
  onOpenVercelModal,
}) => {
  const {
    currentUser,
    otherUser,
    profiles,
    categories,
    expenses,
    settlements,
    isDarkMode,
    toggleDarkMode,
    supabaseStatus,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSInstallHelp, setShowIOSInstallHelp] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      profiles,
      categories,
      expenses,
      settlements,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duospend_zaloha_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to sample initial data
  const handleResetDemo = () => {
    if (confirm('Naozaj chcete obnoviť ukážkové dáta aplikácie?')) {
      localStorage.setItem('duospend_expenses', JSON.stringify(SAMPLE_EXPENSES));
      localStorage.setItem('duospend_categories', JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem('duospend_profiles', JSON.stringify(DEFAULT_PROFILES));
      localStorage.setItem('duospend_settlements', JSON.stringify([]));
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. Header Profile Hero Banner */}
      <div className="bg-gradient-to-br from-sky-500/10 via-rose-500/10 to-transparent dark:from-sky-950/20 dark:via-rose-950/20 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: profiles[0].avatarColor + '20', color: profiles[0].avatarColor }}
            >
              {profiles[0].emoji}
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: profiles[1].avatarColor + '20', color: profiles[1].avatarColor }}
            >
              {profiles[1].emoji}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {profiles[0].name} & {profiles[1].name}
              </h2>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spoločný rozpočet a párové financie
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProfilesModal}
          className="text-xs font-bold px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95"
        >
          Upraviť
        </button>
      </div>

      {/* 2. Primary Configuration Group */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Správa kategórií */}
        <button
          onClick={onOpenCategoriesModal}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Správa kategórií a podkategórií
              </h3>
              <p className="text-[11px] text-slate-400">
                {categories.length} kategórií (Domácnosť, Výlet, Spoločné výdavky...)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Supabase Real-time Sync */}
        <button
          onClick={onOpenSupabaseModal}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                supabaseStatus.isConfigured
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Supabase Real-time synchronizácia
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    supabaseStatus.isConfigured
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {supabaseStatus.isConfigured ? 'Pripojené' : 'Lokálny režim'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kľúče, SQL tabuľky a okamžitá synchronizácia medzi mobilmi
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Vercel Deployment Guide */}
        <button
          onClick={onOpenVercelModal}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Návod na nasadenie na Vercel
              </h3>
              <p className="text-[11px] text-slate-400">
                Ako nastaviť Environment Variables a spustiť build
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Dark Mode Switch */}
        <div className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Tmavý režim (Dark Mode)
              </h3>
              <p className="text-[11px] text-slate-400">
                Optimalizované pre OLED displeje iPhone
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
              isDarkMode ? 'bg-sky-600' : 'bg-slate-300'
            }`}
            aria-label="Prepnúť režim"
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                isDarkMode ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. PWA Installation Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Inštalácia aplikácie (PWA)
              </h3>
              <p className="text-[11px] text-slate-400">
                Pridajte appku priamo na plochu iPhonu / Androidu
              </p>
            </div>
          </div>

          {isInstalled && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Nainštalované
            </span>
          )}
        </div>

        {isInstallable && (
          <button
            onClick={install}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Nainštalovať aplikáciu
          </button>
        )}

        <button
          onClick={() => setShowIOSInstallHelp(true)}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
        >
          📱 Návod pre iPhone (Safari &rarr; Pridať na plochu)
        </button>

        {showIOSInstallHelp && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>Postup na iPhone:</span>
              <button
                onClick={() => setShowIOSInstallHelp(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Zavrieť
              </button>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>Otvorte túto stránku v prehliadači <strong>Safari</strong> na iPhone.</li>
              <li>Ťuknite na ikonu <strong>Zdieľať (Share - štvorec so šípkou hore)</strong>.</li>
              <li>Posuňte sa nižšie a ťuknite na <strong>Pridať na plochu (Add to Home Screen)</strong>.</li>
              <li>Aplikácia sa pridá na vašu plochu s vlastnou ikonou DuoSpend!</li>
            </ol>
          </div>
        )}
      </div>

      {/* 4. Settlement History Preview */}
      {settlements.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Archív vyrovnaní účtov ({settlements.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto no-scrollbar">
            {settlements.map((s) => {
              const fromP = profiles.find((p) => p.id === s.from_user);
              const toP = profiles.find((p) => p.id === s.to_user);
              return (
                <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {fromP?.name} vyrovnal(a) {toP?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{s.date}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {s.amount.toFixed(2)} €
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Data Export & Demo Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Záloha a dáta
        </h3>

        <div className="flex gap-2">
          <button
            onClick={handleExportBackup}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Zálohovať JSON</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            title="Resetovať dáta"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Obnoviť ukážku</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs text-center font-semibold">
            Dáta boli úspešne obnovené!
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-400 pb-2">
        DuoSpend v1.0.0 · Vytvorené s láskou pre páry
      </div>
    </div>
  );
};
