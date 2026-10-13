import { FaultDiagnosis, AIAnomalyResult, SensorItem, Tank, Pump, ZoneBaseline } from '../types';

export interface LiveAnalysisInput {
  waterLevelPercent: number;
  inletFlowLpm: number;
  outletFlowLpm: number;
  pressureBar: number;
  pumpRunning: boolean;
  baseline: {
    minLevel: number;
    maxLevel: number;
    normalInlet: [number, number];
    normalOutlet: [number, number];
    normalPressure: [number, number];
  };
}

export class AIEngine {
  /**
   * Evaluates multi-sensor telemetry against learned baseline
   * Prototype Anomaly Engine (Multi-Parametric Statistical Deviation Model)
   */
  public static analyzeZoneTelemetry(
    villageName: string,
    zoneName: string,
    input: LiveAnalysisInput
  ): AIAnomalyResult {
    const { waterLevelPercent, inletFlowLpm, outletFlowLpm, pressureBar, pumpRunning, baseline } = input;

    // Deviations from learned envelope
    const levelDeviation = waterLevelPercent < baseline.minLevel 
      ? waterLevelPercent - baseline.minLevel 
      : (waterLevelPercent > baseline.maxLevel ? waterLevelPercent - baseline.maxLevel : 0);

    const outletAvg = (baseline.normalOutlet[0] + baseline.normalOutlet[1]) / 2;
    const flowDelta = outletFlowLpm - outletAvg;

    const pressureAvg = (baseline.normalPressure[0] + baseline.normalPressure[1]) / 2;
    const pressureDelta = pressureBar - pressureAvg;

    let condition: AIAnomalyResult['condition'] = 'Normal';
    let anomalyScore = 12;
    let confidence = 85;
    let probableCause = 'Hydraulic parameters conform to learned Gram Panchayat baseline.';
    let recommendedAction = 'Maintain routine automated distribution schedule.';
    let severity: AIAnomalyResult['severity'] = 'INFO';

    // Condition 1: Pipe burst / Major leakage
    // Characterized by: Outlet flow spike + significant pressure drop
    if (outletFlowLpm > baseline.normalOutlet[1] * 1.25 && pressureBar < baseline.normalPressure[0] * 0.7) {
      condition = 'Possible Leakage';
      anomalyScore = Math.min(96, Math.round(75 + Math.abs(flowDelta) * 0.2 + Math.abs(pressureDelta) * 15));
      confidence = 94;
      probableCause = `Simultaneous outlet flow surge (+${Math.round(flowDelta)} LPM) and severe hydraulic pressure collapse (${pressureBar} Bar vs norm ${pressureAvg} Bar) indicates active pipe fracture.`;
      recommendedAction = 'Isolate zonal sluice valve immediately. Lineman to trace pipeline corridor with acoustic leak detector.';
      severity = 'CRITICAL';
    }
    // Condition 2: Pipeline blockage or stuck closed valve
    // Characterized by: High or normal pressure, but depressed outlet flow while pump is running
    else if (pumpRunning && outletFlowLpm < baseline.normalOutlet[0] * 0.5 && pressureBar >= baseline.normalPressure[0]) {
      condition = 'Pipeline Blockage';
      anomalyScore = Math.min(88, Math.round(65 + Math.abs(flowDelta) * 0.3));
      confidence = 88;
      probableCause = `Line pressure is sufficient (${pressureBar} Bar) but outlet discharge is severely throttled (${outletFlowLpm} LPM). Possible air lock, calcified encrustation, or stuck air valve.`;
      recommendedAction = 'Bleed the terminal air-release cock and cycle distribution gate valve.';
      severity = 'WARNING';
    }
    // Condition 3: Pump Trip / Dry run anomaly
    else if (!pumpRunning && waterLevelPercent < baseline.minLevel) {
      condition = 'Low Water Level';
      anomalyScore = 76;
      confidence = 92;
      probableCause = `Overhead tank has reached low reserve threshold (${waterLevelPercent}%) while primary supply pump is inactive.`;
      recommendedAction = 'Check power availability at pump house and initiate reservoir refill.';
      severity = 'WARNING';
    }
    // Condition 4: Pressure abnormality
    else if (pressureBar > baseline.normalPressure[1] * 1.3) {
      condition = 'Pressure Abnormality';
      anomalyScore = 70;
      confidence = 86;
      probableCause = `Water hammer or over-pressurization (${pressureBar} Bar) detected. Risk of PVC pipe coupling joint blowout.`;
      recommendedAction = 'Inspect pressure relief valve and check if downstream valves were closed prematurely.';
      severity = 'WARNING';
    }
    // Condition 5: Abnormal high consumption
    else if (outletFlowLpm > baseline.normalOutlet[1] * 1.15 && pressureBar >= baseline.normalPressure[0] * 0.85) {
      condition = 'Abnormal Water Consumption';
      anomalyScore = 64;
      confidence = 82;
      probableCause = `Discharge is 25% higher than typical hourly baseline while pressure holds steady, suggesting heavy simultaneous tap usage or unmetered agricultural drawing.`;
      recommendedAction = 'Review village festival/irrigation schedule and cross-verify with ward representative.';
      severity = 'INFO';
    }

    return {
      id: `ANO-${Date.now().toString().slice(-4)}`,
      villageId: 'VIL-01',
      villageName,
      zoneName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      condition,
      anomalyScore,
      confidence,
      probableCause,
      recommendedAction,
      severity,
      parametersChecked: {
        waterLevelDeviation: Math.round(levelDeviation),
        flowDeltaLpm: Math.round(flowDelta),
        pressureDeviationBar: Number(pressureDelta.toFixed(2)),
        pumpStateConsistent: pumpRunning
      }
    };
  }

