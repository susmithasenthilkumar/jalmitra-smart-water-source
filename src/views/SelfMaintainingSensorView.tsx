import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  Info, 
  Play, 
  Layers, 
  Cpu, 
  Check, 
  Clock, 
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { SensorItem, SelfCleanLog } from '../types';

interface SelfMaintainingSensorViewProps {
  tamilEnabled: boolean;
}

export const SelfMaintainingSensorView: React.FC<SelfMaintainingSensorViewProps> = ({
  tamilEnabled
}) => {
  const [sensors, setSensors] = useState<SensorItem[]>(() => dataService.sensors || []);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('SNS-06'); // Pudur North level sensor (contaminated)
  const [cleanLogs, setCleanLogs] = useState<SelfCleanLog[]>(() => dataService.cleanLogs || []);

  // Interactive Cleaning Workflow State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCleaningActive, setIsCleaningActive] = useState<boolean>(false);
  const [cleaningProgress, setCleaningProgress] = useState<number>(0);
  const [lastCleanResult, setLastCleanResult] = useState<SelfCleanLog | null>(null);

  useEffect(() => {
    const sync = () => {
      setSensors([...dataService.sensors]);
      setCleanLogs([...dataService.cleanLogs]);
    };
    sync();
    return dataService.subscribe(sync);
  }, []);

  const fallbackSensor: SensorItem = {
    id: 'SNS-06',
    name: 'Zone 2 Level Ultrasonic Transducer',
    type: 'ultrasonic_level',
    villageId: 'VIL-03',
    villageName: 'Pudur West Panchayat',
    tankId: 'TNK-04',
    tankName: 'Pudur North Overhead Tank',
    currentValue: 41,
    unit: '%',
    normalRange: [40, 95],
    status: 'contaminated',
    lastUpdated: 'Just now',
    reliabilityPercent: 62,
    cleaningMechanismAvailable: true
  };

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0] || fallbackSensor;

  const selectedStatusLabel = (status: string) => tamilEnabled ? ({
    normal: 'இயல்பு',
    warning: 'எச்சரிக்கை',
    critical: 'ஆபத்து',
    contaminated: 'மாசடைந்தது',
    offline: 'இணைப்பில்லை'
  }[status] || status) : status;

  const logMechanismLabel = (mechanism: string) => tamilEnabled ? ({
    'Mini Wiper Blade': 'சிறிய துடைப்பான்',
    'Cleaning Ultrasonic Ring': 'தூய்மையாக்கும் மீயொலி வளையம்'
  }[mechanism] || mechanism) : mechanism;

  const logNotesLabel = (notes: string) => {
    if (!tamilEnabled) return notes;
    const reliabilityValues = notes.match(/from (\d+)% to (\d+)%/);
    if (notes.startsWith('Dual-cycle')) {
      return `ESP32 PWM இயக்கி மூலம் இரட்டைச் சுழற்சி ${notes.includes('Cleaning Ultrasonic Ring') ? 'தூய்மையாக்கும் மீயொலி வளையம்' : 'சிறிய துடைப்பான்'} இயக்கப்பட்டது. டிரான்ஸ்யூசர் ஒலி பிரதிபலிப்பு அளவு ${reliabilityValues?.[1] || ''}% இலிருந்து ${reliabilityValues?.[2] || ''}% ஆக மீட்டெடுக்கப்பட்டது.`;
    }
    if (notes.startsWith('Dual-stroke')) return 'இரட்டை இயக்க இயந்திரத் துடைப்பான் மேற்பரப்பிலிருந்த சிலந்திவலையையும் ஈரப்பதத்தையும் அகற்றியது. சிக்னல்-இரைச்சல் விகிதம் மீட்டெடுக்கப்பட்டது.';
    if (notes.startsWith('Piezo ultrasonic')) return '42 kHz அதிர்வெண்ணில் இயக்கப்பட்ட Piezo மீயொலி அதிர்வு, ஒளியியல் பிரிசத்தின் மேற்பரப்பிலிருந்த படிவத்தை அகற்றியது.';
    return 'சென்சார் தூய்மையாக்கும் சுழற்சி நிறைவடைந்தது.';
  };

  const cleanStatusLabel = (status: string) => tamilEnabled && status === 'SUCCESS' ? 'வெற்றி' : status;

  // Automated 5-stage cleaning sequence
  const handleStartFullCleaningCycle = async () => {
    if (!selectedSensor) return;
    setIsCleaningActive(true);
    setCleaningProgress(0);

    // Step 2: Reliability analysis
    setCurrentStep(2);
    await new Promise(r => setTimeout(r, 600));
    setCleaningProgress(25);

    // Step 3: Cleaning Actuator Activated (mini wiper / ultrasonic vibration)
    setCurrentStep(3);
    for (let p = 25; p <= 75; p += 10) {
      setCleaningProgress(p);
      await new Promise(r => setTimeout(r, 200));
    }

    // Step 4: Re-measurement
    setCurrentStep(4);
    setCleaningProgress(85);
    await new Promise(r => setTimeout(r, 600));

    // Step 5: Validation & restoration in dataService
    setCurrentStep(5);
    setCleaningProgress(100);
    const result = await dataService.executeSensorCleaningCycle(selectedSensor.id);
    setLastCleanResult(result);
    setIsCleaningActive(false);
  };

  const handleStepAction = async (step: number) => {
    if (step === 3) {
      // Start Cleaning
      setCurrentStep(3);
      setIsCleaningActive(true);
      await new Promise(r => setTimeout(r, 1200));
      setIsCleaningActive(false);
      setCurrentStep(4);
    } else if (step === 4) {
      // Re-measure
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(5);
    } else if (step === 5) {
      // Validate
      const result = await dataService.executeSensorCleaningCycle(selectedSensor.id);
      setLastCleanResult(result);
      setCurrentStep(5);
    }
  };

  const handleInjectDirt = () => {
    dataService.injectFault('SENSOR_DIRT');
    setSelectedSensorId('SNS-01');
    setCurrentStep(1);
    setLastCleanResult(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Prototype Mechanism Disclaimer */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tamilEnabled ? 'முன்மொழியப்பட்ட சுய-பராமரிப்பு முறையின் முன்மாதிரி' : 'Proposed Self-Maintenance Mechanism Prototype'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {tamilEnabled ? 'சென்சார் சுய-பராமரிப்பு மற்றும் தானியங்கி தூய்மையாக்கல்' : 'Self-Maintaining Sensor Module'}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100/80 mt-2 max-w-3xl leading-relaxed">
            {tamilEnabled ? 'கிராம ஊராட்சி நீர்த்தேக்கங்களின் கடினமான சூழலில், நீர்மட்ட மீயொலி டிரான்ஸ்யூசர்கள் மற்றும் கலங்கல்தன்மை ஒளியியல் பிரிசங்களில் பாசி, கனிமப் படிவு மற்றும் சிலந்திவலை ஏற்படலாம். களப் பணியாளரை அனுப்பாமல் சென்சார் நம்பகத்தன்மையை மீட்டெடுக்க ESP32 இயக்கும் மின்மின்னியல் தூய்மையாக்கும் துடைப்பான் வளையத்தை இந்தத் தொகுதி மாதிரியாகக் காட்டுகிறது.' : 'In harsh Gram Panchayat reservoir conditions, water level ultrasonic transducers and turbidity optical prisms suffer from algae growth, mineral calcification, and spiderwebs. This module models an electromechanical cleaning wiper ring actuated by the ESP32 to restore sensor reliability without dispatching a lineman.'}
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              <strong>{tamilEnabled ? 'முன்மாதிரி அறிவிப்பு:' : 'Prototype Notice:'}</strong> {tamilEnabled ? 'இந்த ஊடாடும் உருவகப்படுத்தி, முன்மொழியப்பட்ட மூடிய-சுற்று மின்மின்னியல் இயக்கி துடைப்பான் / தூய்மையாக்கும் வளைய முறையைக் காட்டுகிறது. உண்மையான வன்பொருளுக்கு ESP32 PWM servo அல்லது மீயொலி வளைய இயக்கி தேவை.' : 'This interactive simulator demonstrates the proposed closed-loop electromechanical actuator wiper / cleaning ring mechanism. Physical hardware requires an ESP32 PWM servo or ultrasonic ring driver.'}
            </span>
          </div>
        </div>
      </div>

      {/* SENSOR SELECTOR & STATUS STRIP */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {tamilEnabled ? 'பராமரிப்புக்கான இலக்கு சென்சார் முனையைத் தேர்ந்தெடுக்கவும்:' : 'Select Target Sensor Node for Maintenance:'}
          </label>
          <select
            value={selectedSensorId}
            onChange={(e) => {
              setSelectedSensorId(e.target.value);
              setCurrentStep(1);
              setLastCleanResult(null);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500"
          >
            {sensors.filter(s => s.cleaningMechanismAvailable).map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.villageName}) - {selectedStatusLabel(s.status)} ({s.reliabilityPercent}%)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleInjectDirt}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{tamilEnabled ? 'சென்சார் அழுக்கு / மாசடைதலை உருவகப்படுத்து' : 'Simulate Sensor Dirt / Fouling'}</span>
          </button>
        </div>
      </div>

      {/* 7-STEP VISUAL WORKFLOW PIPELINE (Requirement 6 & 20) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-lg text-slate-900 mb-1">
          {tamilEnabled ? 'மூடிய-சுற்று சுய-தூய்மையாக்கும் செயல்முறை' : 'Closed-Loop Self-Cleaning Workflow'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {tamilEnabled ? 'ESP32 எட்ஜ் முனையில் நடைபெறும் படிப்படியான கண்டறிதல் மற்றும் இயக்க வரிசை' : 'Step-by-step diagnostic and actuation sequence executing on the ESP32 edge node'}
        </p>

        {/* Stepper Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep === 1 ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-500/20' :
            currentStep > 1 ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              {currentStep > 1 && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{tamilEnabled ? 'நம்பகமற்ற அளவீடு' : 'Unreliable Reading'}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'ஒலி எதிரொலி ஏற்ற இறக்கம் அல்லது குறைவு கண்டறியப்பட்டது' : 'Acoustic echo jitter or attenuation detected'}</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep === 2 ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-500/20' :
            currentStep > 2 ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              {currentStep > 2 && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{tamilEnabled ? 'நம்பகத்தன்மை பகுப்பாய்வு' : 'Reliability Analysis'}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'மதிப்பெண் 70% வரம்புக்குக் கீழ் குறைகிறது' : 'Score drops below 70% threshold'}</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep === 3 ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-500/20' :
            currentStep > 3 ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              {currentStep > 3 && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{tamilEnabled ? 'தூய்மையாக்கும் இயக்கி' : 'Cleaning Actuator'}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'சிறிய துடைப்பான் மேற்பரப்பைத் துடைக்கிறது' : 'Mini-wiper blade sweeps surface'}</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep === 4 ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-500/20' :
            currentStep > 4 ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">4</span>
              {currentStep > 4 && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{tamilEnabled ? 'மறுஅளவீடு' : 'Re-Measurement'}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? '10 ஒலி எதிரொலி துடிப்புகளை மாதிரி எடுக்கவும்' : 'Sample 10 acoustic echo pulses'}</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep === 5 ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">5</span>
              {currentStep === 5 && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{tamilEnabled ? 'சரிபார்ப்பு மற்றும் மீட்டமைப்பு' : 'Validation & Restored'}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{tamilEnabled ? 'நம்பகத்தன்மை &gt;90% ஆக மீட்டமைக்கப்பட்டது' : 'Reliability restored &gt;90%'}</p>
          </div>

        </div>

        {/* Cleaning Progress Bar (when active) */}
        {isCleaningActive && (
          <div className="mt-6 p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-2 animate-in fade-in">
            <div className="flex justify-between text-xs font-bold text-cyan-900">
              <span className="flex items-center space-x-1.5">
                <RotateCw className="w-4 h-4 animate-spin text-cyan-600" />
                <span>{tamilEnabled ? 'நுண் இயக்கி துடைப்புச் சுழற்சி நடைபெறுகிறது...' : 'Executing Micro-Actuator Wiper Sweep Cycle...'}</span>
              </span>
              <span>{cleaningProgress}%</span>
            </div>
            <div className="w-full bg-cyan-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${cleaningProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Manual Step Trigger Buttons (Requirement 6) */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStepAction(3)}
              disabled={isCleaningActive}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 transition-colors"
            >
              {tamilEnabled ? '1. தூய்மையாக்கலைத் தொடங்கு' : '1. Start Cleaning'}
            </button>
            <button
              onClick={() => handleStepAction(4)}
              disabled={isCleaningActive}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-50 transition-colors"
            >
              {tamilEnabled ? '2. மறுஅளவீடு செய்' : '2. Re-measure'}
            </button>
            <button
              onClick={() => handleStepAction(5)}
              disabled={isCleaningActive}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-50 transition-colors"
            >
              {tamilEnabled ? '3. சென்சாரைச் சரிபார்' : '3. Validate Sensor'}
            </button>
          </div>

          <button
            onClick={handleStartFullCleaningCycle}
            disabled={isCleaningActive}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold text-xs shadow-md shadow-cyan-600/25 flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{tamilEnabled ? 'முழுத் தானியங்கி தூய்மையாக்கும் சுழற்சியை இயக்கு' : 'Execute Full Automated Cleaning Cycle'}</span>
          </button>
        </div>

      </div>

      {/* BEFORE VS AFTER CLEANING COMPARISON CARD (Requirement 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Before Cleaning */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm">
              {tamilEnabled ? 'தூய்மையாக்கலுக்கு முன் தொலைஅளவீடு' : 'Telemetry Before Cleaning'}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {tamilEnabled ? 'குறைந்த செயல்நிலை' : 'Degraded State'}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'சென்சார் நம்பகத்தன்மை:' : 'Sensor Reliability:'}</span>
              <span className="font-mono font-bold text-amber-700">
                {lastCleanResult ? `${lastCleanResult.reliabilityBeforePercent}%` : `${selectedSensor.reliabilityPercent}%`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'சிக்னல்-இரைச்சல் விகிதம் (SNR):' : 'Signal-to-Noise Ratio (SNR):'}</span>
              <span className="font-mono font-bold text-slate-800">14.2 dB ({tamilEnabled ? 'குறைவு' : 'Poor'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'எதிரொலி துடிப்பு ஏற்ற இறக்கம்:' : 'Echo Pulse Jitter:'}</span>
              <span className="font-mono font-bold text-rose-700">±18.4% ({tamilEnabled ? 'கடுமை' : 'Severe'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'இயற்பியல் தடுப்பு:' : 'Physical Obstruction:'}</span>
              <span className="font-semibold text-slate-700">{tamilEnabled ? 'ஈரப்பதம் மற்றும் தூசி' : 'Condensation & Dust'}</span>
            </div>
          </div>
        </div>

        {/* After Cleaning */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm">
              {tamilEnabled ? 'இயக்கி தூய்மையாக்கலுக்குப் பின் தொலைஅளவீடு' : 'Telemetry After Actuator Cleaning'}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {lastCleanResult ? (tamilEnabled ? 'மீட்டமைக்கப்பட்டது' : 'Restored') : (tamilEnabled ? 'தூய்மையாக்கலுக்குப் பிந்தைய கணிப்பு' : 'Projected Post-Clean')}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'சென்சார் நம்பகத்தன்மை:' : 'Sensor Reliability:'}</span>
              <span className="font-mono font-bold text-emerald-700">
                {lastCleanResult ? `${lastCleanResult.reliabilityAfterPercent}%` : (tamilEnabled ? '94% (பெயரளவு)' : '94% (Nominal)')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'சிக்னல்-இரைச்சல் விகிதம் (SNR):' : 'Signal-to-Noise Ratio (SNR):'}</span>
              <span className="font-mono font-bold text-emerald-700">28.6 dB ({tamilEnabled ? 'உகந்தது' : 'Optimal'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'எதிரொலி துடிப்பு ஏற்ற இறக்கம்:' : 'Echo Pulse Jitter:'}</span>
              <span className="font-mono font-bold text-emerald-700">±1.2% ({tamilEnabled ? 'நிலையானது' : 'Stable'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tamilEnabled ? 'நிலைத் தீர்மானம்:' : 'Status Verdict:'}</span>
              <span className="font-bold text-emerald-700">{tamilEnabled ? 'அளவுத்திருத்தம் செய்து செயல்பாட்டில் உள்ளது' : 'Calibrated & Operational'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* HISTORICAL CLEANING LOGS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h4 className="font-extrabold text-slate-900 text-sm mb-4">
          {tamilEnabled ? 'சென்சார் சுய-தூய்மையாக்க இயக்கத் தணிக்கைப் பதிவு' : 'Sensor Self-Cleaning Actuation Audit Log'}
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="pb-3">{tamilEnabled ? 'நேரமுத்திரை' : 'Timestamp'}</th>
                <th className="pb-3">{tamilEnabled ? 'சென்சார் முனை' : 'Sensor Node'}</th>
                <th className="pb-3">{tamilEnabled ? 'இயங்குமுறை' : 'Mechanism'}</th>
                <th className="pb-3">{tamilEnabled ? 'முன்' : 'Before'}</th>
                <th className="pb-3">{tamilEnabled ? 'பின்' : 'After'}</th>
                <th className="pb-3">{tamilEnabled ? 'கால அளவு' : 'Duration'}</th>
                <th className="pb-3">{tamilEnabled ? 'நிலை' : 'Status'}</th>
                <th className="pb-3">{tamilEnabled ? 'குறிப்புகள்' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cleanLogs.map((cl) => (
                <tr key={cl.id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono text-slate-500">{cl.timestamp}</td>
                  <td className="py-3 font-bold text-slate-900">{cl.sensorName}</td>
                  <td className="py-3 text-slate-600">{logMechanismLabel(cl.mechanismUsed)}</td>
                  <td className="py-3 font-mono text-amber-700 font-semibold">{cl.reliabilityBeforePercent}%</td>
                  <td className="py-3 font-mono text-emerald-700 font-bold">{cl.reliabilityAfterPercent}%</td>
                  <td className="py-3 text-slate-500">{cl.durationSeconds}s</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {cleanStatusLabel(cl.status)}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 max-w-xs">{logNotesLabel(cl.notes)}</td>
                </tr>
              ))}
              {cleanLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">{tamilEnabled ? 'தூய்மையாக்கப் பதிவுகள் எதுவும் இல்லை.' : 'No cleaning records found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
