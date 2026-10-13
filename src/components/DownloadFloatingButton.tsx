import React, { useState } from 'react';
import { Download, Check, Sparkles, FileArchive, ExternalLink } from 'lucide-react';

interface DownloadFloatingButtonProps {
  tamilEnabled: boolean;
}

export const DownloadFloatingButton: React.FC<DownloadFloatingButtonProps> = ({ tamilEnabled }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/jalmitra-smart-water-source.zip');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jalmitra-smart-water-source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      console.warn('Fallback to direct link:', err);
      // Fallback
      window.location.href = '/download';
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center shadow-2xl rounded-2xl animate-bounce-subtle">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
          downloaded
            ? 'bg-emerald-600 ring-4 ring-emerald-300'
            : downloading
            ? 'bg-blue-600 ring-4 ring-blue-300 animate-pulse'
            : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 ring-4 ring-emerald-500/20'
        }`}
        title={tamilEnabled ? 'முழு குறியீட்டு கோப்பை ZIP ஆக பதிவிறக்குக' : 'Download Complete Code as ZIP file'}
      >
        <div className="p-1 rounded-lg bg-white/20">
          {downloaded ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Download className={`w-5 h-5 text-white ${downloading ? 'animate-bounce' : ''}`} />
          )}
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs uppercase tracking-wider font-extrabold text-emerald-100 flex items-center space-x-1">
            <span>{downloaded ? (tamilEnabled ? 'பதிவிறக்கம் முடிந்தது!' : 'Downloaded!') : (tamilEnabled ? 'முழு திட்டக் கோப்பு' : 'Full Project Code')}</span>
            <span className="text-[10px] bg-white/25 px-1 rounded">ZIP</span>
          </div>
          <div className="text-sm font-black">
            {downloading
              ? (tamilEnabled ? 'பதிவிறங்குகிறது...' : 'Downloading...')
              : (tamilEnabled ? 'ZIP பதிவிறக்குக (154 KB)' : 'Download ZIP (154 KB)')}
          </div>
        </div>
      </button>
    </div>
  );
};
