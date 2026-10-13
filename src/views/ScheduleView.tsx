import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, Trash2, Edit2, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import { WaterSchedule, UserRole } from '../types';

interface ScheduleViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentRole,
  tamilEnabled
}) => {
  const [schedules, setSchedules] = useState<WaterSchedule[]>(dataService.schedules);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [villageId, setVillageId] = useState('VIL-01');
  const [zone, setZone] = useState('');
  const [tankName, setTankName] = useState('Melur High-Level OHT-1');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:30');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const sync = () => setSchedules([...dataService.schedules]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const vil = dataService.villages.find(v => v.id === villageId);
    dataService.addSchedule({
      villageId,
      villageName: vil?.name || (tamilEnabled ? 'கிராமம்' : 'Village'),
      zone: zone || (tamilEnabled ? 'மத்திய வார்டு' : 'Central Ward'),
      tankId: 'TNK-01',
      tankName,
      dayOfWeek: 'Daily',
      startTime,
      endTime,
      supplyStatus: 'UPCOMING',
      remarks: remarks || (tamilEnabled ? 'திட்டமிட்ட நீர் விநியோகத் தொகுப்பு' : 'Scheduled supply batch')
    });
    setIsAddModalOpen(false);
    setZone('');
    setRemarks('');
  };

  const handleDelete = (id: string) => {
    if (confirm(tamilEnabled ? 'இந்த நீர் விநியோக நேரத்தை நீக்கவா?' : 'Delete this water supply slot?')) {
      dataService.deleteSchedule(id);
    }
  };

  const handleToggleStatus = (id: string, current: string) => {
    const nextStatus = current === 'ACTIVE_NOW' ? 'COMPLETED' : 'ACTIVE_NOW';
    dataService.updateSchedule(id, { supplyStatus: nextStatus as any });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarClock className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'ஊராட்சி நீர் விநியோகம் மற்றும் நேர அட்டவணை' : 'Panchayat Water Rationing & Schedule Grid'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'குடிநீர் விநியோக நேர அட்டவணை' : 'Water Supply Schedule Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'கிராம நீர் விநியோக நேரங்களைத் திட்டமிட்டு ஒழுங்குபடுத்துங்கள். பொதுமக்கள் இந்த அட்டவணைகளைப் பார்க்கலாம்.' : 'Plan and regulate village water release windows. Citizens can view these timetables publicly.'}
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{tamilEnabled ? 'விநியோக நேரத்தைச் சேர்' : 'Add Supply Window'}</span>
          </button>
        )}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="p-4">{tamilEnabled ? 'அட்டவணை ID' : 'Schedule ID'}</th>
                <th className="p-4">{tamilEnabled ? 'கிராமம்' : 'Village'}</th>
                <th className="p-4">{tamilEnabled ? 'விநியோகப் பகுதி / வார்டு' : 'Distribution Zone / Ward'}</th>
                <th className="p-4">{tamilEnabled ? 'விநியோகத் தொட்டி' : 'Supply Tank'}</th>
                <th className="p-4">{tamilEnabled ? 'நேர இடைவெளி' : 'Timing Window'}</th>
                <th className="p-4">{tamilEnabled ? 'தற்போதைய நிலை' : 'Current Status'}</th>
                <th className="p-4">{tamilEnabled ? 'குறிப்புகள்' : 'Remarks'}</th>
                {currentRole === 'admin' && <th className="p-4 text-right">{tamilEnabled ? 'செயல்கள்' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-cyan-800">{sch.id}</td>
                  <td className="p-4 font-bold text-slate-900">{sch.villageName}</td>
                  <td className="p-4 font-semibold text-slate-700">{sch.zone}</td>
                  <td className="p-4 text-slate-600">{sch.tankName}</td>
                  <td className="p-4 font-mono font-bold text-slate-800">
                    {sch.startTime} - {sch.endTime}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sch.supplyStatus === 'ACTIVE_NOW' ? 'bg-emerald-100 text-emerald-800' :
                      sch.supplyStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                      sch.supplyStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {tamilEnabled ? ({ ACTIVE_NOW: 'தற்போது செயலில்', UPCOMING: 'வரவிருக்கிறது', COMPLETED: 'நிறைவு', DELAYED: 'தாமதம்', SUSPENDED: 'தற்காலிகமாக நிறுத்தப்பட்டது' }[sch.supplyStatus] || sch.supplyStatus.replace(/_/g, ' ')) : sch.supplyStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs">{sch.remarks}</td>
                  {currentRole === 'admin' && (
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(sch.id, sch.supplyStatus)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        {tamilEnabled ? (sch.supplyStatus === 'ACTIVE_NOW' ? 'நிறைவுசெய்' : 'இப்போது விநியோகி') : (sch.supplyStatus === 'ACTIVE_NOW' ? 'Mark Done' : 'Supply Now')}
                      </button>
                      <button
                        onClick={() => handleDelete(sch.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        title={tamilEnabled ? 'நேரத்தை நீக்கு' : 'Delete slot'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">{tamilEnabled ? 'நீர் விநியோக நேரத்தைச் சேர்' : 'Add Water Supply Slot'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'கிராம ஊராட்சி:' : 'Village Panchayat:'}</label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {dataService.villages.map(v => (
                    <option key={v.id} value={v.id}>{tamilEnabled && v.tamilName ? v.tamilName : v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'விநியோகப் பகுதி / வார்டு:' : 'Distribution Zone / Ward:'}</label>
                <input
                  type="text"
                  required
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder={tamilEnabled ? 'எ.கா. பகுதி 2 - கோவில் வார்டு' : 'e.g. Zone 2 - Temple Ward'}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'மேல்நிலைத் தொட்டி / சம்ப்:' : 'Overhead Tank / Sump:'}</label>
                <input
                  type="text"
                  required
                  value={tankName}
                  onChange={(e) => setTankName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'தொடக்க நேரம் (HH:mm):' : 'Start Time (HH:mm):'}</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'முடிவு நேரம் (HH:mm):' : 'End Time (HH:mm):'}</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'குறிப்புகள்:' : 'Remarks / Note:'}</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={tamilEnabled ? 'எ.கா. காலை உயர் அழுத்த விநியோகம்' : 'e.g. High pressure morning batch'}
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
                  {tamilEnabled ? 'அட்டவணையைச் சேர்' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
