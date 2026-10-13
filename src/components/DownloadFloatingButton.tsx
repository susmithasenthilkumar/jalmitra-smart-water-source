import React from 'react';
import { Download } from 'lucide-react';

interface DownloadFloatingButtonProps {
  tamilEnabled: boolean;
}

export const DownloadFloatingButton: React.FC<DownloadFloatingButtonProps> = ({ tamilEnabled }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center shadow-2xl rounded-2xl animate-bounce-subtle">
      <a
        href="https://github.com/susmithasenthilkumar/jalmitra-smart-water-source/archive/refs/heads/main.zip"
        className="flex items-center space-x-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg ring-4 ring-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-500 hover:to-teal-600 active:scale-95"
        title={tamilEnabled ? 'முழு குறியீட்டு கோப்பை ZIP ஆக பதிவிறக்குக' : 'Download Complete Code as ZIP file'}
        aria-label={tamilEnabled ? 'முழு திட்ட ZIP-ஐ பதிவிறக்குக' : 'Download the complete project ZIP'}
      >
        <div className="p-1 rounded-lg bg-white/20">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs uppercase tracking-wider font-extrabold text-emerald-100 flex items-center space-x-1">
            <span>{tamilEnabled ? 'முழு திட்டக் கோப்பு' : 'Full Project Code'}</span>
            <span className="text-[10px] bg-white/25 px-1 rounded">ZIP</span>
          </div>
          <div className="text-sm font-black">{tamilEnabled ? 'ZIP பதிவிறக்குக' : 'Download ZIP'}</div>
        </div>
      </a>
    </div>
  );
};
