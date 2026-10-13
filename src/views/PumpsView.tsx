import React, { useState, useEffect } from 'react';
import { Cpu, Power, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { dataService } from '../services/dataService';
import { PumpItem, UserRole } from '../types';

interface PumpsViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const PumpsView: React.FC<PumpsViewProps> = ({
  currentRole,
  tamilEnabled
}) => {
  const [pumps, setPumps] = useState<PumpItem[]>(dataService.pumps);

  useEffect(() => {
    const sync = () => setPumps([...dataService.pumps]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleTogglePump = (id: string, currentStatus: string) => {
    if (currentRole === 'public') return;
    const nextStatus = currentStatus === 'RUNNING' ? 'STOPPED' : 'RUNNING';
    dataService.updatePumpStatus(id, nextStatus as any);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'ஆழ்துளைக் கிணறு நீர்மூழ்கி மற்றும் பூஸ்டர் பம்ப் நிலையங்கள்' : 'Borewell Submersible & Booster Pump Stations'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'மோட்டார்கள் மற்றும் பம்பிங் நிலையங்கள்' : 'Pump Stations & Energy Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'தொலைநிலை அளவீடு, மோட்டார் மின்னோட்டம், நீரின்றி இயங்குவதைத் தடுக்கும் பாதுகாப்பு மற்றும் டிரிப் கண்காணிப்பு.' : 'Remote telemetry, motor current draw, dry-run protection, and trip monitoring.'}
          </p>
        </div>

        {currentRole === 'public' && (
          <div className="text-xs bg-slate-100 text-slate-600 px-3.5 py-2 rounded-xl font-semibold">
            {tamilEnabled ? 'பொதுப் பார்வை மட்டும் (பம்புகளை இயக்க உள்நுழைய வேண்டும்)' : 'Public View Only (Login required to toggle pumps)'}
          </div>
        )}
      </div>

      {/* Pumps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pumps.map((pump) => {
          const isRunning = pump.status === 'RUNNING';
          const isTripped = pump.status === 'TRIPPED';

          return (
            <div 
              key={pump.id}
              className={`rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
                isTripped ? 'bg-rose-50/30 border-rose-300' :
                isRunning ? 'bg-emerald-50/20 border-emerald-300' :
                'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {pump.id} • {pump.powerHp} HP
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {pump.name}
                    </h3>
                    <p className="text-xs text-slate-500">{pump.villageName} • {pump.sourceWell || (tamilEnabled ? 'ஆழ்துளைக் கிணறு நிலையம்' : 'Borewell Station')}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isRunning ? 'bg-emerald-100 text-emerald-800' :
                    isTripped ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {tamilEnabled ? ({ RUNNING: 'இயங்குகிறது', STOPPED: 'நிறுத்தப்பட்டது', TRIPPED: 'டிரிப் ஏற்பட்டது', MAINTENANCE: 'பராமரிப்பில்' }[pump.status] || pump.status) : pump.status}
                  </span>
                </div>

                {/* Electrical Telemetry */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'மோட்டார் மின்னோட்டம்' : 'Motor Current'}</span>
                    <span className="font-mono font-bold text-slate-900 text-lg">
                      {pump.currentAmps} <span className="text-xs text-slate-500 font-normal">A</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'இயக்க மின்னழுத்தம்' : 'Active Voltage'}</span>
                    <span className="font-mono font-bold text-slate-900 text-lg">
                      {pump.voltageV || 415} <span className="text-xs text-slate-500 font-normal">V</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'நீர் வெளியேற்ற விகிதம்' : 'Discharge Rate'}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {pump.flowRateLpm || 240} LPM
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'இன்றைய இயக்க நேரம்' : 'Runtime Today'}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {pump.runtimeTodayHours} {tamilEnabled ? 'மணி' : 'hrs'}
                    </span>
                  </div>
                </div>

                {/* Dry Run Protection Indicator */}
                <div className="flex items-center space-x-2 text-xs mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600 font-medium">{tamilEnabled ? 'தானியங்கி நீரின்றி இயங்குதல் நிறுத்தம்: செயலில்' : 'Automatic Dry-Run Cutoff: Active'}</span>
                </div>
              </div>

              {/* Pump Control Button */}
              {currentRole !== 'public' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Node: ESP32-RLY-0{pump.id.slice(-1)}
                  </span>
                  <button
                    onClick={() => handleTogglePump(pump.id, pump.status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors ${
                      isRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{tamilEnabled ? (isRunning ? 'பம்பை நிறுத்து' : 'பம்பைத் தொடங்கு') : (isRunning ? 'Stop Pump' : 'Start Pump')}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
