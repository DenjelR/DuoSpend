import React from 'react';
import { useApp } from '../context/AppContext';
import { FolderOpen, Archive, Plus, PieChart, Tags } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC<{ onOpenCategoriesModal: () => void }> = ({ onOpenCategoriesModal }) => {
  const { activeTab, setActiveTab, setIsAddModalOpen, openEvents, closedEvents } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-slate-950/92 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Tab 1: Otvorené položky a eventy */}
        <button
          onClick={() => setActiveTab('open_events')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'open_events'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <FolderOpen className="w-5 h-5" />
            {activeTab === 'open_events' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Otvorené</span>
        </button>

        {/* Tab 2: Uzavreté eventy a archív */}
        <button
          onClick={() => setActiveTab('closed_events')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'closed_events'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Archive className="w-5 h-5" />
            {activeTab === 'closed_events' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Uzavreté</span>
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

        {/* Tab 4: Štatistiky a analytika */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            activeTab === 'analytics'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <PieChart className="w-5 h-5" />
            {activeTab === 'analytics' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 dark:bg-sky-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Štatistiky</span>
        </button>

        {/* Tab 5: Kategórie */}
        <button
          onClick={onOpenCategoriesModal}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <Tags className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Kategórie</span>
        </button>
      </div>
    </nav>
  );
};
