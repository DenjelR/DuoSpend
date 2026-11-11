import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import {
  SUPABASE_SQL_SETUP,
  getSupabaseCredentials,
  testSupabaseConnection,
  isValidHttpUrl,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { supabaseStatus, refreshSupabaseSync } = useApp();

  const creds = getSupabaseCredentials();
  const [customUrl, setCustomUrl] = useState(creds.url);
  const [customKey, setCustomKey] = useState(creds.anonKey);
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveCustom = async () => {
    let trimmedUrl = customUrl.trim();
    const trimmedKey = customKey.trim();

    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl;
      setCustomUrl(trimmedUrl);
    }

    if (trimmedUrl && trimmedKey) {
      if (!isValidHttpUrl(trimmedUrl)) {
        setTestResult({ success: false, message: 'URL adresa musí začínať s https:// (napr. https://vas-projekt.supabase.co).' });
        return;
      }
      localStorage.setItem(
        'duospend_supabase_custom_config',
        JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey })
      );
      setTestResult({ success: true, message: 'Nastavenia uložené! Prebieha pripojenie...' });
    } else {
      localStorage.removeItem('duospend_supabase_custom_config');
      setTestResult({ success: true, message: 'Nastavenia vymazané. Aplikácia pokračuje v lokálnom / serverovom režime.' });
    }
    await refreshSupabaseSync();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    let trimmedUrl = customUrl.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl;
      setCustomUrl(trimmedUrl);
    }
    const res = await testSupabaseConnection(trimmedUrl, customKey.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase Real-time Synchronizácia
              </h2>
              <span className="text-xs text-slate-400">
                Živé prepojenie medzi vašimi dvoma mobilmi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 no-scrollbar text-xs">
          {/* Status Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              supabaseStatus.isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {supabaseStatus.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {supabaseStatus.isConfigured
                  ? 'Supabase je aktívne pripojené!'
                  : 'Aktuálne beží v offline / lokálnom režime'}
              </h4>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                {supabaseStatus.isConfigured
                  ? `Zmeny sa okamžite synchronizujú v reálnom čase na oba telefóny. Posledná synchronizácia: ${
                      supabaseStatus.lastSyncTime || 'teraz'
                    }.`
                  : 'Aplikácia bezchybne funguje a ukladá dáta do pamäte prehliadača. Pre synchronizáciu s partnerom stačí zadať vaše Supabase API kľúče.'}
              </p>
            </div>
          </div>

          {/* Direct credentials input */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Supabase API Kľúče
            </span>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl transition-colors"
              >
                {isTesting ? 'Testujem...' : 'Otestovať pripojenie'}
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Uložiť a aktivovať
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* 1-Click SQL Script Copy */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Server className="w-4 h-4 text-sky-600" />
                <span>SQL Skript pre Supabase</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-xs transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Skopírované!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopírovať SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Tento skript automaticky vytvorí tabuľky <code>expenses</code>, <code>categories</code>, <code>settlements</code> a zapne Realtime synchronizáciu. Stačí ho vložiť v Supabase do záložky <strong>SQL Editor</strong> a kliknúť <strong>Run</strong>.
            </p>

            <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[10px] max-h-32 overflow-y-auto no-scrollbar">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
