import React, { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  User, 
  Sparkles, 
  Eye, 
  X, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Complaint, ComplaintStatus, UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

interface ComplaintsViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  currentRole,
  tamilEnabled
}) => {
  const lang = tamilEnabled ? 'ta' : 'en';
  const t = (k: any) => getTranslation(k, lang);
  const complaintStatusLabel = (status: string) => tamilEnabled
    ? ({ SUBMITTED: 'சமர்ப்பிக்கப்பட்டது', REVIEWED: 'ஆய்வு செய்யப்பட்டது', IN_PROGRESS: 'பணியில் உள்ளது', RESOLVED: 'தீர்க்கப்பட்டது' }[status] || status)
    : status.replace(/_/g, ' ');
  const complaintTypeLabel = (type: string) => tamilEnabled
    ? ({
        NO_WATER_SUPPLY: 'நீர் விநியோகம் இல்லை', LOW_PRESSURE: 'குறைந்த நீர் அழுத்தம்',
        DIRTY_OR_CONTAMINATED_WATER: 'அழுக்கு / மாசடைந்த நீர்', PIPELINE_LEAKAGE: 'குழாய் கசிவு / உடைப்பு',
        VALVE_DAMAGED: 'சேதமடைந்த வால்வு / உடைந்த குழாய்', IRREGULAR_TIMING: 'ஒழுங்கற்ற விநியோக நேரம்', OTHER: 'பிற சிக்கல்'
      }[type] || type.replace(/_/g, ' '))
    : type.replace(/_/g, ' ');
  const [complaints, setComplaints] = useState<Complaint[]>(dataService.complaints);
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEscalatedOnly, setFilterEscalatedOnly] = useState<boolean>(false);

  // Selected complaint for modal details & status change
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [adminRemark, setAdminRemark] = useState<string>('');
  const [assignedStaff, setAssignedStaff] = useState<string>('');

  useEffect(() => {
    dataService.checkAndEscalateComplaints();
    const sync = () => {
      setComplaints([...dataService.complaints]);
    };
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleOpenModal = (c: Complaint) => {
    setViewingComplaint(c);
    setNewStatus(c.status);
    setAdminRemark(c.adminRemark || '');
    setAssignedStaff(c.assignedStaff || '');
  };

  const handleSaveStatus = () => {
    if (!viewingComplaint) return;
    dataService.updateComplaintStatus(viewingComplaint.id, newStatus, adminRemark, assignedStaff);
    setViewingComplaint(null);
  };

  const handleTriggerCorrelation = (complaint: Complaint) => {
    const correlation = dataService.correlateCitizenReport(
      complaint.villageId, 
      complaint.streetLocation, 
      complaint.complaintType
    );
    dataService.complaints = dataService.complaints.map(c => 
      c.id === complaint.id ? { ...c, correlation } : c
    );
    setViewingComplaint({ ...complaint, correlation });
  };

  const escalatedComplaintsCount = complaints.filter(c => c.isEscalatedToSupervisor && c.status !== 'RESOLVED').length;

  const filteredComplaints = complaints.filter(c => {
    const matchVillage = selectedVillage === 'ALL' || c.villageId === selectedVillage;
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchEscalated = !filterEscalatedOnly || (c.isEscalatedToSupervisor && c.status !== 'RESOLVED');
    const matchSearch = searchQuery === '' || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.streetLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchVillage && matchStatus && matchEscalated && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquareWarning className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'குடிமக்கள் புகார்கள் மற்றும் தொலைஅளவீட்டுத் தரவு ஒப்பீடு' : 'Citizen Grievances & Telemetry Cross-Referencing'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'குடிநீர் புகார்கள் & சென்சார் தொடர்பு' : 'Complaints & Sensor Correlation'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'கிராமப் புகார்களை ஆய்வு செய்து, நீரழுத்தத் தரவைச் சரிபார்த்து, களப் பணியாளர் பணிகளை நிர்வகிக்கவும்.' : 'Review village grievances, verify hydraulic pressure signatures, and manage lineman work orders.'}
          </p>
        </div>

        <button
          onClick={() => dataService.exportComplaintsCSV()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{tamilEnabled ? 'புகார்களை CSV ஆக ஏற்றுமதி செய்' : 'Export Grievances CSV'}</span>
        </button>
      </div>

      {/* 5-DAY SLA BREACH CALLOUT FOR ADMIN & SUPERVISOR */}
      {escalatedComplaintsCount > 0 && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-amber-500 text-white font-black text-xs shrink-0">
              5D+ SLA
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">
                {tamilEnabled 
                  ? `கவனம்: ${escalatedComplaintsCount} புகார்கள் 5 நாட்களுக்கும் மேலாகத் தீர்க்கப்படாமல் மேற்பார்வையாளருக்கு அனுப்பப்பட்டுள்ளன!`
                  : `Attention: ${escalatedComplaintsCount} complaint(s) have exceeded the 5-day Admin resolution SLA and are escalated to Technical Supervisor!`
                }
              </h4>
              <p className="text-[11px] text-slate-600">
                {tamilEnabled ? 'மேற்பார்வையாளருக்கு அறிவிக்கப்பட்டுள்ளது. களப் பணியாளரை உடனடியாக நியமிக்கவும்.' : 'Supervisor oversight is actively alerted. Please prioritize immediate lineman assignment.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterEscalatedOnly(!filterEscalatedOnly)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
              filterEscalatedOnly 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {filterEscalatedOnly ? (tamilEnabled ? 'அனைத்து புகார்களையும் காட்டு' : 'Show All Complaints') : tamilEnabled ? `காலக்கெடு கடந்தவை மட்டும் (${escalatedComplaintsCount})` : `Filter Overdue Only (${escalatedComplaintsCount})`}
          </button>
        </div>
      )}

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tamilEnabled ? 'ID, பெயர், கைபேசி, தெரு மூலம் தேடவும்...' : 'Search by ID, name, mobile, street...'}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-600">{tamilEnabled ? 'நிலை:' : 'Status:'}</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800"
            >
              <option value="ALL">{tamilEnabled ? 'அனைத்து நிலைகள்' : 'All Statuses'}</option>
              <option value="SUBMITTED">{tamilEnabled ? 'சமர்ப்பிக்கப்பட்டது' : 'Submitted'}</option>
              <option value="REVIEWED">{tamilEnabled ? 'ஆய்வு செய்யப்பட்டது' : 'Reviewed'}</option>
              <option value="IN_PROGRESS">{tamilEnabled ? 'பணியில் உள்ளது' : 'In Progress'}</option>
              <option value="RESOLVED">{tamilEnabled ? 'தீர்க்கப்பட்டது' : 'Resolved'}</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-600">{tamilEnabled ? 'கிராமம்:' : 'Village:'}</span>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800"
            >
              <option value="ALL">{tamilEnabled ? 'அனைத்து கிராமங்களும்' : 'All Villages'}</option>
              <option value="VIL-01">Melur</option>
              <option value="VIL-02">Keelur</option>
              <option value="VIL-03">Pudur West</option>
              <option value="VIL-04">Arasur</option>
              <option value="VIL-05">Periyakulam</option>
              <option value="VIL-06">Shanti Nagar</option>
            </select>
          </div>
        </div>

      </div>

      {/* COMPLAINTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="p-4">{tamilEnabled ? 'புகார் ID' : 'Complaint ID'}</th>
                <th className="p-4">{tamilEnabled ? 'குடிமகன் மற்றும் கைபேசி' : 'Citizen & Mobile'}</th>
                <th className="p-4">{tamilEnabled ? 'இடம்' : 'Location'}</th>
                <th className="p-4">{tamilEnabled ? 'புகார் வகை' : 'Complaint Type'}</th>
                <th className="p-4">{tamilEnabled ? 'சென்சார் தொடர்பு' : 'Sensor Correlation'}</th>
                <th className="p-4">{tamilEnabled ? 'நிலை' : 'Status'}</th>
                <th className="p-4">{tamilEnabled ? 'உருவாக்கிய நேரம்' : 'Created At'}</th>
                <th className="p-4 text-right">{tamilEnabled ? 'செயல்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((c) => {
                const hasCorrelation = !!c.correlation;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-800">
                      <div>{c.id}</div>
                      {c.isEscalatedToSupervisor && c.status !== 'RESOLVED' && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          ⚠️ {c.daysPending || 5}{tamilEnabled ? ' நாட்கள் காலதாமதம்' : 'd Overdue'}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{c.citizenName}</div>
                      <div className="text-[11px] text-slate-500">{c.mobile}</div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-slate-800">{c.villageName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.streetLocation}</div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-700">
                        {complaintTypeLabel(c.complaintType)}
                      </span>
                    </td>

                    <td className="p-4">
                      {hasCorrelation ? (
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          c.correlation?.isPhysicalFaultConfirmed 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>{c.correlation?.isPhysicalFaultConfirmed ? (tamilEnabled ? 'கோளாறு உறுதி செய்யப்பட்டது' : 'Fault Verified') : (tamilEnabled ? 'குழாய் / சேவைச் சிக்கல்' : 'Tap/Service Issue')}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">{tamilEnabled ? 'தொடர்பு கண்டறியப்படவில்லை' : 'Uncorrelated'}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        c.status === 'REVIEWED' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {complaintStatusLabel(c.status)}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {c.createdAt}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-xl text-xs transition-colors"
                      >
                        {tamilEnabled ? 'ஆய்வு செய்' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLAINT DETAILS & SENSOR CORRELATION MODAL */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                  {viewingComplaint.id}
                </span>
                <h3 className="text-lg font-bold mt-1">
                  {complaintTypeLabel(viewingComplaint.complaintType)}
                </h3>
              </div>

              <button
                onClick={() => setViewingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Overdue Alert In Modal if escalated */}
              {viewingComplaint.isEscalatedToSupervisor && viewingComplaint.status !== 'RESOLVED' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-xs uppercase tracking-wider block text-rose-700">
                      {tamilEnabled ? '⚠️ 5 நாள் தீர்வு SLA மீறப்பட்டது — தொழில்நுட்ப மேற்பார்வையாளருக்கு அனுப்பப்பட்டது' : '⚠️ 5-Day Resolution SLA Breached — Escalated to Technical Supervisor'}
                    </span>
                    <p className="mt-0.5">
                      {tamilEnabled ? <>இந்தப் புகார் நிர்வாகியால் <strong>{viewingComplaint.daysPending || 5} நாட்களாக</strong> தீர்க்கப்படாமல் உள்ளது. கட்டாய அவசர நடவடிக்கைக்காக தொழில்நுட்ப மேற்பார்வையாளருக்கு தானியங்கி தீவிர எச்சரிக்கை அனுப்பப்பட்டுள்ளது.</> : <>This grievance has been open for <strong>{viewingComplaint.daysPending || 5} days</strong> without Admin resolution. An automated critical alert has been dispatched to the Technical Supervisor for mandatory emergency action.</>}
                    </p>
                  </div>
                </div>
              )}

              {/* Citizen Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{tamilEnabled ? 'குடிமகன் பெயர்' : 'Citizen Name'}</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingComplaint.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{tamilEnabled ? 'கைபேசி எண்' : 'Mobile Phone'}</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingComplaint.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{tamilEnabled ? 'கிராம ஊராட்சி' : 'Village Panchayat'}</span>
                  <span className="font-semibold text-slate-800">{viewingComplaint.villageName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{tamilEnabled ? 'புகார் நேரமுத்திரை' : 'Report Timestamp'}</span>
                  <span className="font-mono text-slate-700">{viewingComplaint.createdAt}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{tamilEnabled ? 'தெரு இடம்' : 'Street Location'}</span>
                  <span className="font-medium text-slate-800">{viewingComplaint.streetLocation}</span>
                </div>
              </div>

              {/* Citizen Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {tamilEnabled ? 'குடிமகன் தெரிவித்த சிக்கல்:' : 'Citizen Problem Description:'}
                </h4>
                <p className="text-xs text-slate-700 bg-slate-100 p-3 rounded-xl leading-relaxed">
                  {viewingComplaint.description}
                </p>
              </div>

              {/* Optional Photo Attachment */}
              {viewingComplaint.photoUrl && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {tamilEnabled ? 'குடிமகன் பதிவேற்றிய படம்:' : 'Citizen Uploaded Photo:'}
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-900">
                    <img
                      src={viewingComplaint.photoUrl}
                      alt={tamilEnabled ? 'குடிமகன் புகார் படம்' : 'Citizen grievance photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 7: CITIZEN COMPLAINT + SENSOR CORRELATION BOX */}
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-5 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>{tamilEnabled ? 'பல சென்சார் நீரியக்கத் தொடர்பு பகுப்பாய்வு அமைப்பு' : 'Cross-Sensor Hydrodynamic Correlation Engine'}</span>
                  </div>
                  <button
                    onClick={() => handleTriggerCorrelation(viewingComplaint)}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-900 underline"
                  >
                    {tamilEnabled ? 'மீண்டும் தொடர்புபடுத்து' : 'Re-Correlate Now'}
                  </button>
                </div>

                {viewingComplaint.correlation ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-800 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-cyan-100">
                      {viewingComplaint.correlation.technicalFinding}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-cyan-100">
                        <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'தொட்டி சேமிப்பு' : 'Tank Storage'}</span>
                        <span className="font-bold text-slate-900">{viewingComplaint.correlation.tankLevelPercent}%</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-cyan-100">
                        <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'வெளியேற்ற ஓட்டம்' : 'Outlet Flow'}</span>
                        <span className="font-bold text-slate-900">{viewingComplaint.correlation.zoneFlowLpm} LPM</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-cyan-100">
                        <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'குழாய் அழுத்தம்' : 'Line Pressure'}</span>
                        <span className="font-bold text-slate-900">{viewingComplaint.correlation.zonePressureBar} Bar</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-cyan-100">
                        <span className="text-slate-400 block text-[10px]">{tamilEnabled ? 'பம்ப் நிலை' : 'Pump Status'}</span>
                        <span className="font-bold text-slate-900">{viewingComplaint.correlation.pumpStatus}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="font-bold text-cyan-900 block mb-0.5">{tamilEnabled ? 'பரிந்துரைக்கப்படும் களப் பணியாளர் நடவடிக்கை:' : 'Recommended Lineman Action:'}</span>
                      <span className="text-slate-700">{viewingComplaint.correlation.suggestedAction}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    {tamilEnabled ? 'இந்தப் புகாரை அருகிலுள்ள தொட்டி மீயொலி சென்சார் மற்றும் மண்டல அழுத்த சென்சாருடன் இணைக்க "மீண்டும் தொடர்புபடுத்து" என்பதைத் தேர்ந்தெடுக்கவும்.' : 'Click "Re-Correlate Now" to link this complaint to the nearest ultrasonic reservoir sensor and zone pressure transducer.'}
                  </div>
                )}
              </div>

              {/* Status & Resolution Form (Admin / Supervisor) */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {tamilEnabled ? 'பணிநிலை நிலையைப் புதுப்பிக்கவும்:' : 'Update Workflow Status:'}
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      disabled={currentRole === 'public'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value="SUBMITTED">{tamilEnabled ? 'சமர்ப்பிக்கப்பட்டது' : 'SUBMITTED'}</option>
                      <option value="REVIEWED">{tamilEnabled ? 'ஆய்வு செய்யப்பட்டது' : 'REVIEWED'}</option>
                      <option value="IN_PROGRESS">{tamilEnabled ? 'பணியில் உள்ளது' : 'IN PROGRESS'}</option>
                      <option value="RESOLVED">{tamilEnabled ? 'தீர்க்கப்பட்டது' : 'RESOLVED'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {tamilEnabled ? 'நியமிக்கப்பட்ட களப் பணியாளர்:' : 'Assigned Field Staff:'}
                    </label>
                    <input
                      type="text"
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      disabled={currentRole === 'public'}
                      placeholder={tamilEnabled ? 'எ.கா. R. Murugesan (களப் பணியாளர்)' : 'e.g. R. Murugesan (Lineman)'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                      {tamilEnabled ? 'ஊராட்சி நிர்வாகி / களப் பணியாளர் தீர்வு குறிப்பு:' : 'Panchayat Admin / Lineman Resolution Note:'}
                  </label>
                  <textarea
                    rows={2}
                    value={adminRemark}
                    onChange={(e) => setAdminRemark(e.target.value)}
                    disabled={currentRole === 'public'}
                    placeholder={tamilEnabled ? 'எடுக்கப்பட்ட தொழில்நுட்ப நடவடிக்கை அல்லது வழிமுறைகளை உள்ளிடவும்...' : 'Provide technical action taken or instructions...'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                {currentRole !== 'public' && (
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setViewingComplaint(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      {tamilEnabled ? 'ரத்து செய்' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveStatus}
                      className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-extrabold shadow-sm"
                    >
                      {tamilEnabled ? 'பணிநிலை மாற்றங்களைச் சேமி' : 'Save Workflow Changes'}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
