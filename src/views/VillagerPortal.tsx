import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  User, 
  ShieldCheck, 
  Activity, 
  Search, 
  Send, 
  Sparkles,
  RefreshCw,
  LogOut,
  LogIn,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Complaint, ComplaintType, Village, WaterSchedule, UserProfile, WaterQualityData } from '../types';
import { getTranslation } from '../i18n/translations';

interface VillagerPortalProps {
  currentUser: UserProfile | null;
  tamilEnabled: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const VillagerPortal: React.FC<VillagerPortalProps> = ({
  currentUser,
  tamilEnabled,
  onOpenAuthModal,
  onLogout
}) => {
  const lang = tamilEnabled ? 'ta' : 'en';
  const t = (k: any) => getTranslation(k, lang);

  const [activeTab, setActiveTab] = useState<'schedule' | 'quality' | 'complaint' | 'myTickets' | 'contacts'>('schedule');

  // Live state from dataService
  const [villages, setVillages] = useState<Village[]>(dataService.villages);
  const [schedules, setSchedules] = useState<WaterSchedule[]>([]);
  const [waterQuality, setWaterQuality] = useState<WaterQualityData | undefined>();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  // Active village and ward from currentUser (with sensible fallbacks)
  const activeVillageId = currentUser?.villageId || 'VIL-01';
  const activeWardId = currentUser?.wardId || 'WRD-01-2';

  const currentVillage = villages.find(v => v.id === activeVillageId) || villages[0];
  const currentWard = currentVillage?.wards?.find(w => w.id === activeWardId) || currentVillage?.wards?.[0];

  // Complaint Form State
  const [complaintType, setComplaintType] = useState<ComplaintType>('NO_WATER_SUPPLY');
  const [streetLocation, setStreetLocation] = useState(currentUser?.wardName || '');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const complaintTypeLabel = (type: ComplaintType) => t(({
    NO_WATER_SUPPLY: 'typeNoWater',
    LOW_PRESSURE: 'typeLowPressure',
    DIRTY_OR_CONTAMINATED_WATER: 'typeDirtyWater',
    PIPELINE_LEAKAGE: 'typePipelineLeak',
    VALVE_DAMAGED: 'typeValveDamaged',
    IRREGULAR_TIMING: 'typeIrregularTiming',
    OTHER: 'typeOther'
  } as const)[type]);

  const complaintStatusLabel = (status: string) => t(({
    SUBMITTED: 'statusSubmitted',
    REVIEWED: 'statusReviewed',
    IN_PROGRESS: 'statusInProgress',
    RESOLVED: 'statusResolved'
  } as const)[status as 'SUBMITTED' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED'] || 'statusSubmitted');

  const displayScheduleText = (text: string) => {
    if (!tamilEnabled) return text;
    const tamilScheduleText: Record<string, string> = {
      'Melur High-Level OHT-1': 'மேலூர் உயர்மட்டத் தொட்டி 1',
      'Melur South Sump & Booster': 'மேலூர் தெற்குத் தரைமட்டத் தொட்டி மற்றும் அழுத்த ஏற்றி',
      'Keelur Central OHT': 'கீழூர் மத்திய உயர்மட்டத் தொட்டி',
      'Pudur North Overhead Tank': 'புதூர் வடக்கு மேல்நிலைத் தொட்டி',
      'Arasur Village Tank': 'அரசூர் கிராமத் தொட்டி',
      'Periyakulam Major Reservoir': 'பெரியகுளம் பிரதான நீர்த்தேக்கம்',
      'Shanti Nagar Ground Level Sump': 'சாந்தி நகர் தரைமட்டத் தொட்டி',
      'Morning domestic supply. High pressure distribution.': 'காலை வீட்டு உபயோக நீர் விநியோகம். அதிக அழுத்த விநியோகம்.',
      'Morning domestic supply to temple zone and main market taps.': 'கோவில் பகுதி மற்றும் முக்கியச் சந்தை குழாய்களுக்கு காலை குடிநீர் விநியோகம்.',
      'Evening booster supply to elevated residential colony.': 'மேட்டுப் பகுதியில் உள்ள குடியிருப்புகளுக்கு மாலை அழுத்த ஏற்றி மூலம் நீர் விநியோகம்.',
      'Commercial and residential regular rotation.': 'வணிக மற்றும் குடியிருப்புப் பகுதிகளுக்கு வழக்கமான சுழற்சி விநியோகம்.',
      'Evening alternate day rotation for perimeter households.': 'எல்லைப் பகுதிக் குடும்பங்களுக்கு மாலை மாற்று நாள் சுழற்சி விநியோகம்.',
      'Essential services and public primary health center feeder.': 'அத்தியாவசிய சேவைகள் மற்றும் அரசு ஆரம்ப சுகாதார நிலையத்திற்கான விநியோகம்.',
      'School zone and adjacent residential streets.': 'பள்ளிப் பகுதி மற்றும் அருகிலுள்ள குடியிருப்புத் தெருக்களுக்கு விநியோகம்.',
      'Evening domestic supply for eastern farms belt.': 'கிழக்குப் பண்ணைப் பகுதிகளுக்கு மாலை வீட்டு உபயோக நீர் விநியோகம்.',
      'Morning batch successfully completed.': 'காலை விநியோகம் வெற்றிகரமாக நிறைவடைந்தது.',
      'Morning distribution batch completed.': 'காலை நீர் விநியோகம் நிறைவடைந்தது.',
      'Temporarily suspended due to Intake Pump-06 overload trip.': 'உள்வாங்கும் மோட்டார் 06 அதிகச் சுமையால் நின்றதால் தற்காலிகமாக நிறுத்தப்பட்டுள்ளது.',
      'Suspended pending pump repair.': 'மோட்டார் பழுதுபார்க்கும் வரை விநியோகம் நிறுத்தப்பட்டுள்ளது.',
      'Pressure boosted distribution.': 'அழுத்தம் உயர்த்தப்பட்ட நீர் விநியோகம்.'
    };
    return tamilScheduleText[text] || text;
  };

  const formatTestedAt = (value?: string) => {
    if (!value) return t('justNow');
    if (!tamilEnabled) return value;
    if (/^just now$/i.test(value)) return t('justNow');
    const relativeTime = value.match(/^(\d+)\s+(mins?|minutes?|hours?|days?)\s+ago$/i);
    if (!relativeTime) return value;
    const unit = relativeTime[2].toLowerCase();
    const tamilUnit = unit.startsWith('min') ? 'நிமிடங்களுக்கு' : unit.startsWith('hour') ? 'மணி நேரத்திற்கு' : 'நாட்களுக்கு';
    return `${relativeTime[1]} ${tamilUnit} முன்பு`;
  };

  // Sync with dataService
  const refreshData = () => {
    setVillages([...dataService.villages]);
    // Filter schedule strictly to this villager's village and ward!
    const filteredSchedules = dataService.getSchedulesForVillager(activeVillageId, activeWardId);
    setSchedules(filteredSchedules);
    // Water Quality
    setWaterQuality(dataService.getWaterQualityForVillage(activeVillageId));
    // Complaints filed by this villager
    if (currentUser?.phone) {
      setMyComplaints(dataService.getComplaintsForVillager(currentUser.phone, currentUser.name));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = dataService.subscribe(() => {
      refreshData();
    });
    return unsub;
  }, [activeVillageId, activeWardId, currentUser]);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const complaint = dataService.submitComplaint({
        citizenName: currentUser?.name || 'Village Citizen',
        mobile: currentUser?.phone || '9840212345',
        villageId: activeVillageId,
        villageName: currentVillage?.name || 'Gram Panchayat',
        wardId: activeWardId,
        wardName: currentWard?.name || 'Ward 1',
        streetLocation: streetLocation.trim() || currentWard?.name || 'Main Street',
        complaintType,
        description: description.trim(),
        photoUrl: photoUrl || undefined
      });

      setSubmittedComplaint(complaint);
      setDescription('');
      setIsSubmitting(false);
      refreshData();
    }, 400);
  };

