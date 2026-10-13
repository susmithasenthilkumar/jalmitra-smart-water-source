import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, UserCheck, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import { MaintenanceRecord, UserRole } from '../types';

interface MaintenanceViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  currentRole,
  tamilEnabled
}) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>(dataService.maintenance);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [equipmentId, setEquipmentId] = useState('PMP-01');
  const [equipmentType, setEquipmentType] = useState<MaintenanceRecord['equipmentType']>('Submersible Pump');
  const [villageName, setVillageName] = useState('Melur Gram Panchayat');
  const [problem, setProblem] = useState('');
  const [priority, setPriority] = useState<MaintenanceRecord['priority']>('HIGH');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('2026-09-24');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const sync = () => setRecords([...dataService.maintenance]);
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.addMaintenanceRecord({
      equipmentId,
      equipmentType,
      villageId: 'VIL-01',
      villageName,
      problem,
      priority,
      assignedStaff: assignedStaff || (tamilEnabled ? 'களப்பணியாளர்' : 'Field Lineman'),
      staffPhone: staffPhone || '+91 94432 00000',
      startDate: new Date().toISOString().slice(0, 10),
      expectedCompletion,
      status: 'Assigned',
      remarks
    });
    setIsAddModalOpen(false);
    setProblem('');
    setRemarks('');
  };

  const handleUpdateStatus = (id: string, status: MaintenanceRecord['status']) => {
    dataService.updateMaintenanceStatus(id, status);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'உள்கட்டமைப்பு சொத்து பராமரிப்பு மற்றும் களப் பணி ஆணைகள்' : 'Infrastructure Asset Maintenance & Field Work Orders'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'பராமரிப்பு மற்றும் பழுது நீக்கும் பணிகள்' : 'Maintenance Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'ஆழ்துளைக் கிணறுகள், மேல்நிலைத் தொட்டிகள், ஓட்ட உணரிகள் மற்றும் விநியோகக் குழாய்களின் பழுதுபார்ப்பைக் கண்காணிக்கவும்.' : 'Track repairs for borewells, overhead tanks, flow sensors, and distribution pipelines.'}
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{tamilEnabled ? 'பராமரிப்புப் பணியை உருவாக்கு' : 'Create Maintenance Job'}</span>
          </button>
        )}
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((rec) => {
          const isCritical = rec.priority === 'CRITICAL';
          const isDone = rec.status === 'Completed';

          return (
            <div 
              key={rec.id}
              className={`p-6 rounded-3xl border shadow-xs transition-all flex flex-col justify-between ${
                isDone ? 'bg-slate-50 border-slate-200 opacity-90' :
                isCritical ? 'bg-rose-50/20 border-rose-300' :
                'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {rec.id} • {rec.equipmentId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {tamilEnabled ? ({ 'Submersible Pump': 'நீர்மூழ்கி பம்ப்', 'Overhead Tank': 'மேல்நிலைத் தொட்டி', 'Ultrasonic Sensor': 'அல்ட்ராசோனிக் உணரி', 'Flow Meter': 'ஓட்ட அளவீட்டுக் கருவி', 'Distribution Pipeline': 'விநியோகக் குழாய்', 'Sluice Valve': 'நீர்வாயில் வால்வு' }[rec.equipmentType] || rec.equipmentType) : rec.equipmentType} - {rec.villageName}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      rec.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      rec.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tamilEnabled ? ({ CRITICAL: 'மிக அவசரம்', HIGH: 'உயர்', MEDIUM: 'நடுத்தரம்', LOW: 'குறைவு' }[rec.priority] || rec.priority) : rec.priority}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      rec.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      rec.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tamilEnabled ? ({ Pending: 'நிலுவையில்', Assigned: 'ஒதுக்கப்பட்டது', 'In Progress': 'நடைபெறுகிறது', Completed: 'நிறைவு' }[rec.status] || rec.status) : rec.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed">
                  <strong>{tamilEnabled ? 'பிரச்சினை:' : 'Problem:'}</strong> {rec.problem}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'ஒதுக்கப்பட்ட களப்பணியாளர்' : 'Assigned Lineman'}</span>
                    <span className="font-semibold text-slate-800">{rec.assignedStaff}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'எதிர்பார்க்கப்படும் நிறைவு தேதி' : 'Expected Target'}</span>
                    <span className="font-mono text-slate-700">{rec.expectedCompletion}</span>
                  </div>
                </div>

                {rec.remarks && (
                  <p className="text-[11px] text-slate-600 italic mb-2">
                    {tamilEnabled ? 'குறிப்பு:' : 'Note:'} {rec.remarks}
                  </p>
                )}
              </div>

              {/* Status Update Strip for Staff */}
              {currentRole !== 'public' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">{tamilEnabled ? 'நிலையைப் புதுப்பிக்கவும்:' : 'Update Status:'}</span>
                  <div className="flex space-x-1">
                    {(['Pending', 'In Progress', 'Completed'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(rec.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          rec.status === st
                            ? 'bg-cyan-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tamilEnabled ? ({ Pending: 'நிலுவையில்', 'In Progress': 'நடைபெறுகிறது', Completed: 'நிறைவு' }[st]) : st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* CREATE MAINTENANCE JOB MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">{tamilEnabled ? 'பராமரிப்புப் பணி ஆணையை உருவாக்கு' : 'Create Maintenance Work Order'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'உபகரண ID:' : 'Equipment ID:'}</label>
                  <input
                    type="text"
                    required
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    placeholder={tamilEnabled ? 'எ.கா. PMP-06' : 'e.g. PMP-06'}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'உபகரண வகை:' : 'Equipment Type:'}</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Submersible Pump">{tamilEnabled ? 'நீர்மூழ்கி பம்ப்' : 'Submersible Pump'}</option>
                    <option value="Overhead Tank">{tamilEnabled ? 'மேல்நிலைத் தொட்டி' : 'Overhead Tank'}</option>
                    <option value="Ultrasonic Sensor">{tamilEnabled ? 'அல்ட்ராசோனிக் உணரி' : 'Ultrasonic Sensor'}</option>
                    <option value="Flow Meter">{tamilEnabled ? 'ஓட்ட அளவீட்டுக் கருவி' : 'Flow Meter'}</option>
                    <option value="Distribution Pipeline">{tamilEnabled ? 'விநியோகக் குழாய்' : 'Distribution Pipeline'}</option>
                    <option value="Sluice Valve">{tamilEnabled ? 'நீர்வாயில் வால்வு' : 'Sluice Valve'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'கிராமம்:' : 'Village:'}</label>
                <input
                  type="text"
                  required
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'பிரச்சினை விவரம்:' : 'Problem Description:'}</label>
                <textarea
                  rows={2}
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={tamilEnabled ? 'பிரச்சினையை விவரிக்கவும்...' : 'Describe the issue...'}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'முன்னுரிமை:' : 'Priority:'}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="LOW">{tamilEnabled ? 'குறைவு' : 'LOW'}</option>
                    <option value="MEDIUM">{tamilEnabled ? 'நடுத்தரம்' : 'MEDIUM'}</option>
                    <option value="HIGH">{tamilEnabled ? 'உயர்' : 'HIGH'}</option>
                    <option value="CRITICAL">{tamilEnabled ? 'மிக அவசரம்' : 'CRITICAL'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'நிறைவு இலக்கு தேதி:' : 'Target Completion:'}</label>
                  <input
                    type="date"
                    required
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'ஒதுக்கப்பட்ட பணியாளர்:' : 'Assigned Staff:'}</label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    placeholder={tamilEnabled ? 'எ.கா. R. Murugesan' : 'e.g. R. Murugesan'}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'பணியாளர் தொடர்பு எண்:' : 'Staff Contact:'}</label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+91 94432..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tamilEnabled ? 'குறிப்புகள்:' : 'Remarks:'}</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={tamilEnabled ? 'தேவையான உதிரிபாகங்கள், பணிமனை ஆணை...' : 'Parts needed, workshop order...'}
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
                  {tamilEnabled ? 'பணி ஆணையைச் சேமி' : 'Save Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
