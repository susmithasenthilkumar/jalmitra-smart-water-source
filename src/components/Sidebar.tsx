import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  Database, 
  Cpu, 
  Sliders, 
  BrainCircuit, 
  GitCompare, 
  Sparkles, 
  MessageSquareWarning, 
  CalendarClock, 
  Wrench, 
  AlertOctagon, 
  FileBarChart2, 
  Code2, 
  ChevronRight,
  ShieldCheck,
  Smartphone
  ,BarChart3
} from 'lucide-react';
import { UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentRole,
  tamilEnabled
}) => {
  const lang = tamilEnabled ? 'ta' : 'en';
  const t = (k: any) => getTranslation(k, lang);

  // If user is a Villager, the portal is self-contained without administrative sidebar
  if (currentRole === 'villager' || currentRole === 'public') {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'villages',
      label: t('navVillages'),
      icon: MapPin,
      badge: '6'
    },
    {
      id: 'iot_monitoring',
      label: t('navIot'),
      icon: Activity,
      badge: 'Live'
    },
    {
      id: 'tanks',
      label: t('navTanks'),
      icon: Database,
      badge: '7'
    },
    {
      id: 'pumps',
      label: t('navPumps'),
      icon: Cpu,
      badge: '7'
    },
    {
      id: 'sensors',
      label: t('navSensors'),
      icon: Sliders,
      badge: null
    },
    {
      id: 'ai_analysis',
      label: t('navAi'),
      icon: BrainCircuit,
      badge: 'Adaptive'
    },
    {
      id: 'fault_verification',
      label: t('navFaultVerification'),
      icon: GitCompare,
      badge: 'Matrix'
    },
    {
      id: 'self_maintenance',
      label: t('navSelfMaintenance'),
      icon: Sparkles,
      badge: 'Actuator'
    },
    {
      id: 'complaints',
      label: t('navComplaints'),
      icon: MessageSquareWarning,
      badge: 'Action'
    },
    {
      id: 'schedule',
      label: t('navSchedules'),
      icon: CalendarClock,
      badge: null
    },
    {
      id: 'maintenance',
      label: t('navMaintenance'),
      icon: Wrench,
      badge: '4'
    },
    {
      id: 'alerts',
      label: t('navAlerts'),
      icon: AlertOctagon,
      badge: 'Alert'
    },
    {
      id: 'reports',
      label: t('navReports'),
      icon: FileBarChart2,
      badge: 'CSV'
    },
    {
      id: 'architecture',
      label: t('navArchitecture'),
      icon: Code2,
      badge: 'Tech'
    },
    {
      id: 'spark_analytics',
      label: t('navSparkAnalytics'),
      icon: BarChart3,
      badge: 'Spark'
    }
  ];

  const localizeBadge = (badge: string | null) => {
    if (!tamilEnabled || !badge) return badge;
    return ({
      Live: 'நேரடி',
      Adaptive: 'தகவமைப்பு',
      Matrix: 'அணி',
      Actuator: 'இயக்கி',
      Action: 'நடவடிக்கை',
      Alert: 'எச்சரிக்கை',
      CSV: 'CSV',
      Tech: 'தொழில்நுட்பம்'
    } as Record<string, string>)[badge] || badge;
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="p-4 space-y-1">
        
        {/* Role Header Indicator */}
        <div className="px-3 py-2 mb-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-black text-blue-950 uppercase tracking-wide">
              {currentRole === 'admin' ? t('roleAdmin') : t('roleSupervisor')}
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
            {tamilEnabled ? 'அனைத்து கிராமங்கள்' : 'All Villages'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}>
                    {localizeBadge(item.badge)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Switch to Villager View Link */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => onNavigate('citizen_portal')}
          className="w-full py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-cyan-700" />
          <span>{tamilEnabled ? 'கிராம மக்கள் போர்டல்' : 'Open Villager Portal'}</span>
        </button>
      </div>
    </aside>
  );
};
