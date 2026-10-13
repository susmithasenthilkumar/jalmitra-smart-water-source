import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  Battery, 
  Zap, 
  Gauge, 
  Droplets, 
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { SensorItem, SensorState, SensorType, UserRole } from '../types';

interface SensorsViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
  onNavigate: (viewId: string) => void;
}

export const SensorsView: React.FC<SensorsViewProps> = ({
  currentRole,
  tamilEnabled,
  onNavigate
}) => {
  const [sensors, setSensors] = useState<SensorItem[]>(() => dataService.sensors || []);
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setSensors([...dataService.sensors]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const villages = dataService.villages;
  const sensorTypeLabel = (type: SensorType) => tamilEnabled
    ? ({
        ultrasonic_level: 'தொட்டி மீயொலி நீர்மட்டம்', pressure: 'குழாய் அழுத்தம்',
        inlet_flow: 'உள்வரும் ஓட்டமானி', outlet_flow: 'வெளியேறும் ஓட்டமானி',
        pump_current: 'பம்ப் மின்னோட்டம் (CT)', water_quality: 'நீர்த் தரம் மற்றும் குடிநீர்த் தகுதி'
      }[type])
    : ({
        ultrasonic_level: 'Ultrasonic Tank Level', pressure: 'Pipeline Pressure',
        inlet_flow: 'Inlet Flow Meter', outlet_flow: 'Outlet Flow Meter',
        pump_current: 'Pump Current (CT)', water_quality: 'Water Quality Potability'
      }[type]);

  // Filter logic
  const filteredSensors = sensors.filter(s => {
    const matchVillage = selectedVillage === 'ALL' || s.villageId === selectedVillage;
    const matchType = selectedType === 'ALL' || s.type === selectedType;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    const matchSearch = searchQuery === '' || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.villageName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchVillage && matchType && matchStatus && matchSearch;
  });

  // KPI calculations
  const totalSensors = sensors.length;
  const normalSensors = sensors.filter(s => s.status === 'normal').length;
  const warningOrContaminated = sensors.filter(s => s.status === 'warning' || s.status === 'contaminated').length;
  const criticalSensors = sensors.filter(s => s.status === 'critical' || s.status === 'offline').length;
  const avgReliability = totalSensors > 0 
    ? Math.round(sensors.reduce((acc, s) => acc + (s.reliabilityPercent || 0), 0) / totalSensors) 
    : 92;

  const handleRunDiagnostic = (sensor: SensorItem) => {
    setDiagnosingId(sensor.id);
    setDiagnosticResult(null);
    setTimeout(() => {
      setDiagnosingId(null);
      setDiagnosticResult(
        tamilEnabled 
          ? `சென்சார் [${sensor.id}] பரிசோதனை நிறைவு: சிக்னல் தரம் 98%, சறுக்கல் 0.2%, மின்சாரம் 3.31V வழக்கமானது.`
          : `Diagnostic Check for [${sensor.id}]: RSSI -68 dBm (Optimal), Calibration Drift 0.2%, Node Supply 3.31V Nominal.`
      );
    }, 900);
  };

  const handleRecalibrate = (sensorId: string) => {
    dataService.sensors = dataService.sensors.map(s => {
      if (s.id === sensorId) {
        return {
          ...s,
          status: 'normal',
          reliabilityPercent: 98,
          lastUpdated: 'Just now'
        };
      }
      return s;
    });
    setSensors([...dataService.sensors]);
    setDiagnosticResult(
      tamilEnabled
        ? `சென்சார் [${sensorId}] பூஜ்ஜியப் புள்ளி அளவுத்திருத்தம் (Zero-Point Calibration) வெற்றிகரமாக மீட்டமைக்கப்பட்டது.`
        : `Sensor [${sensorId}] zero-point reference baseline re-calibrated successfully.`
    );
  };

  const getStatusBadge = (status: SensorState) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{tamilEnabled ? 'இயல்பு நிலை' : 'Normal / Healthy'}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{tamilEnabled ? 'எச்சரிக்கை' : 'Warning'}</span>
          </span>
        );
      case 'contaminated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300 animate-pulse">
            <Wrench className="w-3 h-3 text-amber-700" />
            <span>{tamilEnabled ? 'தூய்மை தேவை / மாசு' : 'Fouling Detected'}</span>
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>{tamilEnabled ? 'ஆபத்து நிலை' : 'Critical Fault'}</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Radio className="w-3 h-3 text-slate-500" />
            <span>{tamilEnabled ? 'இணைப்பு இல்லை' : 'Offline'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: SensorType) => {
    switch (type) {
      case 'ultrasonic_level':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-indigo-600" />;
      case 'inlet_flow':
      case 'outlet_flow':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'pump_current':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'water_quality':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'IoT சென்சார் வலைப்பின்னல் கண்டறிதல் மையம்' : 'IoT Sensor Network Diagnostic Hub'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'சென்சார்கள் ஆரோக்கியம் & கண்காணிப்பு மையம்' : 'Sensors Health & Network Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'ஊராட்சிகள் முழுவதும் மீயொலி சென்சார்கள், ஓட்டமானிகள், அழுத்த உணரிகள் மற்றும் நீர்த் தரத் தொலைஅளவீடுகள் நிகழ்நேரத்தில் கண்காணிக்கப்படுகின்றன.' : 'Real-time ultrasonic transducers, flow meters, pressure cells, and water quality telemetry across Gram Panchayats.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('self_maintenance')}
            className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{tamilEnabled ? 'சுய-பராமரிப்பு தொகுதி' : 'Self-Maintenance Module'}</span>
          </button>
          <button
            onClick={() => {
              dataService.injectFault('SENSOR_DIRT');
              setSensors([...dataService.sensors]);
            }}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all"
            title={tamilEnabled ? 'சென்சாரில் அழுக்கு படிவதை உருவகப்படுத்து' : 'Simulate Dirt Fouling'}
          >
            {tamilEnabled ? '+ அழுக்கு படிவு உருவகப்படுத்தல்' : '+ Dirt Simulation'}
          </button>
        </div>
      </div>

      {/* KPI METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{tamilEnabled ? 'மொத்த சென்சார்கள்' : 'Active Sensor Nodes'}</span>
            <Radio className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalSensors} {tamilEnabled ? 'முனைகள்' : 'Nodes'}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">{tamilEnabled ? '100% செல்லுலார்/LoRa வலைப்பின்னலுடன் இணைப்பு' : '100% Cellular/LoRa Mesh Connected'}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{tamilEnabled ? 'சராசரி நம்பகத்தன்மை' : 'Average Reliability'}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{avgReliability}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'AI ஒலியியல் SNR மற்றும் சறுக்கல் பகுப்பாய்வு' : 'AI acoustic SNR & drift analysis'}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{tamilEnabled ? 'இயல்பு நிலையில் உள்ளவை' : 'Optimal Health'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{normalSensors} / {totalSensors}</div>
          <div className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'சறுக்கல் இல்லை; அளவுத்திருத்தம் செய்யப்பட்டது' : 'Zero zero-drift, calibrated'}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{tamilEnabled ? 'கவனம் தேவைப்படுபவை' : 'Requires Attention'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{warningOrContaminated + criticalSensors}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">{tamilEnabled ? '1 மாசடைந்தது, 1 அழுத்த மாறுபாடு' : '1 fouling, 1 pressure variance'}</div>
        </div>
      </div>

      {/* DIAGNOSTIC POPUP NOTICE IF PRESENT */}
      {diagnosticResult && (
        <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{diagnosticResult}</span>
          </div>
          <button 
            onClick={() => setDiagnosticResult(null)}
            className="text-cyan-700 hover:text-cyan-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tamilEnabled ? 'சென்சார் ஐடி அல்லது பெயர் தேடவும்...' : 'Search sensor ID, node, tank...'}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Village */}
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium"
          >
            <option value="ALL">{tamilEnabled ? 'அனைத்து ஊராட்சிகள்' : 'All Villages'}</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium"
          >
            <option value="ALL">{tamilEnabled ? 'அனைத்து வகைகள்' : 'All Sensor Types'}</option>
            <option value="ultrasonic_level">{sensorTypeLabel('ultrasonic_level')}</option>
            <option value="pressure">{sensorTypeLabel('pressure')}</option>
            <option value="inlet_flow">{sensorTypeLabel('inlet_flow')}</option>
            <option value="outlet_flow">{sensorTypeLabel('outlet_flow')}</option>
            <option value="pump_current">{sensorTypeLabel('pump_current')}</option>
            <option value="water_quality">{sensorTypeLabel('water_quality')}</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium"
          >
            <option value="ALL">{tamilEnabled ? 'அனைத்து நிலைகள்' : 'All Statuses'}</option>
            <option value="normal">{tamilEnabled ? 'இயல்பு நிலை (சீரானது)' : 'Normal (Healthy)'}</option>
            <option value="warning">{tamilEnabled ? 'எச்சரிக்கை' : 'Warning'}</option>
            <option value="contaminated">{tamilEnabled ? 'மாசு கண்டறியப்பட்டது' : 'Fouling Detected'}</option>
            <option value="critical">{tamilEnabled ? 'மிகத் தீவிரம்' : 'Critical'}</option>
          </select>
        </div>
      </div>

      {/* SENSORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSensors.map(sensor => {
          const isFouled = sensor.status === 'contaminated';
          const isWarning = sensor.status === 'warning';
          const isCritical = sensor.status === 'critical';

          return (
            <div 
              key={sensor.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                isFouled ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10' :
                isCritical ? 'border-rose-300 ring-2 ring-rose-400/20 bg-rose-50/10' :
                isWarning ? 'border-amber-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: ID + Type + Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-slate-100">
                      {getTypeIcon(sensor.type)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {sensor.id}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {sensor.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  {getStatusBadge(sensor.status)}
                </div>

                {/* Village & Tank Location */}
                <div className="bg-slate-50 rounded-2xl p-3 mb-4 space-y-1 text-xs border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">{tamilEnabled ? 'கிராமம்:' : 'Village:'}</span>
                    <span className="font-semibold text-slate-800">{sensor.villageName}</span>
                  </div>
                  {sensor.tankName && (
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">{tamilEnabled ? 'நீர்த்தேக்கம்:' : 'Reservoir:'}</span>
                      <span className="font-medium text-slate-700">{sensor.tankName}</span>
                    </div>
                  )}
                </div>

                {/* Telemetry Reading */}
                <div className="p-4 rounded-2xl bg-cyan-950 text-white mb-4">
                  <div className="text-[11px] text-cyan-300 font-semibold mb-1 flex justify-between">
                    <span>{tamilEnabled ? 'நேரலை தொலைஅளவீட்டு மதிப்பு' : 'Live Telemetry Value'}</span>
                    <span className="text-slate-400 font-normal">{tamilEnabled ? 'வரம்பு:' : 'Range:'} {sensor.normalRange[0]} - {sensor.normalRange[1]} {sensor.unit}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black font-mono tracking-tight text-white">
                      {sensor.currentValue}
                    </span>
                    <span className="text-sm font-bold text-cyan-300">{sensor.unit}</span>
                  </div>
                </div>

                {/* Sensor Health Metrics */}
                <div className="space-y-2 mb-4 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-500">{tamilEnabled ? 'கண்டறிதல் நம்பகத்தன்மை' : 'Diagnostic Reliability'}</span>
                      <span className={sensor.reliabilityPercent < 75 ? 'text-amber-600 font-extrabold' : 'text-emerald-600'}>
                        {sensor.reliabilityPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          sensor.reliabilityPercent < 75 ? 'bg-amber-500' :
                          sensor.reliabilityPercent < 90 ? 'bg-cyan-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${sensor.reliabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-cyan-600" />
                      <span>RSSI: -68 dBm</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Battery className="w-3 h-3 text-emerald-600" />
                      <span>{tamilEnabled ? 'மின்வழங்கல்: 3.32 V' : 'Supply: 3.32 V'}</span>
                    </div>
                  </div>

                  {sensor.lastCleanedAt && (
                    <div className="text-[10px] text-slate-400 italic">
                      {tamilEnabled ? 'கடைசி துடைப்பான் தூய்மை:' : 'Last Wiper Clean:'} {sensor.lastCleanedAt}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {sensor.cleaningMechanismAvailable && (
                  <button
                    onClick={() => onNavigate('self_maintenance')}
                    className="flex-1 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-cyan-700" />
                    <span>{isFouled ? (tamilEnabled ? 'சுத்தம் செய்' : 'Wiper Clean') : (tamilEnabled ? 'சுய-பராமரிப்பு' : 'Self-Clean')}</span>
                  </button>
                )}

                <button
                  onClick={() => handleRunDiagnostic(sensor)}
                  disabled={diagnosingId === sensor.id}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1 disabled:opacity-50"
                  title={tamilEnabled ? 'கண்டறிதல் சோதனையை இயக்கு' : 'Run Diagnostic Ping'}
                >
                  <RefreshCw className={`w-3 h-3 text-slate-600 ${diagnosingId === sensor.id ? 'animate-spin' : ''}`} />
                  <span>{tamilEnabled ? 'பரிசோதி' : 'Ping'}</span>
                </button>

                <button
                  onClick={() => handleRecalibrate(sensor.id)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                  title={tamilEnabled ? 'பூஜ்ஜியப் புள்ளி அடிப்படை அளவுத்திருத்தம்' : 'Zero-point baseline calibrate'}
                >
                  {tamilEnabled ? 'அளவுத்திருத்து' : 'Calibrate'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