  /**
   * SENSOR FAULT VS INFRASTRUCTURE FAULT DISAMBIGUATION LOGIC
   * Evaluates multi-sensor cross-consistency.
   * If only one sensor is abnormal while hydrodynamic physics (flow & pressure) stay constant,
   * it's a sensor fault. If multiple physical parameters co-vary, it's an infrastructure fault.
   */
  public static verifyFaultOrigin(params: {
    ultrasonicReadingAbnormal: boolean;
    flowConsistentWithLevel: boolean;
    pressureConsistentWithFlow: boolean;
    pumpTelemetryValid: boolean;
    villageName: string;
    descriptionNotes?: string;
  }): FaultDiagnosis {
    const { 
      ultrasonicReadingAbnormal, 
      flowConsistentWithLevel, 
      pressureConsistentWithFlow, 
      pumpTelemetryValid,
      villageName 
    } = params;

    // Rule A: Level sensor is jumping or out-of-range, but flow, pressure, and pump operate normally
    if (ultrasonicReadingAbnormal && flowConsistentWithLevel && pressureConsistentWithFlow && pumpTelemetryValid) {
      return {
        id: `DIAG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        villageName,
        verdict: 'Probable Sensor Issue',
        confidence: 93,
        explanation: 'The ultrasonic level reading presents erratic oscillations or sudden spikes/drops, yet both pipe flow rate and network pressure remain stable and pump current is nominal. Acoustic interference, transducer condensation, or spiderwebs are the probable cause rather than actual water disappearance.',
        sensorIndicators: {
          ultrasonicReadingAbnormal,
          flowConsistentWithLevel,
          pressureConsistentWithFlow,
          pumpTelemetryValid
        },
        recommendedNextStep: 'Activate the automated sensor self-cleaning wiper/actuator. Re-measure signal reliability before sending an on-site technician.'
      };
    }

    // Rule B: Multiple physical sensors confirm physical event (e.g. pressure collapse + flow surge + level dropping)
    if (!pressureConsistentWithFlow || !flowConsistentWithLevel || !pumpTelemetryValid) {
      return {
        id: `DIAG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        villageName,
        verdict: 'Probable Infrastructure Issue',
        confidence: 95,
        explanation: 'Physical correlation confirmed across multiple independent sensors: Hydrodynamic relationship between inlet flow, distribution pressure, and tank discharge is disrupted. Cross-verification rules out single-point sensor glitch.',
        sensorIndicators: {
          ultrasonicReadingAbnormal,
          flowConsistentWithLevel,
          pressureConsistentWithFlow,
          pumpTelemetryValid
        },
        recommendedNextStep: 'Physical asset issue confirmed. Dispatch lineman crew for pipeline/pump/valve inspection immediately.'
      };
    }

    return {
      id: `DIAG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      villageName,
      verdict: 'Normal Operation',
      confidence: 98,
      explanation: 'All sensor nodes correlate consistently with expected hydrodynamic laws. No single-point or distributed fault observed.',
      sensorIndicators: {
        ultrasonicReadingAbnormal: false,
        flowConsistentWithLevel: true,
        pressureConsistentWithFlow: true,
        pumpTelemetryValid: true
      },
      recommendedNextStep: 'No action needed. System in continuous baseline monitoring mode.'
    };
  }
}