  return (
    <div className="space-y-6">

      {/* Top Welcome & Ward Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('appName')} • {t('roleVillager')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser?.name || 'Panchayat Citizen'}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-cyan-100/90 mt-2 font-medium">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {tamilEnabled ? (currentVillage?.tamilName || currentVillage?.name) : currentVillage?.name}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  {tamilEnabled ? (currentWard?.tamilName || currentWard?.name) : currentWard?.name}
                </span>
              </span>
              {currentUser?.phone && (
                <span className="flex items-center space-x-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+91 {currentUser.phone}</span>
                </span>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('switchUser')}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logoutBtn')}</span>
            </button>
          </div>
        </div>

        {/* Live Ward Water Status Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-cyan-200/80 font-bold block">
              {t('supplyStatus')}
            </span>
            <span className={`text-sm font-black mt-1 inline-flex items-center space-x-1.5 ${
              currentVillage?.supplyStatus === 'ACTIVE' ? 'text-emerald-400' :
              currentVillage?.supplyStatus === 'UPCOMING' ? 'text-cyan-400' :
              currentVillage?.supplyStatus === 'COMPLETED' ? 'text-blue-300' : 'text-rose-400'
            }`}>
              <span className="w-2 h-2 rounded-full animate-ping bg-current" />
              <span>
                {currentVillage?.supplyStatus === 'ACTIVE' ? t('activeNow') :
                 currentVillage?.supplyStatus === 'UPCOMING' ? t('upcoming') :
                 currentVillage?.supplyStatus === 'COMPLETED' ? t('completed') :
                 t('suspended')}
              </span>
            </span>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-cyan-200/80 font-bold block">
              {t('yourVillageTank')}
            </span>
            <span className="text-lg font-black text-white mt-0.5 block">
              {currentVillage?.currentWaterLevelAvg || 74}%
            </span>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full" 
                style={{ width: `${currentVillage?.currentWaterLevelAvg || 74}%` }} 
              />
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-cyan-200/80 font-bold block">
              {t('waterQualityMonitor')}
            </span>
            <span className="text-sm font-black text-emerald-400 mt-1 inline-flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('safeToDrink')}</span>
            </span>
            <span className="text-[10px] text-cyan-200/70 block mt-0.5">
              TDS: {waterQuality?.tdsPpm || 275} ppm • pH: {waterQuality?.phLevel || 7.3}
            </span>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-cyan-200/80 font-bold block">
              {t('linemanHeadline')}
            </span>
            <span className="text-xs font-black text-white mt-1 block truncate">
              {currentWard?.linemanName || currentVillage?.linemanName || 'Duty Lineman'}
            </span>
            <a 
              href={`tel:${currentWard?.linemanPhone || currentVillage?.linemanPhone}`}
              className="text-[10px] text-cyan-300 hover:text-white font-mono flex items-center space-x-1 mt-0.5"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>{currentWard?.linemanPhone || currentVillage?.linemanPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Villager */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-600" />
          <span>{t('myWardSchedule')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'quality'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-600" />
          <span>{t('waterQualityMonitor')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('complaint')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'complaint'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('fileGrievance')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('myTickets')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer relative ${
            activeTab === 'myTickets'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>{t('myComplaints')}</span>
          {myComplaints.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center">
              {myComplaints.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>{t('linemanContact')}</span>
        </button>
      </div>

      {/* TAB CONTENT 1: WARD SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  <span>{t('scheduleHeadline')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('scheduleOnlyYourWardNotice')}
                </p>
              </div>

              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span>
                  {tamilEnabled ? (currentWard?.tamilName || currentWard?.name) : (currentWard?.name || 'Ward')}
                </span>
              </div>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {t('noSchedule')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {schedules.map(sch => (
                  <div 
                    key={sch.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-cyan-50/40 transition-all hover:border-cyan-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                          {tamilEnabled ? (currentWard?.tamilName || sch.wardName || sch.zone) : (sch.wardName || sch.zone)}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          {tamilEnabled ? ({ Monday: 'திங்கள்', Tuesday: 'செவ்வாய்', Wednesday: 'புதன்', Thursday: 'வியாழன்', Friday: 'வெள்ளி', Saturday: 'சனி', Sunday: 'ஞாயிறு', Daily: 'தினசரி' }[sch.dayOfWeek]) : sch.dayOfWeek} {t('supply')}
                        </h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        sch.supplyStatus === 'ACTIVE_NOW'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : sch.supplyStatus === 'UPCOMING'
                          ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                          : sch.supplyStatus === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {sch.supplyStatus === 'ACTIVE_NOW' ? t('activeNow') :
                         sch.supplyStatus === 'UPCOMING' ? t('upcoming') :
                         sch.supplyStatus === 'COMPLETED' ? t('completed') :
                         t('suspended')}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center space-x-2 text-slate-800 font-mono font-bold text-lg bg-white p-3 rounded-xl border border-slate-200">
                      <Clock className="w-5 h-5 text-cyan-600" />
                      <span>{sch.startTime} - {sch.endTime}</span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center space-x-1 font-medium">
                        <span className="text-slate-400">{t('sourceTank')}</span>
                        <span className="text-slate-800">{displayScheduleText(sch.tankName)}</span>
                      </div>
                      {sch.remarks && (
                        <p className="text-slate-500 italic text-[11px] pt-1">
                          "{displayScheduleText(sch.remarks)}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DRINKING WATER QUALITY */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <span>{t('qualityHeadline')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {tamilEnabled ? currentVillage?.tamilName || currentVillage?.name : currentVillage?.name} • {t('certifiedNote')}
                </p>
              </div>

              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{waterQuality?.isPotable ? t('potableVerdictSafe') : t('potableVerdictCaution')}</span>
              </div>
            </div>

            {/* Quality Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              
              {/* Parameter 1: TDS */}
              <div className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200">
                <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider block">
                  {t('tdsTitle')}
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-3xl font-black text-cyan-950 font-mono">
                    {waterQuality?.tdsPpm || 275}
                  </span>
                  <span className="text-xs font-bold text-cyan-700">ppm</span>
                </div>
                <div className="mt-3 inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {t('optimalWater')}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {t('tdsDesc')}
                </p>
              </div>

              {/* Parameter 2: pH */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  {t('phTitle')}
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-3xl font-black text-blue-950 font-mono">
                    {waterQuality?.phLevel || 7.3}
                  </span>
                  <span className="text-xs font-bold text-blue-700">pH</span>
                </div>
                <div className="mt-3 inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {t('balancedPh')}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {t('phDesc')}
                </p>
              </div>

              {/* Parameter 3: Turbidity */}
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  {t('turbidityTitle')}
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-3xl font-black text-teal-950 font-mono">
                    {waterQuality?.turbidityNtu || 1.1}
                  </span>
                  <span className="text-xs font-bold text-teal-700">NTU</span>
                </div>
                <div className="mt-3 inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {t('clearWater')}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {t('turbidityDesc')}
                </p>
              </div>

              {/* Parameter 4: Chlorine */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                  {t('chlorineTitle')}
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-3xl font-black text-indigo-950 font-mono">
                    {waterQuality?.chlorineMgL || 0.42}
                  </span>
                  <span className="text-xs font-bold text-indigo-700">mg/L</span>
                </div>
                <div className="mt-3 inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {t('disinfectedWater')}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {t('chlorineDesc')}
                </p>
              </div>

            </div>

            {/* Verification Footer */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>
                  {t('testedAtLabel')} <strong>{formatTestedAt(waterQuality?.testedAt)}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {t('sensorLab')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FILE GRIEVANCE / COMPLAINT FORM */}
      {activeTab === 'complaint' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="text-center pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {t('complaintHeadline')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('complaintSubheadline')}
              </p>
            </div>

            {submittedComplaint ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  {t('complaintSuccessTitle')}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {t('complaintSuccessMsg')}
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('ticketIdLabel')}:</span>
                    <span className="font-mono font-black text-cyan-800">{submittedComplaint.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('complaintTypeLabel')}:</span>
                    <span className="font-bold text-slate-800">{complaintTypeLabel(submittedComplaint.complaintType)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('statusLabel')}:</span>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {complaintStatusLabel(submittedComplaint.status)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedComplaint(null)}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    {t('fileAnotherComplaint')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('myTickets')}
                    className="py-2.5 px-4 rounded-xl bg-cyan-700 text-white text-xs font-bold hover:bg-cyan-800 shadow-sm"
                  >
                    {t('trackMyTicketsBtn')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4 mt-6">
                {/* Pre-filled user details notice */}
                <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold block">{currentUser?.name}</span>
                    <span className="text-cyan-700">
                      {tamilEnabled ? (currentVillage?.tamilName || currentVillage?.name) : currentVillage?.name} • {tamilEnabled ? (currentWard?.tamilName || currentWard?.name) : currentWard?.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-cyan-800">+91 {currentUser?.phone}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('complaintTypeLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="NO_WATER_SUPPLY">{t('typeNoWater')}</option>
                    <option value="LOW_PRESSURE">{t('typeLowPressure')}</option>
                    <option value="DIRTY_OR_CONTAMINATED_WATER">{t('typeDirtyWater')}</option>
                    <option value="PIPELINE_LEAKAGE">{t('typePipelineLeak')}</option>
                    <option value="VALVE_DAMAGED">{t('typeValveDamaged')}</option>
                    <option value="IRREGULAR_TIMING">{t('typeIrregularTiming')}</option>
                    <option value="OTHER">{t('typeOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('streetLocationLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetLocation}
                    onChange={(e) => setStreetLocation(e.target.value)}
                    placeholder={t('streetLocationPlaceholder')}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('complaintDescLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('complaintDescPlaceholder')}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t('submittingComplaint') : t('submitComplaintBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: MY COMPLAINTS & RESOLUTION TRACKING */}
      {activeTab === 'myTickets' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>{t('myComplaintsHeadline')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('allRegisteredComplaints')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('complaint')}
                className="py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all"
              >
                + {t('newTicket')}
              </button>
            </div>

            {myComplaints.length === 0 ? (
              <div className="text-center py-16">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">
                  {t('myComplaintsEmpty')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('complaint')}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700"
                >
                  {t('fileGrievance')}
                </button>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {myComplaints.map(ticket => (
                  <div 
                    key={ticket.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-black text-cyan-900 bg-cyan-100/80 px-2.5 py-1 rounded-lg">
                          {ticket.id}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {complaintTypeLabel(ticket.complaintType)}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center space-x-1 ${
                        ticket.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {ticket.status === 'RESOLVED' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>
                          {ticket.status === 'RESOLVED' ? t('statusResolved') :
                           ticket.status === 'IN_PROGRESS' ? t('statusInProgress') :
                           t('statusSubmitted')}
                        </span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      "{ticket.description}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{t('reported')} {ticket.createdAt}</span>
                      <span>{ticket.streetLocation}</span>
                    </div>

                    {/* Admin Resolution Remarks Box */}
                    {ticket.adminRemark ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t('adminRemarksHeading')}</span>
                        </div>
                        <p className="text-emerald-800 font-medium">
                          {ticket.adminRemark}
                        </p>
                        {ticket.assignedStaff && (
                          <div className="text-[11px] text-emerald-700 pt-1">
                            {t('assignedStaffHeading')}: <strong>{ticket.assignedStaff}</strong>
                          </div>
                        )}
                        {ticket.resolvedAt && (
                          <div className="text-[10px] text-emerald-600">
                            {t('resolvedOn')} {ticket.resolvedAt}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{t('noRemarksYet')}</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: WARD CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duty Lineman */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                {tamilEnabled ? (currentWard?.tamilName || currentWard?.name) : currentWard?.name}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-2">
                {currentWard?.linemanName || currentVillage?.linemanName}
              </h4>
              <p className="text-xs text-slate-500">
                {t('linemanRole')}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${currentWard?.linemanPhone || currentVillage?.linemanPhone}`}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{t('callNowBtn')} ({currentWard?.linemanPhone || currentVillage?.linemanPhone})</span>
              </a>
            </div>
          </div>

          {/* Panchayat President */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                {tamilEnabled ? (currentVillage?.tamilName || currentVillage?.name) : currentVillage?.name}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-2">
                {currentVillage?.panchayatPresident}
              </h4>
              <p className="text-xs text-slate-500">
                {t('presidentCard')}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('complaint')}
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t('fileGrievance')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
