import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Bell, 
  Check, 
  Zap,
  RotateCw,
  XCircle,
  MessageSquareWarning,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { AlertItem, UserRole } from '../types';

interface AlertsViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
  onNavigate: (viewId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentRole,
  tamilEnabled,
  onNavigate
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => dataService.alerts || []);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ESCALATION' | 'LEAK_PRESSURE' | 'SENSOR'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  useEffect(() => {
    // Check and escalate any complaints over 5 days
    dataService.checkAndEscalateComplaints();
    const sync = () => setAlerts([...dataService.alerts]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleAcknowledge = (id: string) => {
    dataService.acknowledgeAlert(id);
  };

  const handleResolve = (id: string) => {
    dataService.resolveAlert(id);
  };

  const handleExecuteAdaptiveAction = (alert: AlertItem) => {
    if (alert.alertType === 'SUPERVISOR_ESCALATION') {
      onNavigate('complaints');
    } else if (alert.alertType === 'SENSOR_CONTAMINATION' || alert.alertType === 'SENSOR_FAULT') {
      onNavigate('self_maintenance');
    } else if (alert.alertType === 'PUMP_FAILURE') {
      onNavigate('pumps');
    } else {
      dataService.acknowledgeAlert(alert.id);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    // Category filter
    if (selectedCategory === 'ESCALATION') {
      if (a.alertType !== 'SUPERVISOR_ESCALATION') return false;
    } else if (selectedCategory === 'LEAK_PRESSURE') {
      if (a.alertType !== 'LEAKAGE' && a.alertType !== 'LOW_PRESSURE' && a.alertType !== 'HIGH_PRESSURE') return false;
    } else if (selectedCategory === 'SENSOR') {
      if (a.alertType !== 'SENSOR_CONTAMINATION' && a.alertType !== 'SENSOR_FAULT') return false;
    }

    // Severity filter
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) {
      return false;
    }

    return true;
  });

  const escalationAlertsCount = alerts.filter(a => a.alertType === 'SUPERVISOR_ESCALATION' && a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  const isVillager = currentRole === 'villager' || currentRole === 'public';
  const severityLabel = (severity: string) => tamilEnabled
    ? ({ ALL: 'அனைத்தும்', INFO: 'தகவல்', WARNING: 'எச்சரிக்கை', CRITICAL: 'மிகத் தீவிரம்' }[severity] || severity)
    : severity;
  const alertTitle = (alert: AlertItem) => {
    if (!tamilEnabled) return alert.title;
    const references = alert.title.match(/\b[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b/g) || [];
    if (alert.alertType === 'SUPERVISOR_ESCALATION') {
      const overdueDays = alert.title.match(/\((\d+) Days Overdue\)/i)?.[1];
      return `⚠️ மேற்பார்வையாளர் உயர்த்தல்: தீர்க்கப்படாத புகார் #${alert.complaintId || alert.title.match(/JAL-\d+-\d+/)?.[0] || ''}${overdueDays ? ` (${overdueDays} நாட்கள் காலதாமதம்)` : ''}`;
    }
    const translatedTitle = ({
      LEAKAGE: 'குழாய் கசிவு கண்டறியப்பட்டது', LOW_TANK_LEVEL: 'தொட்டியில் நீர்மட்டம் குறைவு',
      HIGH_PRESSURE: 'குழாயில் அதிக அழுத்தம்', LOW_PRESSURE: 'குழாயில் குறைந்த அழுத்தம்',
      PUMP_FAILURE: 'பம்ப் கோளாறு', SENSOR_FAULT: 'சென்சார் கோளாறு',
      SENSOR_CONTAMINATION: 'சென்சார் மாசு / தூய்மையாக்கம் தேவை',
      ABNORMAL_CONSUMPTION: 'வழக்கத்திற்கு மாறான நீர் பயன்பாடு', MAINTENANCE_REQUIRED: 'பராமரிப்பு தேவை'
    }[alert.alertType] || 'நீர் அமைப்பு எச்சரிக்கை');
    return references.length > 0 ? `${translatedTitle} (${references.join(', ')})` : translatedTitle;
  };
  const alertDescription = (alert: AlertItem) => {
    if (!tamilEnabled) return alert.description;
    const translatedDescription = ({
      LEAKAGE: 'நீர் கசிவு கண்டறியப்பட்டுள்ளது. தொடர்புடைய ஓட்டம் மற்றும் அழுத்த அளவுகளைச் சரிபார்க்கவும்.',
      LOW_TANK_LEVEL: 'தொட்டியின் நீர்மட்டம் குறைந்துள்ளது. நீர் சேமிப்பு மற்றும் விநியோகத்தைச் சரிபார்க்கவும்.',
      HIGH_PRESSURE: 'குழாயில் அழுத்தம் அதிகமாக உள்ளது. குழாய் வலைப்பின்னலைச் சரிபார்க்கவும்.',
      LOW_PRESSURE: 'குழாயில் அழுத்தம் குறைவாக உள்ளது. விநியோகப் பாதையைச் சரிபார்க்கவும்.',
      PUMP_FAILURE: 'பம்ப் செயல்பாட்டில் கோளாறு கண்டறியப்பட்டுள்ளது. மின்சார இணைப்பு மற்றும் பம்பைச் சரிபார்க்கவும்.',
      SENSOR_FAULT: 'சென்சார் அளவீட்டில் கோளாறு கண்டறியப்பட்டுள்ளது. சென்சாரைச் சரிபார்க்கவும்.',
      SENSOR_CONTAMINATION: 'சென்சார் நம்பகத்தன்மை குறைந்துள்ளது. தூய்மையாக்கம் அல்லது கள ஆய்வு தேவை.',
      SUPERVISOR_ESCALATION: 'இந்தப் புகார் 5 நாள் SLA-வை மீறியுள்ளது. தொழில்நுட்ப மேற்பார்வையாளர் நடவடிக்கை எடுக்க வேண்டும்.',
      ABNORMAL_CONSUMPTION: 'நீர் பயன்பாடு வழக்கமான அளவிலிருந்து மாறுபட்டுள்ளது. அளவீடுகளைச் சரிபார்க்கவும்.',
      MAINTENANCE_REQUIRED: 'இந்த உபகரணத்திற்கு பராமரிப்பு தேவை.'
    }[alert.alertType] || 'நீர் அமைப்பில் கவனம் தேவை. விவரங்களைச் சரிபார்க்கவும்.');
    const measurements = alert.description.match(/[-+]?\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|LPM|Bar|Amps?|days?|-day|L\b)/gi) || [];
    return measurements.length > 0
      ? `${translatedDescription} பதிவான அளவீடுகள்: ${measurements.join(', ')}.`
      : translatedDescription;
  };
  const alertAction = (alert: AlertItem) => tamilEnabled
    ? ({
        LEAKAGE: 'தொடர்புடைய வால்வை மூடி, கசிவு உள்ள பகுதியை ஆய்வு செய்யவும்.',
        LOW_TANK_LEVEL: 'நீர் விநியோகத்தைக் கட்டுப்படுத்தி அவசர நீர் விநியாட்டை ஏற்பாடு செய்யவும்.',
        HIGH_PRESSURE: 'அழுத்தத்தைக் குறைத்து குழாய் இணைப்புகளை ஆய்வு செய்யவும்.',
        LOW_PRESSURE: 'வால்வுகள் மற்றும் விநியோகக் கிளைகளை ஆய்வு செய்யவும்.',
        PUMP_FAILURE: 'மின்சாரப் பலகை மற்றும் பம்பை ஆய்வு செய்யவும்.',
        SENSOR_FAULT: 'சென்சாரை ஆய்வு செய்து அளவுத்திருத்தம் செய்யவும்.',
        SENSOR_CONTAMINATION: 'தானியங்கி துடைப்பான் தூய்மையாக்கத்தை இயக்கவும் அல்லது கள ஆய்வு செய்யவும்.',
        SUPERVISOR_ESCALATION: 'தொழில்நுட்ப மேற்பார்வையாளர் உடனடியாக களப் பணியாளரை அனுப்பி வால்வு மற்றும் அழுத்தத்தை ஆய்வு செய்ய வேண்டும்.',
        ABNORMAL_CONSUMPTION: 'நீர் பயன்பாட்டு அளவீடுகள் மற்றும் விநியோகப் பாதையை ஆய்வு செய்யவும்.',
        MAINTENANCE_REQUIRED: 'பராமரிப்புப் பணியைத் திட்டமிட்டு களப் பணியாளரை நியமிக்கவும்.'
      }[alert.alertType] || 'களப் பணியாளரை அனுப்பி நீர் அமைப்பை ஆய்வு செய்யவும்.')
    : alert.recommendedAction;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Back to Villager Portal if Villager */}
      {isVillager && (
        <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
          <div className="flex items-center space-x-2 text-cyan-900 text-xs font-semibold">
            <Bell className="w-4 h-4 text-cyan-700" />
            <span>{tamilEnabled ? 'கிராம மக்கள் அறிவிப்புகள் மற்றும் பஞ்சாயத்து எச்சரிக்கைகள் பலகை' : 'Village Public Notice Board & Water Supply Alerts'}</span>
          </div>
          <button
            onClick={() => onNavigate('citizen_portal')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold text-xs flex items-center space-x-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{tamilEnabled ? 'எனது கிராம பகுதிக்குத் திரும்பு' : 'Back to My Village Portal'}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{tamilEnabled ? 'நிகழ்நேர அறிவிப்புகள் மற்றும் ஸ்மார்ட் எச்சரிக்கை அமைப்பு' : 'Real-Time Notifications & Smart Alert Engine'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'அறிவிப்புகள் & ஸ்மார்ட் எச்சரிக்கைகள்' : 'Notifications & System Alerts'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled 
              ? 'IoT விநியோகக் குறைபாடுகள், கசிவு எச்சரிக்கைகள் மற்றும் 5-நாள் கடந்த புகார்களின் மேற்பார்வையாளர் அறிவிப்புகள்.'
              : 'Autonomous threshold alerts, hydraulic mitigations, and 5-day SLA escalation queue for Supervisor.'}
          </p>
        </div>

        {/* Action / Fault Injection buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              dataService.checkAndEscalateComplaints();
              setAlerts([...dataService.alerts]);
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
            title={tamilEnabled ? '5 நாட்களைக் கடந்த புகார்களைச் சரிபார்க்கவும்' : 'Check 5-day overdue complaints'}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{tamilEnabled ? 'SLA தணிக்கை' : 'Check 5-Day SLA'}</span>
          </button>

          {!isVillager && (
            <>
              <button
                onClick={() => dataService.injectFault('LEAK')}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
              >
                {tamilEnabled ? '+ கசிவு சோதனை' : '+ Leak Test'}
              </button>
              <button
                onClick={() => dataService.injectFault('SENSOR_DIRT')}
                className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all"
              >
                {tamilEnabled ? '+ அழுக்கு சோதனை' : '+ Dirt Test'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUPERVISOR SLA ALERT HIGHLIGHT CALLOUT */}
      {escalationAlertsCount > 0 && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider">
                  {tamilEnabled ? 'நிர்வாகியின் 5 நாள் SLA மீறப்பட்டது' : '5-Day Admin SLA Breached'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-900">
                  {escalationAlertsCount} {tamilEnabled ? 'மேற்பார்வையாளருக்கு அனுப்ப நிலுவையில்' : 'Pending Supervisor Escalation(s)'}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                {tamilEnabled 
                  ? 'நிர்வாகியால் 5 நாட்களுக்குள் தீர்க்கப்படாத புகார்கள் மேற்பார்வையாளருக்கு அனுப்பப்பட்டுள்ளன!'
                  : 'Complaints unresolved within 5 days have been automatically escalated to the Technical Supervisor!'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {tamilEnabled ? 'தொழில்நுட்ப மேற்பார்வையாளர் தொலைஅளவீட்டுப் பதிவுகளை ஆய்வு செய்து அவசரக் களக் குழுக்களை அனுப்ப வேண்டும்.' : 'Technical Supervisor must review telemetry logs and dispatch emergency field crews.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('complaints')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center space-x-1.5 transition-all shrink-0 cursor-pointer"
          >
            <span>{tamilEnabled ? 'புகார்கள் பலகைக்குச் செல்' : 'Review Escalated Complaints'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTER TABS & SEVERITY BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tamilEnabled ? 'அனைத்து எச்சரிக்கைகள்' : 'All Alerts'} ({alerts.length})
          </button>

          <button
            onClick={() => setSelectedCategory('ESCALATION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedCategory === 'ESCALATION'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{tamilEnabled ? '5-நாள் SLA மேற்பார்வை' : 'Supervisor 5-Day SLA'}</span>
            {escalationAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-900 font-extrabold">
                {escalationAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedCategory('LEAK_PRESSURE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'LEAK_PRESSURE'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            {tamilEnabled ? 'கசிவு & அழுத்தம்' : 'Leak & Pressure'}
          </button>

          <button
            onClick={() => setSelectedCategory('SENSOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'SENSOR'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
            }`}
          >
            {tamilEnabled ? 'சென்சார்கள்' : 'Sensors & Fouling'}
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1">{tamilEnabled ? 'தீவிரம்:' : 'Severity:'}</span>
          {['ALL', 'CRITICAL', 'WARNING'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                selectedSeverity === sev
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {severityLabel(sev)}
            </button>
          ))}
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-base">
              {tamilEnabled ? 'எந்தவொரு நிலுவை எச்சரிக்கைகளும் இல்லை' : 'No Active Alerts In This View'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {tamilEnabled ? 'அனைத்து கிராமப்புற நீர் வலைப்பின்னல்களும் குடிமக்கள் புகார் SLA-களும் வழக்கமான வரம்பில் உள்ளன.' : 'All rural water grids and citizen complaint SLAs are within nominal parameters.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isEscalation = alert.alertType === 'SUPERVISOR_ESCALATION';
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div 
                key={alert.id}
                className={`rounded-3xl p-6 border shadow-xs transition-all ${
                  isResolved ? 'bg-slate-50 border-slate-200 opacity-60' :
                  isEscalation ? 'bg-amber-500/10 border-2 border-amber-400 ring-2 ring-amber-400/20' :
                  isCritical ? 'bg-rose-50/40 border-rose-300' :
                  isWarning ? 'bg-amber-50/40 border-amber-300' :
                  'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isEscalation ? 'bg-amber-600 text-white' :
                        isCritical ? 'bg-rose-600 text-white' :
                        isWarning ? 'bg-amber-500 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {isEscalation ? (tamilEnabled ? 'மேற்பார்வையாளர் உயர்த்தல்' : 'SUPERVISOR ESCALATION') : severityLabel(alert.severity)}
                      </span>

                      <span className="font-mono text-xs text-slate-400 font-bold">
                        {alert.id} • {alert.timestamp}
                      </span>

                      <span className="text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                        {alert.villageName}
                      </span>

                      {alert.status === 'RESOLVED' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {tamilEnabled ? 'தீர்க்கப்பட்டது' : 'Resolved'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {alertTitle(alert)}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alertDescription(alert)}
                    </p>

                    {/* ADAPTIVE ACTION CARD */}
                    <div className={`rounded-2xl p-3 text-xs flex items-start space-x-2 border ${
                      isEscalation 
                        ? 'bg-amber-50 border-amber-200 text-amber-950' 
                        : 'bg-white/90 border-slate-200/80 text-slate-800'
                    }`}>
                      <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isEscalation ? 'text-amber-600' : 'text-cyan-600'}`} />
                      <div>
                        <span className="font-bold block text-[11px] uppercase tracking-wider">
                          {isEscalation
                            ? (tamilEnabled ? 'மேற்பார்வையாளர் பரிந்துரைத்த நடவடிக்கை:' : 'Supervisor Prescribed Intervention:')
                            : (tamilEnabled ? 'தானியங்கி தகவமைப்பு நடவடிக்கைத் திட்டம்:' : 'Autonomous Adaptive Response Strategy:')}
                        </span>
                        <span>{alertAction(alert)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    {!isResolved && (
                      <button
                        onClick={() => handleExecuteAdaptiveAction(alert)}
                        className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs ${
                          isEscalation 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-cyan-700 hover:bg-cyan-800'
                        }`}
                      >
                        {isEscalation ? (
                          <>
                            <MessageSquareWarning className="w-3.5 h-3.5" />
                            <span>{tamilEnabled ? 'புகாரைப் பார்வையிடு' : 'Inspect Complaint'}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-cyan-300" />
                            <span>{tamilEnabled ? 'நடவடிக்கையைச் செயல்படுத்து' : 'Execute Action'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        {tamilEnabled ? 'பெற்றதை உறுதிப்படுத்து' : 'Acknowledge'}
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                      >
                        {tamilEnabled ? 'தீர்க்கப்பட்டதாகக் குறி' : 'Mark Resolved'}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
