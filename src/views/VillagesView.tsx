import React, { useState, useEffect } from 'react';
import { Building2, Users, Droplet, Phone, Plus, MapPin, ExternalLink, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Village, UserRole } from '../types';

interface VillagesViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
  onNavigate: (viewId: string) => void;
}

export const VillagesView: React.FC<VillagesViewProps> = ({
  currentRole,
  tamilEnabled,
  onNavigate
}) => {
  const [villages, setVillages] = useState<Village[]>(dataService.villages);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [population, setPopulation] = useState(3500);
  const [households, setHouseholds] = useState(720);
  const [linemanName, setLinemanName] = useState('');
  const [linemanPhone, setLinemanPhone] = useState('');
  const [president, setPresident] = useState('');

  useEffect(() => {
    const sync = () => setVillages([...dataService.villages]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleAddVillage = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.addVillage({
      name,
      tamilName: tamilName || name,
      district: tamilEnabled ? 'கோயம்புத்தூர் மாவட்டம் (கிராம ஊராட்சி)' : 'Coimbatore District (Gram Panchayat)',
      population,
      householdCount: households,
      tankCount: 1,
      pumpCount: 1,
      currentWaterLevelAvg: 75,
      waterSuppliedTodayLiters: 110000,
      dailyDemandLiters: 140000,
      supplyStatus: 'UPCOMING',
      linemanName: linemanName || (tamilEnabled ? 'ஊராட்சி இயக்குநர்' : 'Panchayat Operator'),
      linemanPhone: linemanPhone || '+91 94432 00000',
      panchayatPresident: president || (tamilEnabled ? 'தேர்ந்தெடுக்கப்பட்ட தலைவர்' : 'Elected President'),
      distributionZones: ['Zone 1 - Main Village']
    });
    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'ஊராட்சி குடியிருப்புகள் மற்றும் நீர் சொத்துகள்' : 'Panchayat Habitations & Water Assets'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'ஊராட்சிகள் மற்றும் கிராமங்கள் மேலாண்மை' : 'Village Panchayat Directory'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'கண்காணிக்கப்படும் கிராமக் குடியிருப்புகள், மேல்நிலை நீர்த்தேக்கங்கள், குழாய்கள் மற்றும் களப்பணியாளர்களின் கண்ணோட்டம்.' : 'Overview of monitored village habitations, overhead reservoirs, pipelines, and field linemen.'}
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{tamilEnabled ? 'குடியிருப்பைச் சேர்' : 'Add Habitation'}</span>
          </button>
        )}
      </div>

      {/* Villages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {villages.map((vil) => (
          <div 
            key={vil.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                    {vil.id}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    {tamilEnabled && vil.tamilName ? vil.tamilName : vil.name}
                  </h3>
                  <p className="text-xs text-slate-500">{vil.district}</p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  vil.supplyStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                  vil.supplyStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                  vil.supplyStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {tamilEnabled ? ({ ACTIVE: 'செயலில்', UPCOMING: 'வரவிருக்கிறது', COMPLETED: 'நிறைவு', DELAYED: 'தாமதம்', SUSPENDED: 'தற்காலிகமாக நிறுத்தப்பட்டது' }[vil.supplyStatus] || vil.supplyStatus) : vil.supplyStatus}
                </span>
              </div>

              {/* Water Level Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>{tamilEnabled ? 'நீர்த்தேக்க அளவு:' : 'Reservoir Capacity:'}</span>
                  <span className="font-mono text-cyan-800">{vil.currentWaterLevelAvg}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-600 h-full rounded-full" 
                    style={{ width: `${vil.currentWaterLevelAvg}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'மக்கள்தொகை' : 'Population'}</span>
                  <span className="font-bold text-slate-800">{vil.population.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'குழாய் இணைப்புகள்' : 'Tap Connections'}</span>
                  <span className="font-bold text-slate-800">{vil.householdCount} {tamilEnabled ? 'குழாய்கள்' : 'taps'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'தொட்டிகள் / பம்புகள்' : 'Tanks / Pumps'}</span>
                  <span className="font-bold text-slate-800">{vil.tankCount} / {vil.pumpCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'தினசரி தேவை' : 'Daily Demand'}</span>
                  <span className="font-bold text-slate-800">{Math.round(vil.dailyDemandLiters / 1000)} KL</span>
                </div>
              </div>

              {/* Lineman */}
              <div className="text-xs text-slate-600 space-y-0.5">
                <div className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{tamilEnabled ? 'களப்பணியாளர்:' : 'Lineman:'} {vil.linemanName}</span>
                </div>
                <div className="text-slate-500 pl-5">{vil.linemanPhone}</div>
                <div className="text-[11px] text-slate-400 pl-5">{vil.panchayatPresident}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {vil.distributionZones.length} {tamilEnabled ? 'விநியோகப் பகுதிகள்' : 'Distribution Zones'}
              </span>
              <button
                onClick={() => onNavigate('iot_monitoring')}
                className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center space-x-1"
              >
                <span>{tamilEnabled ? 'நேரடி உணரிகள்' : 'Live Sensors'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD VILLAGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">{tamilEnabled ? 'குடியிருப்பு / கிராமத்தைச் சேர்' : 'Add Habitation / Village'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVillage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'கிராமத்தின் பெயர் (ஆங்கிலம்):' : 'Village Name (English):'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tamilEnabled ? 'எ.கா. Vadakkalur' : 'e.g. Vadakkalur'}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'தமிழ்ப் பெயர் (விருப்பத்தேர்வு):' : 'Tamil Name (Optional):'}</label>
                <input
                  type="text"
                  value={tamilName}
                  onChange={(e) => setTamilName(e.target.value)}
                  placeholder={tamilEnabled ? 'எ.கா. வடக்கலூர்' : 'e.g. வடக்கலூர்'}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'மக்கள்தொகை:' : 'Population:'}</label>
                  <input
                    type="number"
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'வீட்டுக் குழாய் இணைப்புகள்:' : 'Household Taps:'}</label>
                  <input
                    type="number"
                    value={households}
                    onChange={(e) => setHouseholds(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'களப்பணியாளர் பெயர்:' : 'Lineman Name:'}</label>
                  <input
                    type="text"
                    value={linemanName}
                    onChange={(e) => setLinemanName(e.target.value)}
                    placeholder={tamilEnabled ? 'எ.கா. K. Senthil' : 'e.g. K. Senthil'}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'களப்பணியாளர் தொலைபேசி:' : 'Lineman Phone:'}</label>
                  <input
                    type="tel"
                    value={linemanPhone}
                    onChange={(e) => setLinemanPhone(e.target.value)}
                    placeholder="+91 94432..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'ஊராட்சித் தலைவர் / செயலாளர்:' : 'Panchayat President / Secretary:'}</label>
                <input
                  type="text"
                  value={president}
                  onChange={(e) => setPresident(e.target.value)}
                  placeholder={tamilEnabled ? 'எ.கா. Smt. K. Valli (President)' : 'e.g. Smt. K. Valli (President)'}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {tamilEnabled ? 'ரத்து செய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold"
                >
                  {tamilEnabled ? 'குடியிருப்பைச் சேமி' : 'Save Habitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
