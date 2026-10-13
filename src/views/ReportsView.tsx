import React, { useState } from 'react';
import { FileText, Download, Printer, TrendingUp, Droplet, CheckCircle2, ShieldCheck } from 'lucide-react';
import { dataService } from '../services/dataService';
import { UserRole } from '../types';

interface ReportsViewProps {
  currentRole: UserRole;
  tamilEnabled: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentRole,
  tamilEnabled
}) => {
  const [reportMonth, setReportMonth] = useState('September 2026');

  const handleExportCSV = () => {
    dataService.exportComplaintsCSV();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>{tamilEnabled ? 'ஊராட்சி நீர் தணிக்கை மற்றும் ஒழுங்குமுறை இணக்கம்' : 'Panchayat Water Audit & Regulatory Compliance'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'அறிக்கைகள் மற்றும் நீர் தணிக்கை' : 'Water Network Audit & Reports'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'அதிகாரப்பூர்வ கிராம சபை மாதாந்திர தணிக்கை அறிக்கைகள், வருவாய் அல்லாத நீர் (NRW) பகுப்பாய்வு மற்றும் குறைதீர் அளவீடுகள்.' : 'Official Gram Sabha monthly audit statements, non-revenue water (NRW) analysis, and grievance resolution metrics.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{tamilEnabled ? 'CSV ஏற்றுமதி' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{tamilEnabled ? 'அறிக்கையை அச்சிடு' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* REPORT AUDIT CARD */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
        
        {/* Document Header */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-800">
            Jal Jeevan Mission / State Rural Water Supply Mission
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {tamilEnabled ? 'கிராம ஊராட்சி மாதாந்திர நீர் இருப்பு மற்றும் தணிக்கை அறிக்கை' : 'GRAM PANCHAYAT MONTHLY WATER BALANCE & AUDIT REPORT'}
          </h3>
          <p className="text-xs text-slate-500">
            {tamilEnabled ? 'அறிக்கை காலம்:' : 'Reporting Period:'} {tamilEnabled ? 'செப்டம்பர் 2026' : reportMonth} • {tamilEnabled ? 'தணிக்கை குறியீடு:' : 'Audit Code:'} GP-TN-CBE-2026-09
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{tamilEnabled ? 'மொத்த நீர் விநியோகம்' : 'Total Water Supplied'}</span>
            <div className="text-2xl font-black text-slate-900 mt-1">35,160 <span className="text-xs text-slate-500">KL</span></div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{tamilEnabled ? 'இலக்கில் 98.2%' : '98.2% of target'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{tamilEnabled ? 'மதிப்பிடப்பட்ட இழப்பு / NRW' : 'Estimated Loss / NRW'}</span>
            <div className="text-2xl font-black text-amber-700 mt-1">7.4%</div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{tamilEnabled ? 'இலக்கு 10%-க்குக் குறைவாகும்' : 'Target is below 10%'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{tamilEnabled ? 'பொதுமக்கள் குறைகள்' : 'Citizen Grievances'}</span>
            <div className="text-2xl font-black text-slate-900 mt-1">14 {tamilEnabled ? 'பதிவு' : 'Filed'}</div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{tamilEnabled ? '11 தீர்க்கப்பட்டன (78%)' : '11 Resolved (78%)'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{tamilEnabled ? 'IoT உணரி செயல்நேரம்' : 'IoT Sensor Uptime'}</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">99.1%</div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{tamilEnabled ? 'சுய சுத்திகரிப்பு செயல்முறை செயலில்' : 'Self-cleaning mechanism active'}</p>
          </div>
        </div>

        {/* Village Audit Breakdown Table */}
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 mb-3">
            {tamilEnabled ? 'குடியிருப்புப் பகுதிவாரியான நீர் இருப்பு விவரம்' : 'Habitation-Wise Water Balance Breakdown'}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="pb-3">{tamilEnabled ? 'கிராமக் குடியிருப்பு' : 'Village Habitation'}</th>
                  <th className="pb-3">{tamilEnabled ? 'வழங்கிய குழாய் இணைப்புகள்' : 'Taps Served'}</th>
                  <th className="pb-3">{tamilEnabled ? 'ஒதுக்கீடு (KL)' : 'Allocated (KL)'}</th>
                  <th className="pb-3">{tamilEnabled ? 'உண்மையான பயன்பாடு (KL)' : 'Actual Drawn (KL)'}</th>
                  <th className="pb-3">{tamilEnabled ? 'வேறுபாடு' : 'Discrepancy'}</th>
                  <th className="pb-3">{tamilEnabled ? 'குறைகள்' : 'Grievances'}</th>
                  <th className="pb-3">{tamilEnabled ? 'தணிக்கை முடிவு' : 'Audit Verdict'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataService.villages.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{tamilEnabled && v.tamilName ? v.tamilName : v.name}</td>
                    <td className="py-3 text-slate-600">{v.householdCount}</td>
                    <td className="py-3 font-mono">{Math.round(v.dailyDemandLiters * 30 / 1000).toLocaleString()}</td>
                    <td className="py-3 font-mono text-cyan-800 font-bold">{Math.round(v.waterSuppliedTodayLiters * 30 / 1000).toLocaleString()}</td>
                    <td className="py-3 font-mono text-emerald-700">-2.1%</td>
                    <td className="py-3 text-slate-600">2 {tamilEnabled ? 'திறந்துள்ளன' : 'Open'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tamilEnabled ? 'திருப்திகரமானது' : 'Satisfactory'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Signature Strip */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">{tamilEnabled ? 'ஊராட்சி நீர் இயக்குநர்' : 'Panchayat Water Operator'}</span>
            <span className="text-[11px] text-slate-400">{tamilEnabled ? 'களப்பணியாளர் / தொலைஅளவீட்டு அலுவலர்' : 'Lineman / Telemetry Officer'}</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">{tamilEnabled ? 'ஊராட்சி செயலாளர்' : 'Panchayat Secretary'}</span>
            <span className="text-[11px] text-slate-400">{tamilEnabled ? 'ஊரக வளர்ச்சி அலுவலர்' : 'Rural Development Officer'}</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">{tamilEnabled ? 'ஊராட்சித் தலைவர்' : 'Panchayat President'}</span>
            <span className="text-[11px] text-slate-400">{tamilEnabled ? 'கிராம சபைத் தலைமை அலுவலர்' : 'Gram Sabha Presiding Officer'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
