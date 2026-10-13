import { 
  Village, 
  Tank, 
  Pump, 
  SensorItem, 
  Complaint, 
  WaterSchedule, 
  MaintenanceRecord, 
  AlertItem, 
  AIAnomalyResult,
  SelfCleanLog,
  CitizenSensorCorrelation,
  UserProfile,
  Ward,
  WaterQualityData
} from '../types';

import {
  INITIAL_VILLAGES,
  INITIAL_TANKS,
  INITIAL_PUMPS,
  INITIAL_SENSORS,
  INITIAL_COMPLAINTS,
  INITIAL_SCHEDULES,
  INITIAL_MAINTENANCE,
  INITIAL_ALERTS,
  INITIAL_AI_ANOMALIES,
  INITIAL_SELF_CLEAN_LOGS,
  INITIAL_REGISTERED_VILLAGERS,
  INITIAL_OFFICIALS
} from '../data/mockData';

const STORAGE_KEYS = {
  VILLAGES: 'jalmitra_villages_v1',
  TANKS: 'jalmitra_tanks_v1',
  PUMPS: 'jalmitra_pumps_v1',
  SENSORS: 'jalmitra_sensors_v1',
  COMPLAINTS: 'jalmitra_complaints_v1',
  SCHEDULES: 'jalmitra_schedules_v1',
  MAINTENANCE: 'jalmitra_maintenance_v1',
  ALERTS: 'jalmitra_alerts_v1',
  ANOMALIES: 'jalmitra_anomalies_v1',
  CLEAN_LOGS: 'jalmitra_clean_logs_v1',
  CURRENT_USER: 'jalmitra_current_user_v1',
  REGISTERED_VILLAGERS: 'jalmitra_registered_villagers_v1',
  OFFICIALS: 'jalmitra_officials_v1'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`Error writing localStorage for key ${key}:`, e);
  }
}

