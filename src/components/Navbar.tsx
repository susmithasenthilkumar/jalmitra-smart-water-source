import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  ShieldCheck, 
  User, 
  Bell, 
  Play, 
  Pause, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  LogIn, 
  Languages, 
  Radio, 
  Sparkles,
  ChevronDown,
  Shield,
  Smartphone,
  MapPin
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { dataService } from '../services/dataService';
import { getTranslation } from '../i18n/translations';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigate: (viewId: string) => void;
  tamilEnabled: boolean;
  onToggleTamil: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  onOpenLogin,
  onLogout,
  onNavigate,
  tamilEnabled,
  onToggleTamil
}) => {
  const lang = tamilEnabled ? 'ta' : 'en';
  const t = (k: any) => getTranslation(k, lang);

  const [time, setTime] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeAlertCount, setActiveAlertCount] = useState<number>(0);
  const [faultDropdownOpen, setFaultDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncAlerts = () => {
      const criticalCount = dataService.alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'CRITICAL').length;
      setActiveAlertCount(criticalCount);
      setIsSimulating(dataService.isSimulating());
    };
    syncAlerts();
    return dataService.subscribe(syncAlerts);
  }, []);

  const handleToggleSim = () => {
    dataService.toggleSimulation();
    setIsSimulating(dataService.isSimulating());
  };

  const handleFaultSelect = (type: 'LEAK' | 'SENSOR_DIRT' | 'PUMP_TRIP' | 'NORMAL') => {
    dataService.injectFault(type);
    setFaultDropdownOpen(false);
  };

  const isVillager = currentRole === 'villager' || currentRole === 'public';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => onNavigate(isVillager ? 'citizen_portal' : 'dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-800 via-teal-800 to-blue-900 bg-clip-text text-transparent">
                  {t('appName')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {t('panchayatLabel')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block truncate max-w-sm">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center Tools: Live IoT Pulse & Simulation Control (Visible for Officials) */}
          {!isVillager && (
            <div className="hidden lg:flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-ping" />
                <span className="text-emerald-700 font-semibold">{t('esp32Live')}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">{time}</span>
              </div>

              <button
                onClick={handleToggleSim}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSimulating 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
                title={t('pauseTelemetry')}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? t('streamRunning') : t('streamPaused')}</span>
              </button>

              {/* Demo Fault Injection Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFaultDropdownOpen(!faultDropdownOpen)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{t('injectScenario')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {faultDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t('demoScenarios')}
                    </div>
                    <button
                      onClick={() => handleFaultSelect('LEAK')}
                      className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t('simulatePipeLeak')}</span>
                    </button>
                    <button
                      onClick={() => handleFaultSelect('SENSOR_DIRT')}
                      className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('simulateSensorFouling')}</span>
                    </button>
                    <button
                      onClick={() => handleFaultSelect('PUMP_TRIP')}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center space-x-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t('simulatePumpOverload')}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => handleFaultSelect('NORMAL')}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('resetNormalBaseline')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Controls: Language Switcher, Alerts, Active User & Login */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Global Language Toggle Button */}
            <button
              type="button"
              onClick={onToggleTamil}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                tamilEnabled 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              title={tamilEnabled ? t('switchLanguage') : 'முழுவதையும் தமிழில் மாற்றுக'}
            >
              <Languages className="w-4 h-4" />
              <span>{tamilEnabled ? 'தமிழ் (TA)' : 'English (EN)'}</span>
            </button>

            {/* Smart Alerts & Notifications Icon (For all users) */}
            <button
              onClick={() => onNavigate('alerts')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={tamilEnabled ? 'அறிவிப்புகள் & எச்சரிக்கைகள்' : 'Notifications & System Alerts'}
            >
              <Bell className="w-5 h-5" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Active User Badge / Switcher */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 transition-all">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center space-x-2 px-2 py-0.5 text-left cursor-pointer"
                  title={t('switchUser')}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                    currentUser.role === 'admin' ? 'bg-blue-700' :
                    currentUser.role === 'supervisor' ? 'bg-teal-700' : 'bg-cyan-700'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block leading-tight max-w-[130px] truncate">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {currentUser.role === 'villager'
                        ? (currentUser.wardName || t('villager'))
                        : tamilEnabled
                          ? ({
                              'Panchayat Executive Officer': 'ஊராட்சி செயல் அலுவலர்',
                              'Assistant Executive Engineer': 'உதவி செயற்பொறியாளர்',
                              'Technical Water Supervisor': 'தொழில்நுட்ப குடிநீர் மேற்பார்வையாளர்'
                            } as Record<string, string>)[currentUser.designation || ''] || (currentUser.role === 'admin' ? t('roleAdmin') : t('roleSupervisor'))
                          : (currentUser.designation || currentUser.role)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title={t('logoutBtn')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-800 hover:to-blue-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('authPortalTitle')}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
