import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Layers, 
  ShieldAlert, 
  Activity, 
  Sliders, 
  RefreshCw,
  Gauge,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { INITIAL_BASELINES } from '../data/mockData';
import { AIEngine } from '../services/aiEngine';
import { AIAnomalyResult, ZoneBaseline } from '../types';

interface AiAnalysisViewProps {
  tamilEnabled: boolean;
  onNavigate: (viewId: string) => void;
}

export const AiAnalysisView: React.FC<AiAnalysisViewProps> = ({
  tamilEnabled,
  onNavigate
}) => {
  const [anomalies, setAnomalies] = useState<AIAnomalyResult[]>(dataService.anomalies);
  const [baselines] = useState<ZoneBaseline[]>(INITIAL_BASELINES);
  const [selectedBaseline, setSelectedBaseline] = useState<ZoneBaseline>(INITIAL_BASELINES[1]); // Pudur Zone 2

  // Interactive Live Evaluator Inputs
  const [testWaterLevel, setTestWaterLevel] = useState<number>(41);
  const [testInletFlow, setTestInletFlow] = useState<number>(140);
  const [testOutletFlow, setTestOutletFlow] = useState<number>(210);
  const [testPressure, setTestPressure] = useState<number>(1.1);
  const [testPumpRunning, setTestPumpRunning] = useState<boolean>(true);

  // Evaluate on the fly
  const testResult = AIEngine.analyzeZoneTelemetry(
    selectedBaseline.villageName,
    selectedBaseline.zoneName,
    {
      waterLevelPercent: testWaterLevel,
      inletFlowLpm: testInletFlow,
      outletFlowLpm: testOutletFlow,
      pressureBar: testPressure,
      pumpRunning: testPumpRunning,
      baseline: {
        minLevel: selectedBaseline.normalLevelMinPercent,
        maxLevel: selectedBaseline.normalLevelMaxPercent,
        normalInlet: selectedBaseline.normalInletLpmRange,
        normalOutlet: selectedBaseline.normalOutletLpmRange,
        normalPressure: selectedBaseline.normalPressureBarRange
      }
    }
  );

  const conditionLabel = (condition: string) => tamilEnabled ? ({
    Normal: 'இயல்பு நிலை',
    'Possible Leakage': 'கசிவு இருக்கலாம்',
    'Pipeline Blockage': 'குழாய் அடைப்பு',
    'Low Water Level': 'குறைந்த நீர்மட்டம்',
    'Pressure Abnormality': 'அழுத்தக் கோளாறு',
    'Abnormal Water Consumption': 'அசாதாரண நீர் பயன்பாடு',
    'Sensor Fault': 'சென்சார் கோளாறு',
    'Pump Problem': 'பம்ப் கோளாறு'
  }[condition] || condition) : condition;

  const causeLabel = (condition: string, cause: string) => {
    if (!tamilEnabled) return cause;
    if (condition === 'Normal') return 'நீர்மட்டம், ஓட்டம் மற்றும் அழுத்த அளவுகள் கற்றறிந்த ஊராட்சி இயல்புநிலைக்குள் உள்ளன.';
    if (condition === 'Possible Leakage') return 'வெளியேற்ற ஓட்டம் அதிகரிப்பும் நீரழுத்தம் குறைவதும் குழாயில் கசிவு அல்லது உடைப்பு இருப்பதைக் குறிக்கின்றன.';
    if (condition === 'Pipeline Blockage') return 'அழுத்தம் போதுமானதாக இருந்தும் வெளியேற்ற ஓட்டம் குறைவாக உள்ளது. காற்றடைப்பு, படிவம் அல்லது அடைப்பட்ட வால்வு காரணமாக இருக்கலாம்.';
    if (condition === 'Low Water Level') return 'முதன்மை நீர்வழங்கல் பம்ப் செயல்படாத நிலையில் மேல்நிலைத் தொட்டியின் நீர்மட்டம் குறைந்த இருப்பு வரம்பை எட்டியுள்ளது.';
    if (condition === 'Pressure Abnormality') return 'நீரழுத்தம் வழக்கத்தை விட அதிகமாக உள்ளது. அழுத்த நிவாரண வால்வு மற்றும் கீழ்நிலை வால்வுகளைச் சரிபார்க்கவும்.';
    if (condition === 'Abnormal Water Consumption') return 'வழக்கமான அளவை விட வெளியேற்றம் அதிகமாக உள்ளது. ஒரே நேரக் குழாய் பயன்பாடு அல்லது கணக்கிடப்படாத நீர் எடுப்பு இருக்கலாம்.';
    if (condition === 'Sensor Fault') return 'மீயொலி டிரான்ஸ்யூசர் அளவீட்டில் வேகமான ஏற்ற இறக்கம் உள்ளது; அதற்கேற்ற ஓட்டம் அல்லது அழுத்த மாற்றம் இல்லை. சென்சார் மேற்பரப்பில் மாசடைதல் இருக்கலாம்.';
    if (condition === 'Pump Problem') return 'PMP-06 மோட்டார் மின்னோட்டம் 0 Amps ஆகக் குறைந்துள்ளது; ஆனால் தொலைநிலை இயக்க நிலை செயல்பாட்டைக் காட்டுகிறது. வெப்ப அல்லது அதிகசுமைத் தடை ஏற்பட்டிருக்கலாம்.';
    return cause;
  };

  const actionLabel = (condition: string, action: string) => {
    if (!tamilEnabled) return action;
    if (condition === 'Normal') return 'வழக்கமான தானியங்கி விநியோக அட்டவணையைத் தொடரவும்.';
    if (condition === 'Possible Leakage') return 'மண்டல ஸ்லூயிஸ் வால்வை உடனடியாகத் தனிமைப்படுத்தி, ஒலிக் கசிவு கண்டறியும் கருவியுடன் குழாய் வழித்தடத்தை ஆய்வு செய்ய பணியாளரை அனுப்பவும்.';
    if (condition === 'Pipeline Blockage') return 'இறுதி முனை காற்று வெளியேற்ற வால்வைத் திறந்து, விநியோக கேட் வால்வை இயக்கவும்.';
    if (condition === 'Low Water Level') return 'பம்ப் அறையில் மின்சாரம் உள்ளதா எனச் சரிபார்த்து, நீர்த்தேக்கத்தை மீண்டும் நிரப்பவும்.';
    if (condition === 'Pressure Abnormality') return 'அழுத்த நிவாரண வால்வை ஆய்வு செய்து, கீழ்நிலை வால்வுகள் முன்கூட்டியே மூடப்பட்டுள்ளனவா எனச் சரிபார்க்கவும்.';
    if (condition === 'Abnormal Water Consumption') return 'கிராம விழா/பாசன அட்டவணையை ஆய்வு செய்து, வார்டு பிரதிநிதியுடன் உறுதிப்படுத்தவும்.';
    if (condition === 'Sensor Fault') return 'சுய-தூய்மையாக்கும் துடைப்பானை இயக்கவும்; நம்பகத்தன்மை 75%-க்கும் குறைவாக இருந்தால் களத் தொழில்நுட்பப் பணியாளரை அனுப்பவும்.';
    if (condition === 'Pump Problem') return 'தொலைநிலையில் மீண்டும் இயக்க முயற்சிக்க வேண்டாம். மோட்டார் சுருள்கள் மற்றும் ஸ்டார்ட்டரை ஆய்வு செய்ய சான்றளிக்கப்பட்ட மின்பணியாளரை அனுப்பவும்.';
    return action;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Prototype & Disclaimer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tamilEnabled ? 'AI கோளாறு கண்டறிதல் மற்றும் தகவமைவு பதில் முன்மாதிரி இயந்திரம்' : 'AI Anomaly & Adaptive Response Prototype Engine'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {tamilEnabled ? 'சுய-கற்றல் செயற்கை நுண்ணறிவு பகுப்பாய்வு' : 'AI Self-Learning Anomaly & Adaptive Response'}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100/80 mt-2 max-w-3xl leading-relaxed">
            {tamilEnabled ? 'ஒவ்வொரு கிராம ஊராட்சி விநியோக மண்டலத்திற்குமான இயல்பான செயல்பாட்டு வரம்புகளை இந்த அமைப்பு தொடர்ந்து கணக்கிடுகிறது. நீர்மட்டம், ஓட்ட வேறுபாடு மற்றும் அழுத்தம் ஆகியவற்றின் பல-அளவுரு தொடர்பைக் கணித்து, அசாதாரண நீரியல் நிலைகளைக் கண்டறிந்து தானியங்கி நடவடிக்கைகளைப் பரிந்துரைக்கிறது.' : 'The system continuously models normal operating envelopes for each Gram Panchayat distribution zone. By computing multi-parameter covariance between water level, differential flow, and pressure, it rapidly detects abnormal hydraulic conditions and prescribes automated responses.'}
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              <strong>{tamilEnabled ? 'AI முன்மாதிரி குறிப்பு:' : 'Note on AI Prototype:'}</strong> {tamilEnabled ? 'கிராமப்புற நீர் வலையமைப்புகளுக்கான புள்ளிவிவர இயல்புநிலை விலகல் மற்றும் பல-அளவுரு கோளாறு வகைப்படுத்தலைக் காட்டுகிறது. உருவாக்குநர் API இணைப்புப் பாலம் வழியாக Python Scikit-Learn/TensorFlow பின்தளங்களுடன் ஒருங்கிணைகிறது.' : 'Demonstrates statistical baseline deviation and multi-parametric anomaly classification for rural water grids. Integrates seamlessly with Python Scikit-Learn/TensorFlow backends via the developer API bridge.'}
            </span>
          </div>
        </div>
      </div>

      {/* LEARNED ZONE BASELINES OVERVIEW */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {tamilEnabled ? 'கிராம மண்டல வாரியான கற்றறிந்த செயல்பாட்டு இயல்புநிலை மாதிரிகள்' : 'Learned Operational Baseline Models by Village Zone'}
            </h3>
            <p className="text-xs text-slate-500">
              {tamilEnabled ? 'ஒவ்வொரு விநியோகப் பிரிவின் 30 நாள் வரலாற்றுத் தொடர் தொலைஅளவீட்டிலிருந்து கணக்கிடப்பட்டது' : 'Computed from 30-day historical time-series telemetry per distribution sector'}
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            {tamilEnabled ? '3 செயலில் உள்ள மண்டல மாதிரிகள்' : '3 Active Zonal Models'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {baselines.map((bl) => {
            const isSelected = selectedBaseline.zoneId === bl.zoneId && selectedBaseline.villageId === bl.villageId;
            return (
              <div 
                key={`${bl.villageId}-${bl.zoneId}`}
                onClick={() => {
                  setSelectedBaseline(bl);
                  // Load baseline typicals into test sliders
                  setTestWaterLevel(Math.round((bl.normalLevelMinPercent + bl.normalLevelMaxPercent) / 2));
                  setTestInletFlow(bl.normalInletLpmRange[0]);
                  setTestOutletFlow(bl.normalOutletLpmRange[0]);
                  setTestPressure(bl.normalPressureBarRange[0]);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-sm ring-2 ring-cyan-500/20' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-800">{bl.zoneName}</span>
                  <span className="text-[10px] text-slate-400">{bl.villageName}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tamilEnabled ? 'நீர்மட்ட வரம்பு:' : 'Level Range:'}</span>
                    <span className="font-mono font-semibold">{bl.normalLevelMinPercent}% - {bl.normalLevelMaxPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tamilEnabled ? 'இயல்பான வெளியேற்றம்:' : 'Normal Outlet:'}</span>
                    <span className="font-mono font-semibold">{bl.normalOutletLpmRange[0]} - {bl.normalOutletLpmRange[1]} LPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tamilEnabled ? 'அழுத்தத் தலை:' : 'Pressure Head:'}</span>
                    <span className="font-mono font-semibold">{bl.normalPressureBarRange[0]} - {bl.normalPressureBarRange[1]} Bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tamilEnabled ? 'மதிப்பிடப்பட்ட தினசரி தேவை:' : 'Est. Daily Demand:'}</span>
                    <span className="font-mono font-semibold">{(bl.typicalDailyDemandLiters / 1000).toLocaleString()} KL</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{tamilEnabled ? 'தொட்டி:' : 'Tank:'} {bl.tankId}</span>
                  <span className="text-cyan-700 font-bold">{isSelected ? (tamilEnabled ? 'செயலில்' : 'Active Model') : (tamilEnabled ? 'தேர்ந்தெடு' : 'Select')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE LIVE ANOMALY SIMULATOR & TESTER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-lg text-slate-900">
                {tamilEnabled ? 'பல சென்சார் உருவகப்படுத்தல் மற்றும் AI வகைப்படுத்தல்' : 'Interactive Multi-Sensor Simulation & AI Classification'}
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tamilEnabled ? 'நேரடி ஊடாடும் ஆய்வகம்' : 'Live Interactive Lab'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {tamilEnabled ? 'AI இயந்திரம் இயற்பியல் நிலைகளை நிகழ்நேரத்தில் எவ்வாறு வகைப்படுத்துகிறது என்பதைச் சோதிக்க, கீழே உள்ள உருவகப்படுத்தப்பட்ட சென்சார் மதிப்புகளை மாற்றவும்.' : 'Adjust simulated sensor values below to test how the AI engine classifies physical conditions in real-time.'}
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {tamilEnabled ? 'தேர்ந்தெடுக்கப்பட்டது:' : 'Selected:'} <span className="text-cyan-800 font-bold">{selectedBaseline.zoneName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders Input Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Quick Preset Buttons */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                {tamilEnabled ? 'விரைவு சோதனைச் சூழல்கள்:' : 'Quick Test Scenarios:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setTestWaterLevel(72);
                    setTestInletFlow(145);
                    setTestOutletFlow(135);
                    setTestPressure(2.3);
                    setTestPumpRunning(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium hover:bg-emerald-100"
                >
                  {tamilEnabled ? 'இயல்புநிலை' : 'Normal Baseline'}
                </button>
                <button
                  onClick={() => {
                    setTestWaterLevel(41);
                    setTestInletFlow(140);
                    setTestOutletFlow(215); // Surge
                    setTestPressure(1.0);  // Drop
                    setTestPumpRunning(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium hover:bg-rose-100"
                >
                  {tamilEnabled ? 'குழாய் உடைப்பு / கசிவு' : 'Pipe Rupture / Leak'}
                </button>
                <button
                  onClick={() => {
                    setTestWaterLevel(68);
                    setTestInletFlow(140);
                    setTestOutletFlow(18); // Low
                    setTestPressure(2.6);  // High
                    setTestPumpRunning(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium hover:bg-amber-100"
                >
                  {tamilEnabled ? 'குழாய் அடைப்பு' : 'Line Blockage'}
                </button>
                <button
                  onClick={() => {
                    setTestWaterLevel(25); // Low level
                    setTestInletFlow(0);
                    setTestOutletFlow(60);
                    setTestPressure(1.2);
                    setTestPumpRunning(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium hover:bg-indigo-100"
                >
                  {tamilEnabled ? 'பம்ப் நிறுத்தம் மற்றும் நீர் குறைவு' : 'Pump Trip & Depletion'}
                </button>
              </div>
            </div>

            {/* Slider 1: Water Level */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{tamilEnabled ? 'மேல்நிலைத் தொட்டி நீர்மட்டம்:' : 'Overhead Tank Water Level:'}</span>
                <span className="font-mono text-cyan-700 text-sm">{testWaterLevel}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={testWaterLevel}
                onChange={(e) => setTestWaterLevel(Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{tamilEnabled ? '0% காலி' : '0% Empty'}</span>
                <span>{tamilEnabled ? 'இயல்பு:' : 'Normal:'} {selectedBaseline.normalLevelMinPercent}% - {selectedBaseline.normalLevelMaxPercent}%</span>
                <span>{tamilEnabled ? '100% நிரம்பியது' : '100% Full'}</span>
              </div>
            </div>

            {/* Slider 2: Outlet Flow */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{tamilEnabled ? 'விநியோக வெளியேற்ற ஓட்ட விகிதம்:' : 'Distribution Outlet Flow Rate:'}</span>
                <span className="font-mono text-cyan-700 text-sm">{testOutletFlow} LPM</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={testOutletFlow}
                onChange={(e) => setTestOutletFlow(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 LPM</span>
                <span>{tamilEnabled ? 'இயல்புநிலை:' : 'Baseline:'} {selectedBaseline.normalOutletLpmRange[0]} - {selectedBaseline.normalOutletLpmRange[1]} LPM</span>
                <span>300 LPM {tamilEnabled ? 'அதிகபட்சம்' : 'Max'}</span>
              </div>
            </div>

            {/* Slider 3: Pipeline Pressure */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{tamilEnabled ? 'மண்டலக் குழாய் அழுத்தம்:' : 'Zone Pipeline Pressure:'}</span>
                <span className="font-mono text-cyan-700 text-sm">{testPressure} Bar</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={testPressure}
                onChange={(e) => setTestPressure(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.2 Bar</span>
                <span>{tamilEnabled ? 'பெயரளவு:' : 'Nominal:'} {selectedBaseline.normalPressureBarRange[0]} - {selectedBaseline.normalPressureBarRange[1]} Bar</span>
                <span>4.0 Bar {tamilEnabled ? 'அதிகபட்சம்' : 'Max'}</span>
              </div>
            </div>

            {/* Toggle: Pump State */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">{tamilEnabled ? 'முதன்மை நீரூட்டுப் பம்ப் நிலை:' : 'Primary Feed Pump Status:'}</span>
              <button
                type="button"
                onClick={() => setTestPumpRunning(!testPumpRunning)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  testPumpRunning
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {testPumpRunning ? (tamilEnabled ? 'இயங்குகிறது' : 'RUNNING') : (tamilEnabled ? 'நிறுத்தப்பட்டது' : 'STOPPED')}
              </button>
            </div>

          </div>

          {/* AI Output Classification Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
                {tamilEnabled ? 'வகைப்படுத்தல் முடிவு' : 'Classification Result'}
              </span>
              <span className="text-[11px] text-slate-400">{tamilEnabled ? 'முன்மாதிரி கணிப்பு' : 'Prototype Inference'}</span>
            </div>

            {/* Condition Badge */}
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">{tamilEnabled ? 'கண்டறியப்பட்ட நிலை:' : 'Detected Condition:'}</div>
              <div className="text-2xl font-black text-white flex items-center space-x-2">
                <span className={`w-3.5 h-3.5 rounded-full ${
                  testResult.condition === 'Normal' ? 'bg-emerald-400' :
                  testResult.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' :
                  'bg-amber-400'
                }`} />
                <span>{conditionLabel(testResult.condition)}</span>
              </div>
            </div>

            {/* Anomaly Gauge & Confidence */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-cyan-200 font-semibold">{tamilEnabled ? 'கோளாறு மதிப்பெண்' : 'Anomaly Score'}</div>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {testResult.anomalyScore} <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      testResult.anomalyScore < 30 ? 'bg-emerald-400' :
                      testResult.anomalyScore < 70 ? 'bg-amber-400' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${testResult.anomalyScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-teal-200 font-semibold">{tamilEnabled ? 'மாதிரி நம்பகத்தன்மை' : 'Model Confidence'}</div>
                <div className="text-2xl font-black font-mono text-teal-300 mt-0.5">
                  {testResult.confidence}%
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{tamilEnabled ? 'பல-அளவுரு தொடர்பு' : 'Multi-parameter covariance'}</p>
              </div>
            </div>

            {/* Probable Cause */}
            <div className="pt-2">
              <div className="text-xs text-cyan-200 font-bold mb-1">{tamilEnabled ? 'சாத்தியமான இயற்பியல் காரணம்:' : 'Probable Physical Cause:'}</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {causeLabel(testResult.condition, testResult.probableCause)}
              </p>
            </div>

            {/* Recommended Adaptive Response */}
            <div>
              <div className="text-xs text-emerald-300 font-bold mb-1">{tamilEnabled ? 'பரிந்துரைக்கப்படும் தகவமைவு நடவடிக்கை:' : 'Recommended Adaptive Action:'}</div>
              <p className="text-xs text-emerald-100 leading-relaxed bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
                {actionLabel(testResult.condition, testResult.recommendedAction)}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ANOMALY LOGS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {tamilEnabled ? 'சமீபத்திய கோளாறு கண்டறிதல் நிகழ்வுப் பதிவுகள்' : 'Recent Anomaly Detection Incident Records'}
            </h3>
            <p className="text-xs text-slate-500">
              {tamilEnabled ? 'கிராம ஊராட்சி மண்டல வாரியாக வகைப்படுத்தப்பட்ட வரலாற்றுப் பதிவுகள்' : 'Archived historical detections categorized by Gram Panchayat zone'}
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {anomalies.length} {tamilEnabled ? 'பதிவுகள்' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="pb-3">{tamilEnabled ? 'நேரமுத்திரை' : 'Timestamp'}</th>
                <th className="pb-3">{tamilEnabled ? 'கிராமம் மற்றும் மண்டலம்' : 'Village & Zone'}</th>
                <th className="pb-3">{tamilEnabled ? 'நிலை' : 'Condition'}</th>
                <th className="pb-3">{tamilEnabled ? 'கோளாறு மதிப்பெண்' : 'Anomaly Score'}</th>
                <th className="pb-3">{tamilEnabled ? 'நம்பகத்தன்மை' : 'Confidence'}</th>
                <th className="pb-3">{tamilEnabled ? 'சாத்தியமான காரணம்' : 'Probable Cause'}</th>
                <th className="pb-3">{tamilEnabled ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை' : 'Prescribed Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anomalies.map((ano) => (
                <tr key={ano.id} className="hover:bg-slate-50">
                  <td className="py-3.5 font-mono text-slate-500">{ano.timestamp}</td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-900 block">{ano.villageName}</span>
                    <span className="text-[10px] text-slate-400">{ano.zoneName}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ano.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      ano.severity === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {conditionLabel(ano.condition)}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-800">{ano.anomalyScore}</td>
                  <td className="py-3.5 font-mono text-teal-700 font-semibold">{ano.confidence}%</td>
                  <td className="py-3.5 text-slate-600 max-w-xs">{causeLabel(ano.condition, ano.probableCause)}</td>
                  <td className="py-3.5 text-slate-700 font-medium max-w-xs">{actionLabel(ano.condition, ano.recommendedAction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {anomalies.length === 0 && <p className="py-6 text-center text-xs text-slate-500">{tamilEnabled ? 'கோளாறு பதிவுகள் எதுவும் இல்லை.' : 'No anomaly records found.'}</p>}
        </div>

      </div>

    </div>
  );
};