type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();
  private simulationActive: boolean = true;
  private timer: number | null = null;

  public villages: Village[] = [];
  public tanks: Tank[] = [];
  public pumps: Pump[] = [];
  public sensors: SensorItem[] = [];
  public complaints: Complaint[] = [];
  public schedules: WaterSchedule[] = [];
  public maintenance: MaintenanceRecord[] = [];
  public alerts: AlertItem[] = [];
  public anomalies: AIAnomalyResult[] = [];
  public cleanLogs: SelfCleanLog[] = [];
  public currentUser: UserProfile | null = null;
  public registeredVillagers: UserProfile[] = [];
  public officials: UserProfile[] = [];

  constructor() {
    this.init();
    this.startSimulation();
  }

  public init() {
    this.villages = getStored<Village[]>(STORAGE_KEYS.VILLAGES, INITIAL_VILLAGES);
    this.tanks = getStored<Tank[]>(STORAGE_KEYS.TANKS, INITIAL_TANKS);
    this.pumps = getStored<Pump[]>(STORAGE_KEYS.PUMPS, INITIAL_PUMPS);
    this.sensors = getStored<SensorItem[]>(STORAGE_KEYS.SENSORS, INITIAL_SENSORS);
    this.complaints = getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    this.schedules = getStored<WaterSchedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    this.maintenance = getStored<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
    this.alerts = getStored<AlertItem[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    this.anomalies = getStored<AIAnomalyResult[]>(STORAGE_KEYS.ANOMALIES, INITIAL_AI_ANOMALIES);
    this.cleanLogs = getStored<SelfCleanLog[]>(STORAGE_KEYS.CLEAN_LOGS, INITIAL_SELF_CLEAN_LOGS);
    this.registeredVillagers = getStored<UserProfile[]>(STORAGE_KEYS.REGISTERED_VILLAGERS, INITIAL_REGISTERED_VILLAGERS);
    this.officials = getStored<UserProfile[]>(STORAGE_KEYS.OFFICIALS, INITIAL_OFFICIALS);
    this.currentUser = getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_REGISTERED_VILLAGERS[0]);
    this.checkAndEscalateComplaints();
  }

  public resetAllToDemo() {
    this.villages = [...INITIAL_VILLAGES];
    this.tanks = [...INITIAL_TANKS];
    this.pumps = [...INITIAL_PUMPS];
    this.sensors = [...INITIAL_SENSORS];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.schedules = [...INITIAL_SCHEDULES];
    this.maintenance = [...INITIAL_MAINTENANCE];
    this.alerts = [...INITIAL_ALERTS];
    this.anomalies = [...INITIAL_AI_ANOMALIES];
    this.cleanLogs = [...INITIAL_SELF_CLEAN_LOGS];
    this.saveAll();
    this.notify();
  }

  private saveAll() {
    setStored(STORAGE_KEYS.VILLAGES, this.villages);
    setStored(STORAGE_KEYS.TANKS, this.tanks);
    setStored(STORAGE_KEYS.PUMPS, this.pumps);
    setStored(STORAGE_KEYS.SENSORS, this.sensors);
    setStored(STORAGE_KEYS.COMPLAINTS, this.complaints);
    setStored(STORAGE_KEYS.SCHEDULES, this.schedules);
    setStored(STORAGE_KEYS.MAINTENANCE, this.maintenance);
    setStored(STORAGE_KEYS.ALERTS, this.alerts);
    setStored(STORAGE_KEYS.ANOMALIES, this.anomalies);
    setStored(STORAGE_KEYS.CLEAN_LOGS, this.cleanLogs);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Simulation Engine ---
  public toggleSimulation(active?: boolean) {
    this.simulationActive = active !== undefined ? active : !this.simulationActive;
    if (this.simulationActive && !this.timer) {
      this.startSimulation();
    } else if (!this.simulationActive && this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public isSimulating() {
    return this.simulationActive;
  }

  private startSimulation() {
    if (this.timer) window.clearInterval(this.timer);
    // Periodically update slight micro-variations
    this.timer = window.setInterval(() => {
      if (!this.simulationActive) return;
      this.stepMicroSimulation();
    }, 4000);
  }

  private stepMicroSimulation() {
    // Gentle natural drift in values
    let changed = false;
    this.sensors = this.sensors.map(s => {
      // Don't drift pump current if pump stopped
      if (s.type === 'pump_current' && s.currentValue === 0) return s;
      
      const jitter = (Math.random() - 0.5) * 0.4;
      let newVal = Number((s.currentValue + jitter).toFixed(1));
      
      if (s.type === 'ultrasonic_level') {
        newVal = Math.min(100, Math.max(15, newVal));
      } else if (s.type === 'pressure') {
        newVal = Math.min(4.0, Math.max(0.2, Number((s.currentValue + (Math.random() - 0.5) * 0.05).toFixed(2))));
      } else if (s.type === 'inlet_flow' || s.type === 'outlet_flow') {
        if (s.currentValue > 0) {
          newVal = Math.max(0, Math.round(s.currentValue + (Math.random() - 0.5) * 4));
        }
      }
      
      if (newVal !== s.currentValue) {
        changed = true;
        return {
          ...s,
          currentValue: newVal,
          lastUpdated: 'Just now'
        };
      }
      return s;
    });

    if (changed) {
      setStored(STORAGE_KEYS.SENSORS, this.sensors);
      this.notify();
    }
  }

  // Fault Injection for live demonstrations
  public injectFault(faultType: 'LEAK' | 'SENSOR_DIRT' | 'PUMP_TRIP' | 'NORMAL') {
    if (faultType === 'LEAK') {
      // Pudur Zone 2 leak
      this.sensors = this.sensors.map(s => {
        if (s.id === 'SNS-07') return { ...s, currentValue: 0.9, status: 'critical' };
        if (s.id === 'SNS-04') return { ...s, currentValue: 1.2, status: 'warning' };
        return s;
      });
      this.alerts = [
        {
          id: `ALT-${Date.now()}`,
          alertType: 'LEAKAGE',
          title: 'Simulated Rapid Distribution Pipeline Rupture',
          villageId: 'VIL-03',
          villageName: 'Pudur West Panchayat',
          tankId: 'TNK-04',
          sensorId: 'SNS-07',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'CRITICAL',
          status: 'ACTIVE',
          description: 'Simulated pipeline burst: Sudden pressure drop below 1.0 Bar with uncontrolled outflow.',
          recommendedAction: 'Isolate main valve SV-04 and inspect field section.'
        },
        ...this.alerts
      ];
    } else if (faultType === 'SENSOR_DIRT') {
      this.sensors = this.sensors.map(s => {
        if (s.id === 'SNS-01') {
          return {
            ...s,
            status: 'contaminated',
            reliabilityPercent: 55,
            currentValue: 89
          };
        }
        return s;
      });
      this.alerts = [
        {
          id: `ALT-${Date.now()}`,
          alertType: 'SENSOR_CONTAMINATION',
          title: 'Ultrasonic Transducer Fouling Injected',
          villageId: 'VIL-01',
          villageName: 'Melur Gram Panchayat',
          sensorId: 'SNS-01',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'WARNING',
          status: 'ACTIVE',
          description: 'Acoustic wave dampening detected on SNS-01. Reliability dropped to 55%.',
          recommendedAction: 'Trigger self-cleaning actuator wiper cycle.'
        },
        ...this.alerts
      ];
    } else if (faultType === 'PUMP_TRIP') {
      this.pumps = this.pumps.map(p => {
        if (p.id === 'PMP-01') {
          return { ...p, status: 'TRIPPED', currentAmps: 0.0 };
        }
        return p;
      });
    } else if (faultType === 'NORMAL') {
      this.resetAllToDemo();
      return;
    }

    this.saveAll();
    this.notify();
  }

  // --- Authentication & User Session Management ---
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    this.currentUser = user;
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  public registerVillager(data: {
    name: string;
    phone: string;
    villageId: string;
    villageName: string;
    wardId: string;
    wardName: string;
  }): UserProfile {
    const cleanPhone = data.phone.trim().replace(/\D/g, '');
    const existing = this.registeredVillagers.find(v => v.phone?.replace(/\D/g, '') === cleanPhone);
    if (existing) {
      existing.name = data.name;
      existing.villageId = data.villageId;
      existing.villageName = data.villageName;
      existing.wardId = data.wardId;
      existing.wardName = data.wardName;
      this.saveUsers();
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser: UserProfile = {
      id: `USR-VIL-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      role: 'villager',
      phone: cleanPhone,
      villageId: data.villageId,
      villageName: data.villageName,
      wardId: data.wardId,
      wardName: data.wardName,
      isRegistered: true
    };

    this.registeredVillagers = [newUser, ...this.registeredVillagers];
    this.saveUsers();
    this.setCurrentUser(newUser);
    return newUser;
  }

  public loginVillager(phone: string): UserProfile | null {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    let user = this.registeredVillagers.find(v => v.phone?.replace(/\D/g, '') === cleanPhone);
    if (!user) {
      // If first-time phone number that matches a default villager
      user = INITIAL_REGISTERED_VILLAGERS.find(v => v.phone?.replace(/\D/g, '') === cleanPhone);
    }
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  public registerOfficial(data: {
    name: string;
    email: string;
    role: 'admin' | 'supervisor';
    designation?: string;
  }): UserProfile {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.officials.find(o => o.email?.toLowerCase() === cleanEmail);
    if (existing) {
      existing.name = data.name;
      existing.role = data.role;
      existing.designation = data.designation;
      this.saveUsers();
      this.setCurrentUser(existing);
      return existing;
    }

    const newOfficial: UserProfile = {
      id: `USR-${data.role.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      role: data.role,
      email: cleanEmail,
      designation: data.designation || (data.role === 'admin' ? 'Panchayat Executive Officer' : 'Water Engineer'),
      isRegistered: true
    };

    this.officials = [newOfficial, ...this.officials];
    this.saveUsers();
    this.setCurrentUser(newOfficial);
    return newOfficial;
  }

  public loginOfficial(email: string): UserProfile | null {
    const cleanEmail = email.trim().toLowerCase();
    let official = this.officials.find(o => o.email?.toLowerCase() === cleanEmail);
    if (!official) {
      official = INITIAL_OFFICIALS.find(o => o.email?.toLowerCase() === cleanEmail);
    }
    if (official) {
      this.setCurrentUser(official);
      return official;
    }
    // Fallback: create mock profile for any official email entered
    const isSupervisor = cleanEmail.includes('super');
    const autoOfficial: UserProfile = {
      id: `USR-OFF-${Date.now().toString().slice(-4)}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      role: isSupervisor ? 'supervisor' : 'admin',
      email: cleanEmail,
      designation: isSupervisor ? 'Technical Supervisor' : 'Panchayat Admin',
      isRegistered: true
    };
    this.officials = [autoOfficial, ...this.officials];
    this.saveUsers();
    this.setCurrentUser(autoOfficial);
    return autoOfficial;
  }

  public logout() {
    this.setCurrentUser(null);
  }

  private saveUsers() {
    setStored(STORAGE_KEYS.REGISTERED_VILLAGERS, this.registeredVillagers);
    setStored(STORAGE_KEYS.OFFICIALS, this.officials);
  }

  // --- Ward & Water Quality Helpers ---
  public getWardsForVillage(villageId: string): Ward[] {
    const village = this.villages.find(v => v.id === villageId);
    return village?.wards || [];
  }

  public getWaterQualityForVillage(villageId: string): WaterQualityData | undefined {
    const village = this.villages.find(v => v.id === villageId);
    return village?.waterQuality;
  }

  public getSchedulesForVillager(villageId: string, wardId?: string): WaterSchedule[] {
    return this.schedules.filter(s => {
      if (s.villageId !== villageId) return false;
      if (wardId && s.wardId) {
        return s.wardId === wardId;
      }
      return true;
    });
  }

  public getComplaintsForVillager(phone?: string, citizenName?: string): Complaint[] {
    if (!phone && !citizenName) return [];
    const cleanPhone = phone?.trim().replace(/\D/g, '') || '';
    return this.complaints.filter(c => {
      const matchPhone = cleanPhone && c.mobile.replace(/\D/g, '') === cleanPhone;
      const matchName = citizenName && c.citizenName.toLowerCase().includes(citizenName.toLowerCase());
      return matchPhone || matchName;
    });
  }

  // --- Complaints Management ---
  public submitComplaint(data: {
    citizenName: string;
    mobile: string;
    villageId: string;
    villageName: string;
    wardId?: string;
    wardName?: string;
    streetLocation: string;
    complaintType: any;
    description: string;
    photoUrl?: string;
  }): Complaint {
    const id = `JAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Automatically trigger technical correlation with nearby sensors!
    const correlation = this.correlateCitizenReport(data.villageId, data.streetLocation, data.complaintType);

    const newComplaint: Complaint = {
      id,
      citizenName: data.citizenName,
      mobile: data.mobile,
      villageId: data.villageId,
      villageName: data.villageName,
      wardId: data.wardId,
      wardName: data.wardName,
      streetLocation: data.streetLocation,
      complaintType: data.complaintType,
      description: data.description,
      photoUrl: data.photoUrl,
      createdAt: formattedDate,
      status: 'SUBMITTED',
      correlation
    };

    this.complaints = [newComplaint, ...this.complaints];
    this.saveAll();
    this.notify();
    return newComplaint;
  }

  public getComplaintByIdAndMobile(id: string, mobile: string): Complaint | undefined {
    const cleanId = id.trim().toUpperCase();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    return this.complaints.find(c => 
      c.id.toUpperCase() === cleanId && 
      (c.mobile.replace(/\D/g, '') === cleanMobile || cleanMobile === '')
    );
  }

  public checkAndEscalateComplaints() {
    const refDate = new Date('2026-09-23T12:00:00');
    let hasChanges = false;

    this.complaints = this.complaints.map(c => {
      if (c.status === 'RESOLVED') return c;

      let days = c.daysPending !== undefined ? c.daysPending : 0;
      if (c.createdAt) {
        try {
          const compDate = new Date(c.createdAt.replace(' ', 'T'));
          const diffMs = refDate.getTime() - compDate.getTime();
          days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        } catch {
          // ignore
        }
      }

      if (days >= 5) {
        if (!c.isEscalatedToSupervisor) {
          hasChanges = true;
        }
        
        // Ensure escalation alert is created for Supervisor
        const alertExists = this.alerts.some(a => a.complaintId === c.id);
        if (!alertExists) {
          const escAlert: AlertItem = {
            id: `ALT-ESC-${c.id}`,
            alertType: 'SUPERVISOR_ESCALATION',
            title: `⚠️ SUPERVISOR ESCALATION: Unresolved Complaint #${c.id} (${days} Days Overdue)`,
            villageId: c.villageId,
            villageName: c.villageName,
            complaintId: c.id,
            timestamp: c.escalatedAt || '2026-09-22 10:00',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            description: `Complaint #${c.id} from ${c.citizenName} (${c.villageName}, ${c.streetLocation}) has remained unresolved for ${days} days (exceeds 5-day Admin SLA). Escalated to Technical Supervisor.`,
            recommendedAction: 'Technical Supervisor must immediately dispatch an emergency field lineman or review valve line pressure.'
          };
          this.alerts = [escAlert, ...this.alerts];
          hasChanges = true;
        }

        return {
          ...c,
          daysPending: days,
          isEscalatedToSupervisor: true,
          escalatedAt: c.escalatedAt || '2026-09-22 10:00',
          escalationReason: `Mandatory 5-day SLA breached (${days} days pending without Admin resolution). Escalated to Technical Supervisor.`
        };
      }

      return {
        ...c,
        daysPending: days,
        isEscalatedToSupervisor: false
      };
    });

    if (hasChanges) {
      this.saveAll();
    }
  }

  public updateComplaintStatus(
    id: string, 
    status: 'SUBMITTED' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED', 
    remark?: string, 
    assignedStaff?: string
  ) {
    this.complaints = this.complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          adminRemark: remark !== undefined ? remark : c.adminRemark,
          assignedStaff: assignedStaff !== undefined ? assignedStaff : c.assignedStaff,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.resolvedAt,
          isEscalatedToSupervisor: status === 'RESOLVED' ? false : c.isEscalatedToSupervisor
        };
      }
      return c;
    });

    // If resolved, also resolve any linked supervisor escalation alerts
    if (status === 'RESOLVED') {
      this.alerts = this.alerts.map(a => {
        if (a.complaintId === id) {
          return { ...a, status: 'RESOLVED' };
        }
        return a;
      });
    }

    this.saveAll();
    this.notify();
  }

  // --- Citizen Complaint + Sensor Correlation Algorithm ---
  public correlateCitizenReport(villageId: string, streetLocation: string, complaintType: string): CitizenSensorCorrelation {
    const villageTanks = this.tanks.filter(t => t.villageId === villageId);
    const primaryTank = villageTanks[0] || this.tanks[0];
    const relatedPump = this.pumps.find(p => p.tankId === primaryTank.id) || this.pumps[0];
    const villageSensors = this.sensors.filter(s => s.villageId === villageId);
    
    const pressureSensor = villageSensors.find(s => s.type === 'pressure');
    const flowSensor = villageSensors.find(s => s.type === 'outlet_flow');

    const pressureVal = pressureSensor?.currentValue ?? 2.1;
    const flowVal = flowSensor?.currentValue ?? 140;
    const levelVal = primaryTank.currentLevelPercent;

    let isPhysicalFaultConfirmed = false;
    let finding = '';
    let action = '';
    let confidence = 88;

    if (complaintType === 'NO_WATER_SUPPLY' || complaintType === 'LOW_PRESSURE') {
      if (levelVal > 40 && relatedPump.status === 'RUNNING') {
        if (pressureVal < 1.4 || flowVal < 50) {
          isPhysicalFaultConfirmed = true;
          finding = `Tank storage is healthy (${levelVal}%) and Pump is RUNNING, but line pressure is depressed (${pressureVal} Bar) and flow is restricted (${flowVal} LPM). Verified localized valve blockage or air-lock in branch line.`;
          action = `Lineman should inspect the sub-distribution gate valve and purge air relief cock near ${streetLocation}.`;
          confidence = 94;
        } else {
          isPhysicalFaultConfirmed = false;
          finding = `Sensors indicate main distribution header has full pressure (${pressureVal} Bar). Issue may be isolated to the individual household service connection or tap sediment.`;
          action = `Lineman to perform tap-level flushing and ferrule inspection for citizen premises.`;
          confidence = 82;
        }
      } else if (levelVal <= 35) {
        isPhysicalFaultConfirmed = true;
        finding = `Overhead tank level is critically depleted (${levelVal}%). Insufficient hydrostatic head available to feed higher elevation street.`;
        action = `Initiate pump recharge cycle immediately and notify residents of temporary low head.`;
        confidence = 96;
      }
    } else if (complaintType === 'PIPELINE_LEAKAGE') {
      isPhysicalFaultConfirmed = true;
      finding = `Surge in outlet flow meter (${flowVal} LPM) correlates with sudden hydraulic gradient drop (-0.8 Bar). Confirms physical rupture along distribution main.`;
      action = `Immediately trigger remote valve shutdown and dispatch pipeline excavation repair crew.`;
      confidence = 97;
    } else {
      finding = `Water network operational parameters logged at ${new Date().toLocaleTimeString()}. Standard inspection assigned.`;
      action = `Field staff dispatched for on-site physical review.`;
      confidence = 80;
    }

    return {
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      correlatedZone: streetLocation.split(',')[0] || 'Zone 1',
      matchedTankId: primaryTank.id,
      tankLevelPercent: levelVal,
      zoneFlowLpm: flowVal,
      zonePressureBar: pressureVal,
      pumpStatus: relatedPump.status,
      isPhysicalFaultConfirmed,
      technicalFinding: finding,
      suggestedAction: action,
      confidenceScore: confidence
    };
  }

  // --- Self-Maintaining Sensor Cleaning Workflow ---
  public async executeSensorCleaningCycle(sensorId: string): Promise<SelfCleanLog> {
    const sensor = this.sensors.find(s => s.id === sensorId);
    if (!sensor) throw new Error('Sensor not found');

    const reliabilityBefore = sensor.reliabilityPercent;
    
    // Set sensor to cleaning active
    this.sensors = this.sensors.map(s => s.id === sensorId ? { ...s, isCleaningActive: true } : s);
    this.saveAll();
    this.notify();

    // Simulate multi-step physical process delay (2.5 seconds total)
    await new Promise(r => setTimeout(r, 2200));

    // Calculate recovered reliability
    const reliabilityAfter = Math.min(98, Math.max(90, Math.round(reliabilityBefore + 28 + Math.random() * 8)));

    this.sensors = this.sensors.map(s => {
      if (s.id === sensorId) {
        return {
          ...s,
          reliabilityPercent: reliabilityAfter,
          status: 'normal',
          lastCleanedAt: 'Just now',
          isCleaningActive: false
        };
      }
      return s;
    });

    const mechanism = sensor.type === 'water_quality' ? 'Cleaning Ultrasonic Ring' : 'Mini Wiper Blade';

    const log: SelfCleanLog = {
      id: `CLN-${Date.now().toString().slice(-4)}`,
      sensorId: sensor.id,
      sensorName: sensor.name,
      villageName: sensor.villageName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'RESTORED',
      reliabilityBeforePercent: reliabilityBefore,
      reliabilityAfterPercent: reliabilityAfter,
      durationSeconds: 32,
      mechanismUsed: mechanism,
      status: 'SUCCESS',
      notes: `Dual-cycle ${mechanism} engaged via ESP32 PWM driver. Transducer acoustic reflection amplitude restored from ${reliabilityBefore}% to ${reliabilityAfter}%.`
    };

    this.cleanLogs = [log, ...this.cleanLogs];

    // Auto-resolve any sensor contamination alerts for this sensor
    this.alerts = this.alerts.map(a => {
      if (a.sensorId === sensorId && a.alertType === 'SENSOR_CONTAMINATION') {
        return { ...a, status: 'RESOLVED' };
      }
      return a;
    });

    this.saveAll();
    this.notify();
    return log;
  }

  // --- Pump Remote Control ---
  public updatePumpStatus(pumpId: string, status: Pump['status']) {
    this.pumps = this.pumps.map(p => {
      if (p.id === pumpId) {
        return {
          ...p,
          status,
          currentAmps: status === 'RUNNING' ? p.normalAmps : 0,
          lastToggledAt: 'Just now'
        };
      }
      return p;
    });
    this.saveAll();
    this.notify();
  }

  public togglePump(pumpId: string) {
    this.pumps = this.pumps.map(p => {
      if (p.id === pumpId) {
        const nextStatus = p.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
        const nextAmps = nextStatus === 'RUNNING' ? p.normalAmps : 0;
        return {
          ...p,
          status: nextStatus,
          currentAmps: nextAmps,
          lastToggledAt: 'Just now'
        };
      }
      return p;
    });
    this.saveAll();
    this.notify();
  }

  public addVillage(newVillage: Omit<Village, 'id'>): Village {
    const id = `VIL-0${this.villages.length + 1}`;
    const village: Village = { ...newVillage, id };
    this.villages.push(village);
    this.saveAll();
    this.notify();
    return village;
  }

  // --- Water Schedules ---
  public addSchedule(schedule: Omit<WaterSchedule, 'id'>) {
    const newSch: WaterSchedule = {
      ...schedule,
      id: `SCH-${String(this.schedules.length + 1).padStart(2, '0')}`
    };
    this.schedules = [...this.schedules, newSch];
    this.saveAll();
    this.notify();
  }

  public updateSchedule(id: string, updates: Partial<WaterSchedule>) {
    this.schedules = this.schedules.map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveAll();
    this.notify();
  }

  public deleteSchedule(id: string) {
    this.schedules = this.schedules.filter(s => s.id !== id);
    this.saveAll();
    this.notify();
  }

  // --- Maintenance Records ---
  public addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>) {
    const newRec: MaintenanceRecord = {
      ...record,
      id: `MNT-2026-${String(Math.floor(100 + Math.random() * 900))}`
    };
    this.maintenance = [newRec, ...this.maintenance];
    this.saveAll();
    this.notify();
  }

  public updateMaintenanceStatus(id: string, status: MaintenanceRecord['status'], remarks?: string) {
    this.maintenance = this.maintenance.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status,
          remarks: remarks !== undefined ? remarks : m.remarks
        };
      }
      return m;
    });
    this.saveAll();
    this.notify();
  }

  // --- Alerts ---
  public acknowledgeAlert(id: string) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a);
    this.saveAll();
    this.notify();
  }

  public resolveAlert(id: string) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a);
    this.saveAll();
    this.notify();
  }

  // --- CSV Export Helper ---
  public exportComplaintsCSV() {
    const headers = ['Complaint ID', 'Citizen Name', 'Mobile', 'Village', 'Street Location', 'Type', 'Status', 'Created At', 'Staff Assigned', 'Resolution Notes'];
    const rows = this.complaints.map(c => [
      c.id,
      `"${c.citizenName}"`,
      c.mobile,
      `"${c.villageName}"`,
      `"${c.streetLocation}"`,
      c.complaintType,
      c.status,
      c.createdAt,
      `"${c.assignedStaff || 'Unassigned'}"`,
      `"${c.adminRemark || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jalmitra_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportReadingsCSV() {
    const headers = ['Sensor ID', 'Sensor Name', 'Type', 'Village', 'Current Value', 'Unit', 'Status', 'Reliability %', 'Last Updated'];
    const rows = this.sensors.map(s => [
      s.id,
      `"${s.name}"`,
      s.type,
      `"${s.villageName}"`,
      s.currentValue,
      s.unit,
      s.status,
      `${s.reliabilityPercent}%`,
      `"${s.lastUpdated}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jalmitra_sensors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const dataService = new DataService();
