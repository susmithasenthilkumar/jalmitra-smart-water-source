import React, { useState, useEffect } from 'react';
import { Database, Droplet, ArrowUp, ArrowDown, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { TankItem, UserRole } from '../types';

interface TanksViewProps {
  tamilEnabled: boolean;
  onNavigate: (viewId: string) => void;
}

export const TanksView: React.FC<TanksViewProps> = ({
  tamilEnabled,
  onNavigate
}) => {
  const [tanks, setTanks] = useState<TankItem[]>(dataService.tanks);

  useEffect(() => {
    const sync = () => setTanks([...dataService.tanks]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'மேல்நிலை நீர்த்தேக்கங்கள் (OHT) மற்றும் தரைமட்ட நீர்த்தேக்கங்கள் (GLSR)' : 'Overhead Reservoirs (OHT) & Ground Level Sumps (GLSR)'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'நீர்த் தொட்டிகள் மற்றும் சேமிப்பு நிலவரம்' : 'Water Storage Reservoirs & Tanks'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'நிகழ்நேர அல்ட்ராசோனிக் நீர்மட்ட அளவீடு, மீதமுள்ள சேமிப்பு அளவு மற்றும் விநியோக அழுத்த உயரம்.' : 'Real-time ultrasonic water level telemetry, residual storage volume, and supply head.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('self_maintenance')}
          className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{tamilEnabled ? 'அல்ட்ராசோனிக் உணரியின் நிலை' : 'Ultrasonic Sensor Health'}</span>
        </button>
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tanks.map((tank) => {
          const isLow = tank.currentLevelPercent < 25;
          const isHigh = tank.currentLevelPercent > 90;

          return (
            <div 
              key={tank.id}
              className={`rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
                isLow ? 'bg-rose-50/20 border-rose-300' :
                isHigh ? 'bg-cyan-50/20 border-cyan-300' :
                'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tank.id} • {tank.tankType ? (tamilEnabled ? ({ 'Overhead Tank': 'மேல்நிலைத் தொட்டி', 'Ground Level Sump': 'தரைமட்ட நீர்த்தேக்கம்' }[tank.tankType] || tank.tankType) : tank.tankType) : (tamilEnabled ? 'மேல்நிலைத் தொட்டி' : 'Overhead Tank')}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {tank.name}
                    </h3>
                    <p className="text-xs text-slate-500">{tank.villageName}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tank.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800' :
                    tank.status === 'REFILLING' ? 'bg-cyan-100 text-cyan-800' :
                    tank.status === 'LOW' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {tamilEnabled ? ({ OPTIMAL: 'சீரான நிலை', REFILLING: 'நிரப்பப்படுகிறது', LOW: 'குறைவு', CRITICAL: 'மிக அவசரம்', MAINTENANCE: 'பராமரிப்பில்' }[tank.status] || tank.status) : tank.status}
                  </span>
                </div>

                {/* Primary Water Level Gauge */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-3xl font-black font-mono text-slate-900">
                      {tank.currentLevelPercent}%
                    </span>
                    <span className="text-xs font-bold text-cyan-800">
                      {Math.round(tank.currentLevelLiters / 1000)} / {Math.round(tank.capacityLiters / 1000)} KL
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        tank.currentLevelPercent > 60 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                        tank.currentLevelPercent > 25 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        'bg-gradient-to-r from-rose-500 to-red-600'
                      }`}
                      style={{ width: `${tank.currentLevelPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>{tamilEnabled ? 'காலி: 0%' : 'Staging: Empty'}</span>
                    <span>{tamilEnabled ? 'இயல்பானது: 40-85%' : 'Nominal: 40-85%'}</span>
                    <span>{tamilEnabled ? 'நிரம்பி வழிதல்: 95%' : 'Overflow: 95%'}</span>
                  </div>
                </div>

                {/* Flow Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-2xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] flex items-center space-x-1">
                      <ArrowUp className="w-3 h-3 text-emerald-500" />
                      <span>{tamilEnabled ? 'உள்வரும் நீரோட்டம்' : 'Inlet Inflow'}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {tank.inletFlowLpm} <span className="text-[10px] text-slate-400">LPM</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] flex items-center space-x-1">
                      <ArrowDown className="w-3 h-3 text-cyan-500" />
                      <span>{tamilEnabled ? 'விநியோகம்' : 'Distribution'}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {tank.outletFlowLpm} <span className="text-[10px] text-slate-400">LPM</span>
                    </span>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{tamilEnabled ? 'உயரம்:' : 'Height:'} {tank.heightMeters}m</span>
                <span className="font-mono">{tamilEnabled ? 'புதுப்பிக்கப்பட்டது:' : 'Updated:'} {tank.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
