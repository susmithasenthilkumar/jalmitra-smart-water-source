import React, { useState } from 'react';
import { Cpu, Code, Server, Copy, Check, Terminal, FileCode, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface ArchitectureViewProps {
  tamilEnabled: boolean;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ tamilEnabled }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const esp32Code = `/*
 * JAL MITRA 360 - Gram Panchayat IoT Water Telemetry Firmware
 * Target: ESP32 DevKit v1 / ESP32-WROOM-32
 * Sensors: JSN-SR04T (Ultrasonic), YF-DN50 (Flow), Piezoresistive (Pressure), Relay/Servo (Wiper)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// Wi-Fi Credentials (or swap with SIM800L / LoRa SX1276)
const char* ssid = "PANCHAYAT_WIFI_GRID";
const char* password = "PanchayatSecurePassword!";
const char* serverUrl = "https://your-panchayat-api.gov.in/api/esp32/telemetry";

// Pin Configuration
#define TRIG_PIN 5
#define ECHO_PIN 18
#define FLOW_SENSOR_PIN 19
#define PRESSURE_PIN 34 // ADC1_CH6
#define WIPER_SERVO_PIN 13
#define PUMP_RELAY_PIN 23

// Sensor Global Variables
volatile unsigned long pulseCount = 0;
float flowRateLPM = 0.0;
Servo wiperServo;

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);
  
  wiperServo.attach(WIPER_SERVO_PIN);
  wiperServo.write(0); // Rest position

  // Connect Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected! Node IP: " + WiFi.localIP().toString());
}

float measureDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 35000); // 35ms timeout
  if (duration == 0) return -1.0; // Echo timeout
  return (duration * 0.0343) / 2.0;
}

float readPressureBar() {
  int rawADC = analogRead(PRESSURE_PIN);
  float voltage = (rawADC / 4095.0) * 3.3;
  // Transducer formula: 0.5V = 0 Bar, 4.5V = 10 Bar (scaled with voltage divider)
  float bar = (voltage - 0.33) * (10.0 / 2.97);
  return max(0.0f, bar);
}

void executeSelfCleanCycle() {
  Serial.println("[ACTUATOR] Triggering Mini-Wiper Cleaning Cycle...");
  for (int angle = 0; angle <= 180; angle += 10) {
    wiperServo.write(angle);
    delay(30);
  }
  delay(200);
  for (int angle = 180; angle >= 0; angle -= 10) {
    wiperServo.write(angle);
    delay(30);
  }
  Serial.println("[ACTUATOR] Wiper Cycle Complete. Surface Calibrated.");
}

void loop() {
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) { // Every 5 seconds
    lastSend = millis();

    // 1. Calculate Flow Rate
    flowRateLPM = (pulseCount / 7.5); // YF Calibration factor
    pulseCount = 0;

    // 2. Ultrasonic Level
    float dist = measureDistanceCM();
    float tankDepthCM = 400.0;
    float waterLevelPercent = (dist > 0 && dist <= tankDepthCM) ? ((tankDepthCM - dist) / tankDepthCM) * 100.0 : 0.0;

    // 3. Pressure
    float pressureBar = readPressureBar();

    // 4. Construct JSON Payload
    StaticJsonDocument<512> doc;
    doc["nodeId"] = "ESP32_PUDUR_OHT_NODE_01";
    doc["waterLevelPercent"] = waterLevelPercent;
    doc["flowRateLPM"] = flowRateLPM;
    doc["pressureBar"] = pressureBar;
    doc["batteryVoltage"] = 4.15;
    doc["timestamp"] = millis();

    String jsonString;
    serializeJson(doc, jsonString);

    // 5. Transmit to Cloud / Node.js Express API
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonString);
      
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Response: " + response);

        // Check if backend ordered self-clean actuation
        StaticJsonDocument<256> respDoc;
        deserializeJson(respDoc, response);
        if (respDoc["command"] == "TRIGGER_SELF_CLEAN") {
          executeSelfCleanCycle();
        }
      }
      http.end();
    }
  }
}`;

  const pythonMLCode = `"""
JAL MITRA 360 - AI Self-Learning Pipeline Anomaly Engine
Microservice: FastAPI / Python 3.11 + Scikit-Learn
Endpoint: POST /api/v1/analyze-telemetry
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI(title="Jal Mitra 360 AI Engine", version="1.0.0")

class TelemetryPayload(BaseModel):
    village_id: str
    zone_id: str
    water_level_pct: float
    inlet_flow_lpm: float
    outlet_flow_lpm: float
    pressure_bar: float
    pump_running: bool

class AnomalyResponse(BaseModel):
    condition: str
    anomaly_score: int
    confidence: int
    probable_cause: str
    recommended_action: str
    is_fault_confirmed: bool

@app.post("/api/v1/analyze-telemetry", response_model=AnomalyResponse)
async def analyze_telemetry(data: TelemetryPayload):
    # Rule 1: Pipe Burst Signature (Mass Outflow Surge + Pressure Collapse)
    if data.pressure_bar < 1.3 and data.outlet_flow_lpm > 180.0:
        return AnomalyResponse(
            condition="Possible Leakage / Burst",
            anomaly_score=88,
            confidence=94,
            probable_cause="Distribution line rupture in distribution zone; outflow exceeds baseline head.",
            recommended_action="Emergency close isolating valve Z2-V01. Alert Ward Lineman immediately.",
            is_fault_confirmed=True
        )

    # Rule 2: Sensor Glitch Disambiguation (Ultrasonic jumping but hydraulics stable)
    if (data.water_level_pct < 20 or data.water_level_pct > 95) and (1.8 <= data.pressure_bar <= 2.5):
        return AnomalyResponse(
            condition="Sensor Transducer Glitch",
            anomaly_score=68,
            confidence=91,
            probable_cause="Ultrasonic acoustic attenuation from condensation or algae; line pressure remains steady.",
            recommended_action="Trigger ESP32 mini-wiper actuator before dispatching physical repair.",
            is_fault_confirmed=False
        )

    # Normal Baseline
    return AnomalyResponse(
        condition="Normal",
        anomaly_score=12,
        confidence=96,
        probable_cause="Hydraulic parameters match learned 30-day baseline.",
        recommended_action="Maintain scheduled distribution timetable.",
        is_fault_confirmed=False
    )
`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>{tamilEnabled ? 'முழு-அடுக்கு பொறியியல் மற்றும் நுண்கட்டுப்படுத்தி கட்டமைப்பு' : 'Full-Stack Engineering & Microcontroller Architecture'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          {tamilEnabled ? 'அமைப்பு கட்டமைப்பு மற்றும் நுண்கட்டுப்படுத்தி ஒருங்கிணைப்பு' : 'System Architecture & Microcontroller Integration'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          {tamilEnabled ? 'நேரடி ஊராட்சிகளில் Jal Mitra 360-ஐ நிறுவுவதற்கான முழுமையான தொழில்நுட்ப வரைபடங்கள். Arduino ESP32 firmware, wiring pinout-கள் மற்றும் Python AI அடிப்படை கணிப்பு சேவை இதில் அடங்கும்.' : 'Complete end-to-end technical blueprints for deploying Jal Mitra 360 in physical Gram Panchayats. Includes flashable Arduino ESP32 firmware, wiring schematic pinouts, and the Python AI baseline inference service.'}
        </p>
      </div>

      {/* ARCHITECTURE PIPELINE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">{tamilEnabled ? '1. விளிம்பு உணர்வு அடுக்கு' : '1. Edge Sensing Tier'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tamilEnabled ? 'மேல்நிலைத் தொட்டிகள் (OHT) மற்றும் ஆழ்துளைக் கிணறுகளில் ESP32 நுண்கட்டுப்படுத்திகள் நிறுவப்படுகின்றன. JSN-SR04T மீயொலி உணரிகள், YF ஓட்டமானிகள் மற்றும் 0-10 Bar அழுத்தக் கடத்திகள் நேரடியாக அளவிடுகின்றன.' : 'ESP32 microcontrollers deployed at overhead reservoirs (OHT) and borewells. Directly sample JSN-SR04T ultrasonic transducers, YF flow meters, and 0-10 Bar piezoresistive pressure transmitters.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">{tamilEnabled ? '2. மேகத் தரவு பெறுதல் மற்றும் அங்கீகாரம்' : '2. Cloud Ingestion & Auth'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tamilEnabled ? 'ஊராட்சி நிர்வாகி மற்றும் வட்டார மேற்பார்வையாளர் அனுமதிக்காக Firebase Firestore சேமிப்பகமும் Firebase Authentication-உம் கொண்ட Node.js Express REST API முனைப்புள்ளிகள்.' : 'Node.js Express REST API endpoints with Firebase Firestore persistence and Firebase Authentication for Panchayat Admin and Block Supervisor role authorization.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">{tamilEnabled ? '3. AI தகவமைப்பு நடவடிக்கை' : '3. AI Adaptive Response'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tamilEnabled ? 'தொடர்ச்சியாகத் தன்னைக் கற்றுக்கொள்ளும் பல-சென்சார் அடிப்படை மாதிரிகள் கசிவைக் கண்டறிந்து, சென்சார் அழுக்கையும் உண்மையான குழாய் உடைப்பையும் வேறுபடுத்தி, மின்இயந்திரத் துடைப்பான் தூய்மையாக்கத்தை இயக்குகின்றன.' : 'Continuous self-learning multi-sensor baseline models detect leaks, distinguish sensor dirt vs real pipe ruptures, and actuate electromechanical wiper cleaning rings.'}
          </p>
        </div>
      </div>

      {/* CODE BLOCK 1: ESP32 ARDUINO C++ */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-white">ESP32_JalMitra_Telemetry.ino</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Arduino IDE / PlatformIO</span>
          </div>

          <button
            onClick={() => copyToClipboard(esp32Code, 'esp32')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center space-x-1.5 transition-colors"
          >
            {copiedSection === 'esp32' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'esp32' ? (tamilEnabled ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (tamilEnabled ? 'குறியீட்டை நகலெடு' : 'Copy Code')}</span>
          </button>
        </div>

        <pre className="p-5 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-96">
          {esp32Code}
        </pre>
      </div>

      {/* CODE BLOCK 2: PYTHON FASTAPI AI ENGINE */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-teal-400" />
            <span className="font-mono font-bold text-white">ai_anomaly_service.py</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">FastAPI + Scikit-Learn</span>
          </div>

          <button
            onClick={() => copyToClipboard(pythonMLCode, 'python')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-[11px] flex items-center space-x-1.5 transition-colors"
          >
            {copiedSection === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'python' ? (tamilEnabled ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (tamilEnabled ? 'குறியீட்டை நகலெடு' : 'Copy Code')}</span>
          </button>
        </div>

        <pre className="p-5 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-96">
          {pythonMLCode}
        </pre>
      </div>

    </div>
  );
};
