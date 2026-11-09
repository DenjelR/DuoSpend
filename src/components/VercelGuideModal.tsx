import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Terminal, Globe, Rocket } from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSample = `VITE_SUPABASE_URL=https://vas-projekt.supabase.co\nVITE_SUPABASE_ANON_KEY=vas-anon-public-kľúč`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Návod na nasadenie na Vercel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs no-scrollbar text-slate-600 dark:text-slate-300">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-indigo-950 dark:text-indigo-200 leading-relaxed">
            Táto aplikácia je postavená na <strong>Vite + React + Tailwind CSS</strong>, čo znamená 100% natívnu kompatibilitu s Vercelom, okamžitý build a bleskové globálne načítanie.
          </div>

          {/* Krok 1: Supabase Environment Variables */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Nastavenie premenných prostredia (.env)</span>
            </h3>
            <p className="leading-relaxed">
              V dashboarde Vercelu (<strong>Project Settings &rarr; Environment Variables</strong>) alebo lokálne v súbore <code>.env</code> pridajte tieto 2 kľúče zo Supabase:
            </p>

            <div className="relative">
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
                {envSample}
              </pre>
              <button
                onClick={() => copyText(envSample, 'env')}
                className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'env' ? 'Skopírované' : 'Kopírovať'}</span>
              </button>
            </div>
          </div>

          {/* Krok 2: Build nastavenia vo Vercel */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Build & Výstupné nastavenia vo Vercel</span>
            </h3>
            <p className="leading-relaxed">
              Vercel automaticky rozpozná Vite. Pre istotu overte tieto hodnoty:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
              <li><strong>Framework Preset:</strong> Vite</li>
              <li><strong>Build Command:</strong> <code>npm run build</code></li>
              <li><strong>Output Directory:</strong> <code>dist</code></li>
              <li><strong>Install Command:</strong> <code>npm install</code></li>
            </ul>
          </div>

          {/* Krok 3: Nasadenie cez Git alebo CLI */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Spustenie nasadenia</span>
            </h3>
            <p className="leading-relaxed">
              Prepojte svoj GitHub repozitár priamo vo <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">Vercel Dashboarde</a>, alebo spustite cez terminál:
            </p>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px]">
              npm i -g vercel{"\n"}vercel deploy --prod
            </pre>
          </div>

          {/* Krok 4: Inštalácia na iPhone */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white">
              📱 Ako pridať appku na domovskú obrazovku iPhonu:
            </h4>
            <ol className="list-decimal pl-5 space-y-1 text-[11px]">
              <li>Otvorte nasadenú stránku v <strong>Safari</strong> na iPhone.</li>
              <li>Ťuknite na ikonu <strong>Zdieľať (Share)</strong> v dolnej lište Safari.</li>
              <li>Zvoľte <strong>Pridať na plochu (Add to Home Screen)</strong>.</li>
              <li>Hotovo! Appka sa spustí na celú obrazovku bez lišty prehliadača ako natívna iOS aplikácia.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
