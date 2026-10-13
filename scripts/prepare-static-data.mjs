import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectDirectory, 'output', 'api');
const publicDirectory = path.join(projectDirectory, 'public');
const summaryFolders = {
  villageAverageWaterLevel: 'village_average_water_level',
  villageAverageFlow: 'village_average_flow',
  tankWaterUsage: 'tank_water_usage',
  leakageRiskRecords: 'leakage_risk_records',
  abnormalSensorReadings: 'abnormal_sensor_readings',
  pumpStatusSummary: 'pump_status_summary',
  villageWaterWastage: 'village_water_wastage',
  villageComplaintSummary: 'village_complaint_summary',
  overallWaterSupplySummary: 'overall_water_supply_summary'
};

let latestModifiedAt = 0;
const summaries = Object.fromEntries(Object.entries(summaryFolders).map(([key, folder]) => {
  const summaryDirectory = path.join(outputDirectory, folder);
  if (!existsSync(summaryDirectory)) return [key, []];

  const rows = [];
  const files = readdirSync(summaryDirectory)
    .filter(file => /^part-.*\.json$/.test(file))
    .sort();

  for (const file of files) {
    const filePath = path.join(summaryDirectory, file);
    latestModifiedAt = Math.max(latestModifiedAt, statSync(filePath).mtimeMs);
    const contents = readFileSync(filePath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      if (line.trim()) rows.push(JSON.parse(line));
    }
  }

  return [key, rows];
}));

const available = Object.values(summaries).some(rows => rows.length > 0);
const response = {
  source: 'Apache Spark / Scala',
  available,
  generatedAt: latestModifiedAt ? new Date(latestModifiedAt).toISOString() : null,
  summaries,
  message: available ? null : 'Spark results are not available yet. Run WaterAnalysis.scala to generate them.'
};

writeFileSync(path.join(publicDirectory, 'spark-analytics.json'), `${JSON.stringify(response, null, 2)}\n`);
console.log(`Prepared static Spark analytics (${available ? 'results included' : 'no results found'}).`);