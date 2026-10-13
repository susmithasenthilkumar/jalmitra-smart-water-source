import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sliders, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  Cpu, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { AIEngine } from '../services/aiEngine';

interface FaultVerificationViewProps {
  tamilEnabled: boolean;
}

export const FaultVerificationView: React.FC<FaultVerificationViewProps> = ({
  tamilEnabled
}) => {
  // Interactive Verification Matrix State
  const [ultrasonicAbnormal, setUltrasonicAbnormal] = useState<boolean>(true);
  const [flowConsistent, setFlowConsistent] = useState<boolean>(true);
  const [pressureConsistent, setPressureConsistent] = useState<boolean>(true);
  const [pumpValid, setPumpValid] = useState<boolean>(true);
  const [villageName, setVillageName] = useState<string>('Pudur West Panchayat');

  const diagnosis = AIEngine.verifyFaultOrigin({
    ultrasonicReadingAbnormal: ultrasonicAbnormal,
    flowConsistentWithLevel: flowConsistent,
    pressureConsistentWithFlow: pressureConsistent,
    pumpTelemetryValid: pumpValid,
    villageName
  });

  const verdictLabel = (verdict: string) => tamilEnabled ? ({
    'Probable Sensor Issue': 'சென்சார் கோளாறு இருக்கலாம்',
    'Probable Infrastructure Issue': 'கட்டமைப்புக் கோளாறு இருக்கலாம்',
    'Normal Operation': 'இயல்பான செயல்பாடு'
  }[verdict] || verdict) : verdict;

  const diagnosisExplanation = (verdict: string, explanation: string) => {
    if (!tamilEnabled) return explanation;
    if (verdict === 'Probable Sensor Issue') return 'மீயொலி நீர்மட்ட அளவீட்டில் ஏற்ற இறக்கங்கள் அல்லது திடீர் மாற்றங்கள் உள்ளன. ஆனால் குழாய் ஓட்டமும் வலையமைப்பு அழுத்தமும் நிலையாகவும் பம்ப் மின்னோட்டம் இயல்பாகவும் உள்ளன. எனவே உண்மையான நீர் இழப்பை விட ஒலி குறுக்கீடு, டிரான்ஸ்யூசரில் ஈரப்பதம் அல்லது சிலந்திவலை காரணமாக இருக்கலாம்.';
    if (verdict === 'Probable Infrastructure Issue') return 'பல தனித்த சென்சார்களின் இயற்பியல் தொடர்பு உறுதிப்படுத்தப்பட்டுள்ளது. உள்வரவு ஓட்டம், விநியோக அழுத்தம் மற்றும் தொட்டி வெளியேற்றம் ஆகியவற்றின் நீரியல் தொடர்பு பாதிக்கப்பட்டுள்ளது. குறுக்குச் சரிபார்ப்பு தனிப்பட்ட சென்சார் கோளாறைத் தவிர்க்கிறது.';
    return 'எதிர்பார்க்கப்படும் நீரியல் விதிகளுடன் அனைத்து சென்சார் முனைகளும் ஒத்துப்போகின்றன. தனிப்பட்ட அல்லது பரவலான கோளாறு எதுவும் கண்டறியப்படவில்லை.';
  };

  const nextStepLabel = (verdict: string, nextStep: string) => {
    if (!tamilEnabled) return nextStep;
    if (verdict === 'Probable Sensor Issue') return 'தானியங்கி சென்சார் சுய-தூய்மையாக்கும் துடைப்பானை இயக்கவும். தளத் தொழில்நுட்பப் பணியாளரை அனுப்புவதற்கு முன் சிக்னல் நம்பகத்தன்மையை மீண்டும் அளவிடவும்.';
    if (verdict === 'Probable Infrastructure Issue') return 'உட்கட்டமைப்புக் கோளாறு உறுதிப்படுத்தப்பட்டுள்ளது. குழாய்/பம்ப்/வால்வை உடனடியாக ஆய்வு செய்ய பணியாளர் குழுவை அனுப்பவும்.';
    return 'நடவடிக்கை தேவையில்லை. அமைப்பு தொடர்ந்து இயல்புநிலையைக் கண்காணிக்கிறது.';
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-2">
          <GitCompare className="w-4 h-4 text-cyan-600" />
          <span>{tamilEnabled ? 'பல-அளவுரு கோளாறு வேறுபடுத்தும் இயந்திரம்' : 'Multi-Parametric Disambiguation Engine'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {tamilEnabled ? 'சென்சார் கோளாறு vs கட்டமைப்பு கோளாறு சரிபார்ப்பு' : 'Sensor Fault vs Infrastructure Fault Verification'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          {tamilEnabled ? 'கிராமப்புற நீர் வலையமைப்புகளில் பாசி, ஈரப்பதம் அல்லது தளர்ந்த கம்பிகள் காரணமாக ஒற்றைச் சென்சார் எச்சரிக்கைகள் தவறான எச்சரிக்கைகளை உருவாக்கலாம். ஜல் மித்ரா 360 பல நீரியல் சென்சார்களின் (மீயொலி நீர்மட்டம் + Hall ஓட்டமானிகள் + piezoresistive அழுத்தம் + பம்ப் CT) குறுக்குச் சரிபார்ப்பைப் பயன்படுத்தி, கருவிக் கோளாறையும் உண்மையான குழாய் உடைப்பையும் வேறுபடுத்துகிறது.' : 'In rural water networks, single-sensor alarms frequently generate false alarms due to algae, condensation, or loose wires. Jal Mitra 360 uses cross-verification across multiple hydrodynamic physical sensors (ultrasonic level + Hall flow meters + piezoresistive pressure + pump CT) to definitively isolate whether an anomaly is an instrument defect or a physical pipeline rupture.'}
        </p>
      </div>

      {/* CORE COMPARISON PRINCIPLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card A: Probable Sensor Fault */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 text-amber-800">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-base">{tamilEnabled ? 'சென்சார் கோளாறு இருக்கலாம்' : 'Probable Sensor Issue'}</h3>
              <p className="text-[11px] text-amber-700">{tamilEnabled ? 'கருவிப் பிழை / மாசடைதல் அறிகுறி' : 'Instrument Glitch / Fouling Signature'}</p>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200/60 text-xs space-y-2 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'நீர்மட்ட சென்சார்:' : 'Water Level Sensor:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">{tamilEnabled ? 'அசாதாரணம் / ஏற்ற இறக்கம்' : 'ABNORMAL / JUMPING'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'உள்வரவு மற்றும் வெளியேற்ற ஓட்டம்:' : 'Inlet & Outlet Flow:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{tamilEnabled ? 'இயல்பு' : 'NORMAL'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'விநியோகக் குழாய் அழுத்தம்:' : 'Distribution Line Pressure:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{tamilEnabled ? 'இயல்பு' : 'NORMAL'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'பம்ப் மின் தொலைஅளவீடு:' : 'Pump Electrical Telemetry:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{tamilEnabled ? 'இயல்பு' : 'NORMAL'}</span>
            </div>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>{tamilEnabled ? 'கணிப்பு:' : 'Inference:'}</strong> {tamilEnabled ? 'ஓட்டம் அல்லது அழுத்த மாற்றமின்றி நீர்மட்டம் வேகமாகக் குறைய முடியாது. எனவே தனித்த நீர்மட்டக் கோளாறு மீயொலி டிரான்ஸ்யூசர் எதிரொலிப் பிழையாக (ஈரப்பதம், சிலந்திவலை அல்லது மாசடைதல்) கருதப்படுகிறது.' : 'Because hydrodynamic laws dictate that water cannot drop rapidly without flow or pressure changes, an isolated level anomaly is diagnosed as an ultrasonic transducer echo error (condensation, spiderweb, or fouling).'}
          </p>

          <div className="pt-2">
            <span className="text-xs font-bold text-amber-900 block mb-1">{tamilEnabled ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை:' : 'Prescribed Action:'}</span>
            <span className="text-xs text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-xl block">
              {tamilEnabled ? 'தளப் பணியாளரை அனுப்புவதற்கு முன் தானியங்கி சுய-தூய்மையாக்கும் துடைப்பானை இயக்கவும்.' : 'Trigger automated self-cleaning wiper mechanism before dispatching field lineman.'}
            </span>
          </div>
        </div>

        {/* Card B: Probable Infrastructure Fault */}
        <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 text-rose-800">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-extrabold text-base">{tamilEnabled ? 'கட்டமைப்புக் கோளாறு இருக்கலாம்' : 'Probable Infrastructure Issue'}</h3>
              <p className="text-[11px] text-rose-700">{tamilEnabled ? 'உண்மையான குழாய் / பம்ப் உடைப்பு' : 'Physical Pipeline / Pump Fracture'}</p>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-rose-200/60 text-xs space-y-2 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'நீர்மட்ட சென்சார்:' : 'Water Level Sensor:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">{tamilEnabled ? 'வேகமாகக் குறைகிறது' : 'DECREASING RAPIDLY'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'வெளியேற்ற ஓட்டமானி:' : 'Outlet Flow Meter:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">{tamilEnabled ? 'அதிகம் / திடீர் உயர்வு' : 'HIGH / SURGING'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'குழாய் அழுத்தம்:' : 'Pipeline Pressure:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">{tamilEnabled ? 'சரிந்தது' : 'COLLAPSED'} (&lt;1.2 BAR)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tamilEnabled ? 'உள்வரவு - வெளியேற்ற நிறைச் சமநிலை:' : 'Inlet vs Outlet Mass Balance:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">{tamilEnabled ? 'பாதிக்கப்பட்டது' : 'DISRUPTED'}</span>
            </div>
          </div>

          <p className="text-xs text-rose-900 leading-relaxed">
            <strong>{tamilEnabled ? 'கணிப்பு:' : 'Inference:'}</strong> {tamilEnabled ? 'பல இயற்பியல் சென்சார்கள் ஒரே நேரத்தில் நீரியல் உடைப்பு மாதிரிகளுடன் பொருந்தும் மாற்றங்களைப் பதிவு செய்கின்றன. குறுக்குச் சரிபார்ப்பு ஒற்றைச் சென்சார் பிழையைத் தவிர்க்கிறது.' : 'Multiple physical sensors register synchronized covariance matching hydrodynamic rupture models. Cross-verification eliminates single-sensor artifact.'}
          </p>

          <div className="pt-2">
            <span className="text-xs font-bold text-rose-900 block mb-1">{tamilEnabled ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை:' : 'Prescribed Action:'}</span>
            <span className="text-xs text-rose-800 bg-rose-100/70 px-3 py-1.5 rounded-xl block">
              {tamilEnabled ? 'தனிமைப்படுத்தும் கேட் வால்வை அவசரமாக மூடி, உடனடி அகழ்வு பழுதுபார்ப்பு பணியைத் தொடங்கவும்.' : 'Emergency shutdown of isolating gate valve and immediate excavation repair order.'}
            </span>
          </div>
        </div>

      </div>

      {/* INTERACTIVE VERIFICATION WORKBENCH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="pb-4 mb-6 border-b border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-900">
            {tamilEnabled ? 'பல சென்சார் கோளாறு வேறுபடுத்தும் ஊடாடும் பணித்தளம்' : 'Interactive Multi-Sensor Fault Disambiguation Workbench'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'சென்சார் தூய்மையாக்கலைத் தொடங்க வேண்டுமா அல்லது கட்டமைப்பு பராமரிப்புக் குழுவை அனுப்ப வேண்டுமா என்பதை இயந்திரம் எவ்வாறு மதிப்பிடுகிறது எனக் காண, கீழே உள்ள சென்சார் நிலைகளை மாற்றவும்.' : 'Toggle individual sensor observations below to watch how the engine evaluates whether to order sensor cleaning vs dispatch an infrastructure maintenance team.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{tamilEnabled ? '1. தொட்டியின் மீயொலி நீர்மட்ட சென்சார்' : '1. Ultrasonic Tank Level Sensor'}</span>
                <span className="text-[11px] text-slate-500">{tamilEnabled ? 'டிரான்ஸ்யூசர் தொலைஅளவீட்டு நிலை' : 'Transducer telemetry status'}</span>
              </div>
              <button
                type="button"
                onClick={() => setUltrasonicAbnormal(!ultrasonicAbnormal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ultrasonicAbnormal ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {ultrasonicAbnormal ? (tamilEnabled ? 'அசாதாரணம் (ஏற்ற இறக்கம்/சரிவு)' : 'ABNORMAL (Jitter/Drop)') : (tamilEnabled ? 'இயல்பு' : 'NORMAL')}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{tamilEnabled ? '2. குழாய் ஓட்ட விகிதம் மற்றும் நீர்மட்டத் தொடர்பு' : '2. Pipe Flow Rate vs Level Correlation'}</span>
                <span className="text-[11px] text-slate-500">{tamilEnabled ? 'தொட்டி காலியாகும் வேகத்துடன் ஓட்டம் ஒத்துப்போகிறதா?' : 'Is flow consistent with tank drain rate?'}</span>
              </div>
              <button
                type="button"
                onClick={() => setFlowConsistent(!flowConsistent)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  flowConsistent ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {flowConsistent ? (tamilEnabled ? 'ஒத்துள்ளது (இயல்பு)' : 'CONSISTENT (Normal)') : (tamilEnabled ? 'ஒத்தில்லை (உயர்வு/பூஜ்ஜியம்)' : 'INCONSISTENT (Surge/Zero)')}
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{tamilEnabled ? '3. குழாய் அழுத்த இயக்கவியல்' : '3. Pipeline Pressure Dynamics'}</span>
                <span className="text-[11px] text-slate-500">{tamilEnabled ? 'குழாய் அழுத்தம் ஓட்ட வேகத்துடன் பொருந்துகிறதா?' : 'Does line pressure match flow velocity?'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPressureConsistent(!pressureConsistent)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pressureConsistent ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {pressureConsistent ? (tamilEnabled ? 'ஒத்துள்ளது (நிலையானது)' : 'CONSISTENT (Stable)') : (tamilEnabled ? 'சரிந்தது / அசாதாரணம்' : 'COLLAPSED / ABNORMAL')}
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{tamilEnabled ? '4. பம்ப் மின்னோட்டம் மற்றும் மோட்டார் நிலை' : '4. Pump Current & Motor Health'}</span>
                <span className="text-[11px] text-slate-500">{tamilEnabled ? 'CT மின்னோட்ட சென்சார் தொலைஅளவீடு' : 'CT current sensor telemetry'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPumpValid(!pumpValid)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pumpValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {pumpValid ? (tamilEnabled ? 'நலமாக உள்ளது (14 Amps)' : 'HEALTHY (14 Amps)') : (tamilEnabled ? 'தடைப்பட்டது / நீரின்றி இயங்குகிறது' : 'TRIPPED / DRY RUN')}
              </button>
            </div>

          </div>

          {/* Verdict Display (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                {tamilEnabled ? 'பல சென்சார் தீர்மானம்' : 'Multi-Sensor Verdict'}
              </span>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {tamilEnabled ? 'நம்பகத்தன்மை:' : 'Confidence:'} {diagnosis.confidence}%
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">{tamilEnabled ? 'வகைப்படுத்தல் தீர்மானம்:' : 'Classification Verdict:'}</div>
              <div className={`text-2xl font-black ${
                diagnosis.verdict === 'Probable Sensor Issue' ? 'text-amber-400' :
                diagnosis.verdict === 'Probable Infrastructure Issue' ? 'text-rose-400' :
                'text-emerald-400'
              }`}>
                {verdictLabel(diagnosis.verdict)}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-cyan-200 font-bold mb-1">{tamilEnabled ? 'குறுக்குச் சரிபார்ப்பு விளக்கம்:' : 'Cross-Validation Rationale:'}</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {diagnosisExplanation(diagnosis.verdict, diagnosis.explanation)}
              </p>
            </div>

            <div className="pt-2">
              <div className="text-xs text-emerald-300 font-bold mb-1">{tamilEnabled ? 'பரிந்துரைக்கப்படும் அடுத்த படி:' : 'Prescribed Next Step:'}</div>
              <p className="text-xs text-emerald-200 leading-relaxed bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60">
                {nextStepLabel(diagnosis.verdict, diagnosis.recommendedNextStep)}
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
