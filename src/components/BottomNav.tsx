import React from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, ReceiptText, Plus, Tags, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC<{ onOpenCategoriesModal: () => void }> = ({ onOpenCategoriesModal }) => {
  const { activeTab, setActiveTab, setIsAddModalOpen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Tab 1: Eventy & Prehľad */}
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'events'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <FolderKanban className="w-5 h-5" />
            {activeTab === 'events' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Prehľad eventov</span>
        </button>

        {/* Tab 2: Výdavky (Zoznam) */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'transactions'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ReceiptText className="w-5 h-5" />
            {activeTab === 'transactions' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Zoznam výdavkov</span>
        </button>

        {/* Center Floating (+) Add Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-90 transition-all border-4 border-slate-100 dark:border-slate-950"
            aria-label="Pridať nový výdavok"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Kategórie */}
        <button
          onClick={onOpenCategoriesModal}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <Tags className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Kategórie</span>
        </button>

        {/* Tab 5: Nastavenia */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'settings'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Settings className="w-5 h-5" />
            {activeTab === 'settings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Nastavenia</span>
        </button>
      </div>
    </nav>
  );
};
