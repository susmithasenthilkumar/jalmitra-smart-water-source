export type UserRole = 'villager' | 'supervisor' | 'admin' | 'public';

export interface Ward {
  id: string;
  villageId: string;
  name: string;
  tamilName: string;
  householdCount: number;
  linemanName: string;
  linemanPhone: string;
}

export interface WaterQualityData {
  villageId: string;
  tdsPpm: number;          // Safe: < 500 ppm
  phLevel: number;         // Safe: 6.5 - 8.5
  turbidityNtu: number;    // Safe: < 5 NTU
  chlorineMgL: number;     // Safe: 0.2 - 0.5 mg/L
  temperatureC: number;
  isPotable: boolean;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  testedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'villager' | 'supervisor' | 'admin';
  phone?: string;
  email?: string;
  villageId?: string;
  villageName?: string;
  wardId?: string;
  wardName?: string;
  designation?: string;
  isRegistered?: boolean;
}

export type SensorType = 
  | 'ultrasonic_level'
  | 'inlet_flow'
  | 'outlet_flow'
  | 'pressure'
  | 'water_quality'
  | 'pump_current';

export type SensorState = 'normal' | 'warning' | 'critical' | 'contaminated' | 'offline';

export interface SensorItem {
  id: string;
  name: string;
  type: SensorType;
  villageId: string;
  villageName: string;
  tankId?: string;
  tankName?: string;
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  status: SensorState;
  lastUpdated: string;
  reliabilityPercent: number; // 0-100
  cleaningMechanismAvailable: boolean;
  lastCleanedAt?: string;
  isCleaningActive?: boolean;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  sensorType: SensorType;
  villageId: string;
  tankId?: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface Village {
  id: string;
  name: string;
  tamilName?: string;
  district: string;
  population: number;
  householdCount: number;
  tankCount: number;
  pumpCount: number;
  distributionZones: string[];
  wards?: Ward[];
  waterQuality?: WaterQualityData;
  currentWaterLevelAvg: number; // percentage
  dailyDemandLiters: number;
  waterSuppliedTodayLiters: number;
  supplyStatus: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'SUSPENDED';
  linemanName: string;
  linemanPhone: string;
  panchayatPresident: string;
}

export interface Tank {
  id: string;
  name: string;
  villageId: string;
  villageName: string;
  capacityLiters: number;
  currentLevelLiters: number;
  currentLevelPercent: number;
  inletFlowLpm: number;
  outletFlowLpm: number;
  pressureBar: number;
  status: 'OPTIMAL' | 'REFILLING' | 'LOW' | 'CRITICAL' | 'MAINTENANCE';
  pumpConnectedId: string;
  lastUpdated: string;
  tankType?: string;
  heightMeters?: number;
}

export interface Pump {
  id: string;
  name: string;
  villageId: string;
  villageName: string;
  tankId: string;
  powerHp: number;
  status: 'RUNNING' | 'STOPPED' | 'TRIPPED' | 'MAINTENANCE';
  currentAmps: number;
  normalAmps: number;
  runtimeTodayHours: number;
  dryRunProtectionActive: boolean;
  controlledRemotely: boolean;
  lastToggledAt: string;
  voltageV?: number;
  flowRateLpm?: number;
  sourceWell?: string;
}

export type ComplaintType = 
  | 'NO_WATER_SUPPLY'
  | 'LOW_PRESSURE'
  | 'DIRTY_OR_CONTAMINATED_WATER'
  | 'PIPELINE_LEAKAGE'
  | 'VALVE_DAMAGED'
  | 'IRREGULAR_TIMING'
  | 'OTHER';

export type ComplaintStatus = 'SUBMITTED' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED';

export interface CitizenSensorCorrelation {
  analyzedAt: string;
  correlatedZone: string;
  matchedTankId: string;
  tankLevelPercent: number;
  zoneFlowLpm: number;
  zonePressureBar: number;
  pumpStatus: string;
  isPhysicalFaultConfirmed: boolean;
  technicalFinding: string;
  suggestedAction: string;
  confidenceScore: number;
}

export interface Complaint {
  id: string; // e.g. JAL-2026-1042
  citizenName: string;
  mobile: string;
  villageId: string;
  villageName: string;
  wardId?: string;
  wardName?: string;
  streetLocation: string;
  complaintType: ComplaintType;
  description: string;
  photoUrl?: string;
  createdAt: string;
  status: ComplaintStatus;
  adminRemark?: string;
  assignedStaff?: string;
  resolvedAt?: string;
  correlation?: CitizenSensorCorrelation;
  daysPending?: number;
  isEscalatedToSupervisor?: boolean;
  escalationReason?: string;
  escalatedAt?: string;
}

export interface WaterSchedule {
  id: string;
  villageId: string;
  villageName: string;
  zone: string;
  wardId?: string;
  wardName?: string;
  tankId: string;
  tankName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Daily';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  supplyStatus: 'ACTIVE_NOW' | 'UPCOMING' | 'COMPLETED' | 'SUSPENDED';
  remarks: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentType: 'Submersible Pump' | 'Overhead Tank' | 'Ultrasonic Sensor' | 'Flow Meter' | 'Distribution Pipeline' | 'Sluice Valve';
  villageId: string;
  villageName: string;
  problem: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedStaff: string;
  staffPhone: string;
  startDate: string;
  expectedCompletion: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed';
  remarks: string;
  costEstimatedInr?: number;
}

export interface AlertItem {
  id: string;
  alertType: 'LEAKAGE' | 'LOW_TANK_LEVEL' | 'HIGH_PRESSURE' | 'LOW_PRESSURE' | 'PUMP_FAILURE' | 'SENSOR_FAULT' | 'SENSOR_CONTAMINATION' | 'ABNORMAL_CONSUMPTION' | 'MAINTENANCE_REQUIRED' | 'SUPERVISOR_ESCALATION';
  title: string;
  villageId: string;
  villageName: string;
  tankId?: string;
  sensorId?: string;
  complaintId?: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  description: string;
  recommendedAction: string;
}

export interface ZoneBaseline {
  villageId: string;
  villageName: string;
  zoneId: string;
  zoneName: string;
  tankId: string;
  normalLevelMinPercent: number;
  normalLevelMaxPercent: number;
  normalInletLpmRange: [number, number];
  normalOutletLpmRange: [number, number];
  normalPressureBarRange: [number, number];
  typicalDailyDemandLiters: number;
  lastBaselineUpdate: string;
}

export interface AIAnomalyResult {
  id: string;
  villageId: string;
  villageName: string;
  zoneName: string;
  timestamp: string;
  condition: 
    | 'Normal'
    | 'Possible Leakage'
    | 'Abnormal Water Consumption'
    | 'Pump Problem'
    | 'Pipeline Blockage'
    | 'Sensor Fault'
    | 'Low Water Level'
    | 'Pressure Abnormality';
  anomalyScore: number; // 0 to 100
  confidence: number;   // 0 to 100%
  probableCause: string;
  recommendedAction: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  parametersChecked: {
    waterLevelDeviation: number;
    flowDeltaLpm: number;
    pressureDeviationBar: number;
    pumpStateConsistent: boolean;
  };
}

export interface FaultDiagnosis {
  id: string;
  timestamp: string;
  villageName: string;
  verdict: 'Probable Sensor Issue' | 'Probable Infrastructure Issue' | 'Normal Operation';
  confidence: number;
  explanation: string;
  sensorIndicators: {
    ultrasonicReadingAbnormal: boolean;
    flowConsistentWithLevel: boolean;
    pressureConsistentWithFlow: boolean;
    pumpTelemetryValid: boolean;
  };
  recommendedNextStep: string;
}

export interface SelfCleanLog {
  id: string;
  sensorId: string;
  sensorName: string;
  villageName: string;
  timestamp: string;
  stage: 'IDLE' | 'DIRT_DETECTED' | 'CLEANING_ACTUATOR_ACTIVE' | 'RE_MEASURING' | 'VALIDATING' | 'RESTORED' | 'MAINTENANCE_REQUIRED';
  reliabilityBeforePercent: number;
  reliabilityAfterPercent: number;
  durationSeconds: number;
  mechanismUsed: 'Mini Wiper Blade' | 'Cleaning Ultrasonic Ring' | 'Solvent Actuator Jet';
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED_NEEDS_LINEMAN';
  notes: string;
}

// Convenient type aliases
export type SystemAlert = AlertItem;
export type PumpItem = Pump;
export type TankItem = Tank;

