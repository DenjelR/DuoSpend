import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { TransactionsTab } from './components/TransactionsTab';
import { TripsTab } from './components/TripsTab';
import { SettingsTab } from './components/SettingsTab';
import { AddExpenseModal } from './components/AddExpenseModal';
import { CategoriesModal } from './components/CategoriesModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ProfileModal } from './components/ProfileModal';
import { VercelGuideModal } from './components/VercelGuideModal';
import { PinLockScreen } from './components/PinLockScreen';

const MainApp: React.FC = () => {
  const { activeTab, isPinLocked } = useApp();

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      {/* 4-digit PIN lock screen if locked */}
      {isPinLocked && <PinLockScreen />}

      {/* Top iOS Header */}
      <Header
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-3 pb-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'trips' && <TripsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            onOpenProfilesModal={() => setIsProfileModalOpen(true)}
            onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onOpenVercelModal={() => setIsVercelModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <AddExpenseModal />

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <VercelGuideModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      {/* Bottom iOS Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
