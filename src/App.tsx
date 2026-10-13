import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';

// Views
import { VillagerPortal } from './views/VillagerPortal';
import { DashboardView } from './views/DashboardView';
import { IoTMonitoringView } from './views/IoTMonitoringView';
import { AiAnalysisView } from './views/AiAnalysisView';
import { FaultVerificationView } from './views/FaultVerificationView';
import { SelfMaintainingSensorView } from './views/SelfMaintainingSensorView';
import { ComplaintsView } from './views/ComplaintsView';
import { ScheduleView } from './views/ScheduleView';
import { MaintenanceView } from './views/MaintenanceView';
import { AlertsView } from './views/AlertsView';
import { VillagesView } from './views/VillagesView';
import { TanksView } from './views/TanksView';
import { PumpsView } from './views/PumpsView';
import { SensorsView } from './views/SensorsView';
import { ReportsView } from './views/ReportsView';
import { ArchitectureView } from './views/ArchitectureView';
import { SparkAnalyticsView } from './views/SparkAnalyticsView';

import { dataService } from './services/dataService';
import { UserRole, UserProfile } from './types';

const LANG_STORAGE_KEY = 'jalmitra_language_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => dataService.getCurrentUser());
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const user = dataService.getCurrentUser();
    return user ? user.role : 'villager';
  });
  
  const [currentView, setCurrentView] = useState<string>(() => {
    const user = dataService.getCurrentUser();
    return user && user.role !== 'villager' ? 'dashboard' : 'citizen_portal';
  });

  const [tamilEnabled, setTamilEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      return stored === 'ta';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync language to localStorage
  const handleToggleTamil = () => {
    setTamilEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next ? 'ta' : 'en');
      } catch (e) {
        console.warn('Could not save language to storage', e);
      }
      return next;
    });
  };

  useEffect(() => {
    const sync = () => {
      const user = dataService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setCurrentRole(user.role);
      }
    };
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'villager' || role === 'public') {
      setCurrentView('citizen_portal');
    } else if (currentView === 'citizen_portal') {
      setCurrentView('dashboard');
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'villager') {
      setCurrentView('citizen_portal');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    dataService.logout();
    setCurrentUser(null);
    setCurrentRole('villager');
    setCurrentView('citizen_portal');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
        tamilEnabled={tamilEnabled}
        onToggleTamil={handleToggleTamil}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Navigation - only rendered for admin and supervisor */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          currentRole={currentRole}
          tamilEnabled={tamilEnabled}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {currentView === 'citizen_portal' && (
            <VillagerPortal
              currentUser={currentUser}
              tamilEnabled={tamilEnabled}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              currentRole={currentRole}
              onNavigate={setCurrentView}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'iot_monitoring' && (
            <IoTMonitoringView
              onNavigate={setCurrentView}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'ai_analysis' && (
            <AiAnalysisView
              tamilEnabled={tamilEnabled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'fault_verification' && (
            <FaultVerificationView
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'self_maintenance' && (
            <SelfMaintainingSensorView
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'complaints' && (
            <ComplaintsView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'schedule' && (
            <ScheduleView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'maintenance' && (
            <MaintenanceView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
            />
          )}

          {(currentView === 'alerts' || currentView === 'notifications') && (
            <AlertsView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'villages' && (
            <VillagesView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'tanks' && (
            <TanksView
              tamilEnabled={tamilEnabled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'pumps' && (
            <PumpsView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'sensors' && (
            <SensorsView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              currentRole={currentRole}
              tamilEnabled={tamilEnabled}
            />
          )}

          {currentView === 'architecture' && (
            <ArchitectureView tamilEnabled={tamilEnabled} />
          )}

          {currentView === 'spark_analytics' && (
            <SparkAnalyticsView tamilEnabled={tamilEnabled} />
          )}

        </main>
      </div>

      {/* Unified Bilingual Authentication Portal Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        tamilEnabled={tamilEnabled}
        onToggleTamil={handleToggleTamil}
      />

    </div>
  );
}
