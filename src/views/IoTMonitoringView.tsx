import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Radio, 
  Cpu, 
  Wifi, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Code, 
  Play, 
  Pause, 
  RefreshCw, 
  Layers, 
  Gauge, 
  Droplet, 
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { SensorItem, SensorType } from '../types';

interface IoTMonitoringViewProps {
  onNavigate: (viewId: string) => void;
  tamilEnabled: boolean;
}

export const IoTMonitoringView: React.FC<IoTMonitoringViewProps> = ({
  onNavigate,
  tamilEnabled
}) => {
  const [sensors, setSensors] = useState<SensorItem[]>(dataService.sensors);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('ALL');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(dataService.isSimulating());
  const [showJsonPayload, setShowJsonPayload] = useState<boolean>(false);

  useEffect(() => {
    const sync = () => {
      setSensors([...dataService.sensors]);
      setIsSimulating(dataService.isSimulating());
    };
    sync();
    return dataService.subscribe(sync);
  }, []);

  const handleToggleSim = () => {
    dataService.toggleSimulation();
    setIsSimulating(dataService.isSimulating());
  };

  // Filter sensors
  const filteredSensors = sensors.filter(s => {
    const matchVillage = selectedVillageId === 'ALL' || s.villageId === selectedVillageId;
    const matchType = selectedSensorType === 'ALL' || s.type === selectedSensorType;
    return matchVillage && matchType;
  });

  const statusLabel = (status: string) => tamilEnabled ? ({
    normal: 'இயல்பு',
    warning: 'எச்சரிக்கை',
    critical: 'ஆபத்து',
    contaminated: 'மாசடைந்தது',
    offline: 'இணைப்பில்லை'
  }[status] || status) : status;

  // Sample ESP32 JSON payload representation
  const activeEsp32Packet = {
    nodeId: 'ESP32_PANCHAYAT_NODE_01',
    firmwareVersion: 'v2.4.1-lora',
    timestamp: new Date().toISOString(),
    network: 'LoRaWAN + GSM Auto-Failover',
    rssi: -68,
    batteryVoltage: 4.12,
    sensors: sensors.slice(0, 5).map(s => ({
      sensorId: s.id,
      type: s.type,
      value: s.currentValue,
      unit: s.unit,
      reliability: s.reliabilityPercent,
      rawAdc: Math.round(s.currentValue * 38.4)
    }))
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-500 animate-ping" />
            <span>{tamilEnabled ? 'ESP32 தொலைஅளவீட்டு வலை • நிகழ்நேரத் தரவு பெறுதல்' : 'ESP32 Telemetry Grid • Real-Time Ingestion'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {tamilEnabled ? 'ஐஓடி சென்சார் நேரலை கண்காணிப்பு' : 'IoT Sensor Monitoring & Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tamilEnabled ? 'நேரடி ஒலி நீர்மட்டம், மின்காந்த ஓட்டமானிகள், piezoresistive அழுத்தம் மற்றும் நீர்தரத் தொலைஅளவீடு.' : 'Live acoustic level, electromagnetic flow meters, piezoresistive pressure, and water quality telemetry.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSim}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all ${
              isSimulating 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? (tamilEnabled ? 'தரவு ஓட்டம் இயங்குகிறது' : 'Stream Running') : (tamilEnabled ? 'தரவு ஓட்டம் இடைநிறுத்தப்பட்டது' : 'Stream Paused')}</span>
          </button>

          <button
            onClick={() => setShowJsonPayload(!showJsonPayload)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showJsonPayload ? (tamilEnabled ? 'ESP32 தரவுத் தொகுப்பை மறை' : 'Hide ESP32 Packet') : (tamilEnabled ? 'ESP32 தரவுத் தொகுப்பைக் காண்க' : 'View ESP32 Packet')}</span>
          </button>
        </div>
      </div>

      {/* Raw ESP32 JSON Modal / Accordion */}
      {showJsonPayload && (
        <div className="bg-slate-950 text-emerald-400 rounded-3xl p-5 border border-slate-800 font-mono text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span>{tamilEnabled ? 'நேரடி MQTT / HTTP தரவு பெறுதல் (ESP32 &rarr; Node Express API)' : 'LIVE MQTT / HTTP INGESTION PAYLOAD (ESP32 &rarr; Node Express API)'}</span>
            </span>
            <span>Target: POST /api/esp32/telemetry</span>
          </div>
          <pre className="overflow-x-auto pt-3 text-[11px] leading-relaxed">
            {JSON.stringify(activeEsp32Packet, null, 2)}
          </pre>
        </div>
      )}

      {/* ARCHITECTURE VISUALIZER CARD (Requirement 3 & 20) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md">
        <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
          {tamilEnabled ? 'கிராமப்புற நீர் வலையமைப்பு செயல்பாட்டு ஓட்டம்' : 'Rural Water Network Architecture Flow'}
        </div>
        <h3 className="text-lg font-extrabold mb-4">
          {tamilEnabled ? 'எட்ஜ் சென்சார் அளவீட்டிலிருந்து ஊராட்சி தகவமைவு நடவடிக்கை வரை' : 'Edge Sensing to Adaptive Panchayat Response Pipeline'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs">
          
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mx-auto mb-2 font-bold">
              1
            </div>
            <div className="font-bold">{tamilEnabled ? 'சென்சார்கள்' : 'Sensors'}</div>
            <p className="text-[10px] text-cyan-200/80 mt-1">{tamilEnabled ? 'நீர்மட்டம், ஓட்டம், அழுத்தம், TDS' : 'Level, Flow, Pressure, TDS'}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center mx-auto mb-2 font-bold">
              2
            </div>
            <div className="font-bold">ESP32</div>
            <p className="text-[10px] text-teal-200/80 mt-1">{tamilEnabled ? 'ADC, வடிகட்டல், அளவுத்திருத்தம்' : 'ADC, Filtering, Calibration'}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center mx-auto mb-2 font-bold">
              3
            </div>
            <div className="font-bold">Wi-Fi / LoRa / GSM</div>
            <p className="text-[10px] text-blue-200/80 mt-1">{tamilEnabled ? 'நீண்ட தூர கிராமப்புறத் தரவு பரிமாற்றம்' : 'Long-range rural transmission'}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-400/20 text-indigo-300 flex items-center justify-center mx-auto mb-2 font-bold">
              4
            </div>
            <div className="font-bold">{tamilEnabled ? 'மேகத் தரவுத்தளம்' : 'Cloud Database'}</div>
            <p className="text-[10px] text-indigo-200/80 mt-1">Firestore / Express REST</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center mx-auto mb-2 font-bold">
              5
            </div>
            <div className="font-bold">{tamilEnabled ? 'AI பகுப்பாய்வு' : 'AI Analysis'}</div>
            <p className="text-[10px] text-purple-200/80 mt-1">{tamilEnabled ? 'சுய-கற்றல் இயல்புநிலை மாதிரி' : 'Self-learning baseline model'}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mx-auto mb-2 font-bold">
              6
            </div>
            <div className="font-bold">{tamilEnabled ? 'தகவமைவு நடவடிக்கை' : 'Adaptive Response'}</div>
            <p className="text-[10px] text-emerald-200/80 mt-1">{tamilEnabled ? 'சுய-தூய்மையாக்கம், எச்சரிக்கைகள், களப் பணியாளர்' : 'Self-clean, alerts, lineman'}</p>
          </div>

        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">{tamilEnabled ? 'கிராமத்தின் அடிப்படையில் வடிகட்டு:' : 'Filter by Village:'}</span>
          {['ALL', 'VIL-01', 'VIL-02', 'VIL-03', 'VIL-04', 'VIL-05', 'VIL-06'].map(vId => (
            <button
              key={vId}
              onClick={() => setSelectedVillageId(vId)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedVillageId === vId
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {vId === 'ALL' ? (tamilEnabled ? 'அனைத்து கிராமங்கள்' : 'All Villages') : vId}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-700">{tamilEnabled ? 'வகை:' : 'Type:'}</span>
          <select
            value={selectedSensorType}
            onChange={(e) => setSelectedSensorType(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800"
          >
            <option value="ALL">{tamilEnabled ? 'அனைத்து சென்சார் வகைகள்' : 'All Sensor Types'}</option>
            <option value="ultrasonic_level">{tamilEnabled ? 'மீயொலி நீர்மட்டம்' : 'Ultrasonic Level'}</option>
            <option value="inlet_flow">{tamilEnabled ? 'உள்வரவு ஓட்டமானி' : 'Inlet Flow Meter'}</option>
            <option value="outlet_flow">{tamilEnabled ? 'வெளியேற்ற ஓட்டமானி' : 'Outlet Flow Meter'}</option>
            <option value="pressure">{tamilEnabled ? 'அழுத்த சென்சார்' : 'Pressure Sensor'}</option>
            <option value="water_quality">{tamilEnabled ? 'நீர்தரம் (TDS)' : 'Water Quality (TDS)'}</option>
            <option value="pump_current">{tamilEnabled ? 'பம்ப் மின்னோட்டம்' : 'Pump Current'}</option>
          </select>
        </div>
      </div>

      {/* SENSOR NODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSensors.map((sensor) => {
          const isWarning = sensor.status === 'warning';
          const isCritical = sensor.status === 'critical';
          const isContaminated = sensor.status === 'contaminated';

          return (
            <div 
              key={sensor.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
                isCritical ? 'border-rose-400 bg-rose-50/20' :
                isContaminated ? 'border-amber-400 bg-amber-50/20' :
                isWarning ? 'border-amber-300 bg-amber-50/10' :
                'border-slate-200 hover:border-cyan-300'
              }`}
            >
              <div>
                
                {/* Card Top: Node ID & State */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {sensor.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {sensor.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {sensor.villageName} {sensor.tankName ? `• ${sensor.tankName}` : ''}
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    isCritical ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    isContaminated ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    isWarning ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {statusLabel(sensor.status)}
                  </span>
                </div>

                {/* Primary Reading Display */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5">
                    {tamilEnabled ? 'நேரடி அளவீடு' : 'Live Measurement'}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      {sensor.currentValue}
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      {sensor.unit}
                    </span>
                  </div>

                  {/* Range indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                    <span>{tamilEnabled ? 'இயல்புநிலை வரம்பு:' : 'Baseline Range:'}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {sensor.normalRange[0]} - {sensor.normalRange[1]} {sensor.unit}
                    </span>
                  </div>
                </div>

                {/* Reliability & Cleaning Indicator */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{tamilEnabled ? 'சென்சார் நம்பகத்தன்மை:' : 'Sensor Reliability:'}</span>
                    <span className={`font-mono font-bold ${
                      sensor.reliabilityPercent > 85 ? 'text-emerald-600' :
                      sensor.reliabilityPercent > 70 ? 'text-amber-600' :
                      'text-rose-600'
                    }`}>
                      {sensor.reliabilityPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        sensor.reliabilityPercent > 85 ? 'bg-emerald-500' :
                        sensor.reliabilityPercent > 70 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${sensor.reliabilityPercent}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {tamilEnabled ? 'புதுப்பிக்கப்பட்டது:' : 'Updated:'} {sensor.lastUpdated}
                </span>

                {sensor.cleaningMechanismAvailable && (
                  <button
                    onClick={() => onNavigate('self_maintenance')}
                    className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center space-x-1"
                  >
                    <span>{tamilEnabled ? 'சுய-தூய்மையாக்கி இயக்கி' : 'Self-Clean Actuator'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
        {filteredSensors.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-500">
            {tamilEnabled ? 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு சென்சார்கள் எதுவும் இல்லை.' : 'No sensors match the selected filters.'}
          </p>
        )}
      </div>

    </div>
  );
};
