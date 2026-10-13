import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Database, 
  Droplet, 
  TrendingUp, 
  Cpu, 
  AlertTriangle, 
  Sliders, 
  MessageSquareWarning,
  ArrowUpRight,
  Radio,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Waves,
  Gauge
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { dataService } from '../services/dataService';
import { CHART_HOURLY_DATA, VILLAGE_COMPLAINT_COUNTS } from '../data/mockData';
import { UserRole } from '../types';

interface DashboardViewProps {
  currentRole: UserRole;
  onNavigate: (viewId: string) => void;
  tamilEnabled: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  onNavigate,
  tamilEnabled
}) => {
  const [villages, setVillages] = useState(dataService.villages);
  const [tanks, setTanks] = useState(dataService.tanks);
  const [pumps, setPumps] = useState(dataService.pumps);
  const [sensors, setSensors] = useState(dataService.sensors);
  const [complaints, setComplaints] = useState(dataService.complaints);
  const [alerts, setAlerts] = useState(dataService.alerts);

  useEffect(() => {
    const sync = () => {
      setVillages(dataService.villages);
      setTanks(dataService.tanks);
      setPumps(dataService.pumps);
      setSensors(dataService.sensors);
      setComplaints(dataService.complaints);
      setAlerts(dataService.alerts);
    };
    sync();
    return dataService.subscribe(sync);
  }, []);

  // Aggregated calculations
  const totalVillages = villages.length;
  const activeTanks = tanks.filter(t => t.status !== 'MAINTENANCE').length;
  const totalWaterAvailableLiters = tanks.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const totalCapacityLiters = tanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const avgLevelPercent = Math.round((totalWaterAvailableLiters / totalCapacityLiters) * 100);

  const activePumps = pumps.filter(p => p.status === 'RUNNING').length;
  const leakageAlerts = alerts.filter(a => a.alertType === 'LEAKAGE' && a.status === 'ACTIVE').length;
  const sensorWarnings = sensors.filter(s => s.status === 'warning' || s.status === 'contaminated' || s.status === 'critical').length;
  const pendingComplaints = complaints.filter(c => c.status !== 'RESOLVED').length;
  const complaintChartData = VILLAGE_COMPLAINT_COUNTS.map(item => {
    const village = dataService.villages.find(v =>
      item.village === v.name.replace(/ (Gram Panchayat|Panchayat)$/, '') || v.name.startsWith(item.village)
    );
    return { ...item, village: tamilEnabled ? village?.tamilName || item.village : item.village };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: Gram Panchayat Welcome & Status */}
      <section className="dashboard-hero relative isolate overflow-hidden rounded-2xl bg-[#092f35] text-white shadow-xl shadow-emerald-950/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(20,184,166,0.26),transparent_48%),linear-gradient(115deg,#092f35_0%,#10494a_58%,#1f5c56_100%)]" />
        <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex min-h-[300px] flex-col justify-between p-6 sm:p-8 lg:min-h-[330px]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-emerald-200">
              <span className="flex h-2 w-2 relative">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-70"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-300"></span>
              </span>
              <span>{tamilEnabled ? 'கிராம ஊராட்சி குடிநீர் வலையமைப்பு • AI தானியங்கி செயல்பாடு' : 'Gram Panchayat Rural Water Grid • AI Adaptive Response'}</span>
            </div>
            <h1 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
              {tamilEnabled ? 'ஜல் மித்ரா 360 கட்டுப்பாட்டு மையம்' : 'Jal Mitra 360 Panchayat Command Center'}
            </h1>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-emerald-50/80 sm:text-sm">
              {tamilEnabled 
                ? 'ஊரகக் குடிநீர் கட்டமைப்பு கண்காணிப்பு, சென்சார் சுய-பராமரிப்பு மற்றும் செயற்கை நுண்ணறிவு அடிப்படையிலான ஒழுங்கின்மை பகுப்பாய்வு பலகை.'
                : 'Self-learning multi-sensor telemetry, pipeline anomaly detection, automated sensor maintenance, and citizen grievance correlation.'
              }
            </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => onNavigate('ai_analysis')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#d2f36b] px-3.5 py-2.5 text-xs font-extrabold text-[#153b34] shadow-md shadow-black/10 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{tamilEnabled ? 'AI குறைபாடு கண்டறிதல்' : 'AI Anomaly Engine'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('self_maintenance')}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <RefreshCw className="h-4 w-4 text-emerald-200" />
                  <span>{tamilEnabled ? 'சுய-பராமரிப்பு சென்சார்' : 'Self-Maintaining Sensor'}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-xs sm:grid-cols-4">
              <button onClick={() => onNavigate('tanks')} className="group text-left" title={tamilEnabled ? 'தொட்டி கண்காணிப்பைத் திறக்கவும்' : 'Open tank monitoring'}>
                <span className="block text-[10px] text-emerald-100/65">{tamilEnabled ? 'நீர்த்தேக்க அழுத்தம்' : 'Reservoir Head'}</span>
                <span className="mt-1 block font-extrabold text-white group-hover:text-lime-200">3.2 - 4.5 {tamilEnabled ? 'பார்' : 'Bar'}</span>
              </button>
              <button onClick={() => onNavigate('iot_monitoring')} className="group text-left" title={tamilEnabled ? 'சென்சார் கண்காணிப்பைத் திறக்கவும்' : 'Open sensor monitoring'}>
                <span className="block text-[10px] text-emerald-100/65">{tamilEnabled ? 'ESP32 நுழைவாயில்கள்' : 'ESP32 Gateways'}</span>
                <span className="mt-1 block font-extrabold text-lime-200 group-hover:text-white">6 {tamilEnabled ? 'இணைப்பு' : 'online'}</span>
              </button>
              <div>
                <span className="block text-[10px] text-emerald-100/65">{tamilEnabled ? 'AI மாதிரி நிலை' : 'AI Model Status'}</span>
                <span className="mt-1 block font-extrabold text-white">{tamilEnabled ? 'சுய-கற்றல்' : 'Self-Learning'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-emerald-100/65">{tamilEnabled ? 'மொத்த மக்கள் தொகை' : 'Population'}</span>
                <span className="mt-1 block font-extrabold text-white">26,070</span>
              </div>
            </div>
          </div>

          <div className="dashboard-hero-image relative min-h-[250px] overflow-hidden lg:min-h-full">
            <img
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Fahrt-Fatehpur_Sikri-Keoladeo-06-Wasserturm-2018-gje.jpg/960px-Fahrt-Fatehpur_Sikri-Keoladeo-06-Wasserturm-2018-gje.jpg"
              alt={tamilEnabled ? 'இந்திய கிராமப்புற நீர் விநியோகத்தில் பயன்படுத்தப்படும் உயர்மட்ட நீர்த்தேக்கக் கோபுரம்' : 'Elevated water tower serving a rural water distribution network in India'}
              className="absolute inset-0 h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#10494a] via-[#10494a]/30 to-transparent lg:bg-gradient-to-l lg:from-[#092f35]/75 lg:via-[#092f35]/10 lg:to-transparent" />
            <div className="dashboard-waterline absolute inset-x-0 bottom-0 h-1/3 opacity-40" />

            <button
              onClick={() => onNavigate('tanks')}
              className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 rounded-xl border border-white/35 bg-[#092f35]/75 p-4 text-left shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-7 sm:left-7 sm:right-7"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d2f36b] text-[#153b34]">
                  <Waves className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-bold uppercase text-emerald-100/75">{tamilEnabled ? 'தொட்டி சேமிப்பு' : 'Village tank storage'}</span>
                  <span className="mt-0.5 block text-xl font-black">{avgLevelPercent}% <span className="text-xs font-semibold text-emerald-100">{tamilEnabled ? 'சராசரி' : 'network average'}</span></span>
                  <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <span className="block h-full rounded-full bg-[#d2f36b] transition-[width] duration-700" style={{ width: `${avgLevelPercent}%` }} />
                  </span>
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                <Gauge className="h-4 w-4" />
              </span>
            </button>
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[9px] text-white/85 backdrop-blur-sm">
              <a
                href="https://commons.wikimedia.org/wiki/File:Fahrt-Fatehpur_Sikri-Keoladeo-06-Wasserturm-2018-gje.jpg"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Gerd Eichmann / Wikimedia Commons
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                CC BY-SA 4.0
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8 DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Total Villages */}
        <div 
          onClick={() => onNavigate('villages')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'ஊராட்சிகள்' : 'Total Villages'}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalVillages}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">{tamilEnabled ? '100% கண்காணிப்பில்' : '100% Monitored'}</span>
          </p>
        </div>

        {/* Card 2: Active Tanks */}
        <div 
          onClick={() => onNavigate('tanks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'தொட்டிகள்' : 'Active Tanks'}</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeTanks} <span className="text-xs text-slate-400 font-medium">/ {tanks.length}</span></div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tamilEnabled ? 'மேல்நிலை மற்றும் தரைமட்டத் தொட்டிகள்' : 'Overhead & Ground sumps'}
          </p>
        </div>

        {/* Card 3: Water Available */}
        <div 
          onClick={() => onNavigate('tanks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'நீர் இருப்பு' : 'Water Available'}</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {Math.round(totalWaterAvailableLiters / 1000)} <span className="text-xs text-slate-500 font-bold">KL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {avgLevelPercent}% {tamilEnabled ? 'சராசரி வலையமைப்பு நீர்மட்டம்' : 'average network head'}
          </p>
        </div>

        {/* Card 4: Water Demand */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'இன்றைய தேவை' : 'Current Demand'}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1,172 <span className="text-xs text-slate-500 font-bold">KL</span></div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            {tamilEnabled ? '92% தேவைக்கேற்ப விநியோகம்' : '92% fulfillment rate'}
          </p>
        </div>

        {/* Card 5: Active Pumps */}
        <div 
          onClick={() => onNavigate('pumps')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'மோட்டார்கள்' : 'Active Pumps'}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activePumps} <span className="text-xs text-slate-400 font-medium">/ {pumps.length}</span></div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tamilEnabled ? '1 பழுதடைந்தது (Periyakulam PMP-06)' : '1 Tripped (Periyakulam PMP-06)'}
          </p>
        </div>

        {/* Card 6: Leakage Alerts */}
        <div 
          onClick={() => onNavigate('alerts')}
          className={`p-5 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            leakageAlerts > 0 ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">{tamilEnabled ? 'கசிவு எச்சரிக்கை' : 'Leakage Alerts'}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{leakageAlerts}</div>
          <p className="text-[11px] text-rose-600 mt-1 font-semibold">
            {tamilEnabled ? 'புதூர் மண்டலம் 2 குழாய் உடைப்பு' : 'Zone 2 Pudur pipeline fracture'}
          </p>
        </div>

        {/* Card 7: Sensor Warnings */}
        <div 
          onClick={() => onNavigate('sensors')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'சென்சார் நிலை' : 'Sensor Warnings'}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{sensorWarnings}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tamilEnabled ? '1 மாசடைந்த உணரி' : '1 Contaminated transducer'}
          </p>
        </div>

        {/* Card 8: Pending Complaints */}
        <div 
          onClick={() => onNavigate('complaints')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tamilEnabled ? 'நிலுவை புகார்கள்' : 'Open Complaints'}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingComplaints}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tamilEnabled ? 'சென்சார் வலையமைப்புடன் தொடர்புடையது' : 'Correlated with sensor grid'}
          </p>
        </div>

      </div>

      {/* 6 DASHBOARD CHARTS GRID */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Water Level vs Time */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '1. நேரத்திற்கேற்ப நீர்மட்டம் (மேல்நிலைத் தொட்டிகள் 24 மணி நேரச் சுழற்சி)' : '1. Water Level vs Time (Overhead Tanks 24h Cycle)'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'JSN-SR04T மீயொலி சென்சார்களிலிருந்து தொடர்ச்சியான தரவு' : 'Continuous telemetry from Ultrasonic JSN-SR04T sensors'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
              {tamilEnabled ? '% கொள்ளளவு' : '% Capacity'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="waterLevel" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#levelGradient)" name={tamilEnabled ? 'நீர்மட்டம் %' : 'Water Level %'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inlet Flow vs Outlet Flow */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '2. உள்வரத்து மற்றும் வெளியேற்ற ஓட்டம் (ஓட்டச் சமநிலையின்மை கண்டறிதல்)' : '2. Inlet Flow vs Outlet Flow (Flow Imbalance Detection)'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'YF-DN50 / DN40 ஹால் விளைவு சென்சார் தரவு (லிட்டர் / நிமிடம்)' : 'Hall-effect YF-DN50 / DN40 telemetry (Liters Per Minute)'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
              LPM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="inletFlow" stroke="#0d9488" strokeWidth={2} name={tamilEnabled ? 'உள்வரத்து ஓட்டம் (LPM)' : 'Inlet Flow (LPM)'} dot={false} />
                <Line type="monotone" dataKey="outletFlow" stroke="#e11d48" strokeWidth={2} name={tamilEnabled ? 'வெளியேற்ற ஓட்டம் (LPM)' : 'Outlet Flow (LPM)'} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Pipeline Pressure */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '3. குழாய் அழுத்த மாற்றம் (07:30 மணிக்கு வீழ்ச்சி = மண்டலம் 2 உடைப்பு)' : '3. Pipeline Pressure Dynamics (Drop at 07:30 = Zone 2 Burst)'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'அழுத்த உணரி அளவீடுகள் (பார்)' : 'Piezoresistive pressure transducer readings (Bar)'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
              {tamilEnabled ? 'பார்' : 'Bar'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="stepAfter" dataKey="pressure" stroke="#2563eb" strokeWidth={2} fill="url(#pressureGradient)" name={tamilEnabled ? 'அழுத்தம் (பார்)' : 'Pressure (Bar)'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Water Demand vs Supply */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '4. குடிநீர் தேவை மற்றும் விநியோகம் (ஊராட்சி விநியோக நிறைவு)' : '4. Water Demand vs Supply (Panchayat Distribution Fulfillment)'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'மணி நேர அளவு ஒப்பீடு (கிலோலிட்டரில்)' : 'Hourly volume comparison in KL'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
              {tamilEnabled ? 'கிலோலிட்டர் / மணி' : 'KL / Hr'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="demand" fill="#94a3b8" name={tamilEnabled ? 'மதிப்பிடப்பட்ட தேவை' : 'Estimated Demand'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="supply" fill="#0284c7" name={tamilEnabled ? 'உண்மையான விநியோகம்' : 'Actual Supplied'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Leakage & Anomaly Trend */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '5. AI குறைபாட்டு மதிப்பெண் (0 = இயல்பு, &gt;70 = தீவிரக் கோளாறு)' : '5. AI Anomaly Score Index (0 = Baseline, &gt;70 = Critical Fault)'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'பல அளவுரு மாற்றங்களின் அடிப்படையில் AI கணக்கிட்ட மதிப்பெண்' : 'Multi-parameter deviation score calculated by AI engine'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              {tamilEnabled ? 'மதிப்பெண் (0-100)' : 'Score (0-100)'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="anomalyScore" stroke="#d97706" strokeWidth={2.5} name={tamilEnabled ? 'குறைபாட்டு மதிப்பெண்' : 'Anomaly Score'} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Village-wise complaint count */}
        <div className="min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tamilEnabled ? '6. ஊராட்சி வாரியான பொதுமக்கள் புகார்கள் மற்றும் தீர்வு விகிதம்' : '6. Village-Wise Citizen Complaints & Resolution Rate'}
              </h3>
              <p className="text-xs text-slate-500">{tamilEnabled ? 'மொத்த புகார்கள் மற்றும் தீர்க்கப்பட்ட புகார்கள்' : 'Total complaints vs resolved records'}</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
              {tamilEnabled ? 'புகார்கள்' : 'Complaints'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="village" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="count" fill="#8b5cf6" name={tamilEnabled ? 'பதிவு செய்யப்பட்டவை' : 'Total Filed'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name={tamilEnabled ? 'தீர்க்கப்பட்டவை' : 'Resolved'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* QUICK VILLAGE STATUS SUMMARY TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {tamilEnabled ? 'கிராம ஊராட்சி குடிநீர் கட்டமைப்பு விரைவு மேலோட்டம்' : 'Gram Panchayat Water Infrastructure Quick Overview'}
            </h3>
            <p className="text-xs text-slate-500">{tamilEnabled ? 'கண்காணிக்கப்படும் 6 கிராமப் பகுதிகளின் நேரடி செயல்பாட்டு நிலை' : 'Live operational status across all 6 monitored village blocks'}</p>
          </div>
          <button
            onClick={() => onNavigate('villages')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>{tamilEnabled ? 'அனைத்து விவரங்களையும் காண்க' : 'View All Details'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="pb-3">{tamilEnabled ? 'ஊராட்சி பெயர்' : 'Village Name'}</th>
                <th className="pb-3">{tamilEnabled ? 'மக்கள் தொகை' : 'Population'}</th>
                <th className="pb-3">{tamilEnabled ? 'நீர்மட்டம்' : 'Storage Level'}</th>
                <th className="pb-3">{tamilEnabled ? 'செயல்படும் மோட்டார்கள்' : 'Active Pumps'}</th>
                <th className="pb-3">{tamilEnabled ? 'விநியோக நிலை' : 'Supply Status'}</th>
                <th className="pb-3">{tamilEnabled ? 'லைன்மேன்' : 'Lineman'}</th>
                <th className="pb-3 text-right">{tamilEnabled ? 'செயல்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villages.map((vil) => (
                <tr key={vil.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">
                    <div>{tamilEnabled ? vil.tamilName || vil.name : vil.name}</div>
                    <div className="text-[10px] font-normal text-slate-400">{tamilEnabled ? vil.district.replace('Madurai', 'மதுரை').replace('Dindigul', 'திண்டுக்கல்').replace('Theni', 'தேனி').replace('District', 'மாவட்டம்').replace('Block', 'வட்டாரம்') : vil.district}</div>
                  </td>
                  <td className="py-3.5 text-slate-600">{vil.population.toLocaleString()} ({vil.householdCount} {tamilEnabled ? 'குடிநீர் இணைப்புகள்' : 'taps'})</td>
                  <td className="py-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-600 h-full rounded-full" 
                          style={{ width: `${vil.currentWaterLevelAvg}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{vil.currentWaterLevelAvg}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-700 font-semibold">{vil.pumpCount} {tamilEnabled ? 'அலகுகள்' : 'units'}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      vil.supplyStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      vil.supplyStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                      vil.supplyStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {tamilEnabled ? (vil.supplyStatus === 'ACTIVE' ? 'செயல்பாட்டில்' : vil.supplyStatus === 'UPCOMING' ? 'விரைவில் தொடங்கும்' : vil.supplyStatus === 'COMPLETED' ? 'நிறைவடைந்தது' : 'தற்காலிகமாக நிறுத்தப்பட்டது') : vil.supplyStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <div>{vil.linemanName}</div>
                    <div className="text-[10px] text-slate-400">{vil.linemanPhone}</div>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onNavigate('iot_monitoring')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      {tamilEnabled ? 'சென்சார்கள்' : 'Sensors'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
