import express from 'express';
import { promises as fs } from 'fs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sparkSummaryFolders = {
  villageAverageWaterLevel: 'village_average_water_level',
  villageAverageFlow: 'village_average_flow',
  tankWaterUsage: 'tank_water_usage',
  leakageRiskRecords: 'leakage_risk_records',
  abnormalSensorReadings: 'abnormal_sensor_readings',
  pumpStatusSummary: 'pump_status_summary',
  villageWaterWastage: 'village_water_wastage',
  villageComplaintSummary: 'village_complaint_summary',
  overallWaterSupplySummary: 'overall_water_supply_summary'
} as const;

const sparkOutputDirectory = path.resolve(
  process.env.SPARK_OUTPUT_DIR || path.join(__dirname, 'output', 'api')
);

async function readSparkSummary(folderName: string) {
  const summaryDirectory = path.join(sparkOutputDirectory, folderName);
  const entries = await fs.readdir(summaryDirectory, { withFileTypes: true });
  const jsonFiles = entries
    .filter(entry => entry.isFile() && /^part-.*\.json$/.test(entry.name))
    .map(entry => entry.name)
    .sort();

  const rows: Record<string, unknown>[] = [];
  let latestModifiedAt = 0;

  for (const fileName of jsonFiles) {
    const filePath = path.join(summaryDirectory, fileName);
    const [contents, details] = await Promise.all([
      fs.readFile(filePath, 'utf8'),
      fs.stat(filePath)
    ]);
    latestModifiedAt = Math.max(latestModifiedAt, details.mtimeMs);
    for (const line of contents.split(/\r?\n/)) {
      if (line.trim()) rows.push(JSON.parse(line) as Record<string, unknown>);
    }
  }

  return { rows, latestModifiedAt };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints for IoT Telemetry & Panchayat Administration
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      system: 'Jal Mitra 360', 
      version: '1.0.0',
      timestamp: new Date().toISOString() 
    });
  });

  // Serve results written by WaterAnalysis.scala; Spark itself runs as a batch job.
  app.get('/api/spark/analytics', async (_req, res) => {
    try {
      const results = await Promise.all(
        Object.entries(sparkSummaryFolders).map(async ([key, folderName]) => {
          try {
            const result = await readSparkSummary(folderName);
            return [key, result] as const;
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              return [key, { rows: [], latestModifiedAt: 0 }] as const;
            }
            throw error;
          }
        })
      );
      const summaries = Object.fromEntries(results.map(([key, result]) => [key, result.rows]));
      const latestModifiedAt = Math.max(...results.map(([, result]) => result.latestModifiedAt));
      const available = results.some(([, result]) => result.rows.length > 0);

      res.json({
        source: 'Apache Spark / Scala',
        available,
        generatedAt: latestModifiedAt ? new Date(latestModifiedAt).toISOString() : null,
        outputDirectory: sparkOutputDirectory,
        summaries,
        message: available ? null : 'Spark results are not available yet. Run WaterAnalysis.scala to generate them.'
      });
    } catch (error) {
      console.error('Spark analytics API error:', error);
      res.status(500).json({
        source: 'Apache Spark / Scala',
        available: false,
        message: 'Could not read Spark analytics output. Check the Spark output directory and JSON files.'
      });
    }
  });

  // Direct ZIP download endpoints
  app.get(['/download', '/download-zip', '/api/download-zip', '/jalmitra-smart-water-source.zip'], (req, res) => {
    const zipPath = path.join(__dirname, 'public', 'jalmitra-smart-water-source.zip');
    res.download(zipPath, 'jalmitra-smart-water-source.zip', (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error generating or retrieving project zip file.');
        }
      }
    });
  });

  // ESP32 Telemetry Ingestion Endpoint
  app.post('/api/esp32/telemetry', (req, res) => {
    const telemetry = req.body;
    console.log('[ESP32 INGESTION]', telemetry);

    // Rule: if water level is erratic or very low, order actuator wipe
    const shouldOrderClean = (telemetry.waterLevelPercent < 20 || telemetry.reliability < 70);

    res.json({
      status: 'acknowledged',
      receivedAt: new Date().toISOString(),
      nodeId: telemetry.nodeId || 'ESP32_UNKNOWN',
      command: shouldOrderClean ? 'TRIGGER_SELF_CLEAN' : 'NORMAL_STREAM',
      sampleRateSeconds: 5
    });
  });

  // AI Inference Proxy
  app.post('/api/ai/analyze', (req, res) => {
    const { waterLevel, inletFlow, outletFlow, pressure } = req.body;
    
    // Heuristic baseline check
    let condition = 'Normal';
    let anomalyScore = 15;
    let confidence = 95;
    let probableCause = 'Operating within learned 30-day baseline.';
    let recommendedAction = 'Maintain scheduled supply sequence.';

    if (pressure < 1.2 && outletFlow > 180) {
      condition = 'Possible Pipeline Burst';
      anomalyScore = 88;
      confidence = 94;
      probableCause = 'Distribution line rupture; pressure collapse with sudden high outlet flow.';
      recommendedAction = 'Emergency close isolating valve and alert ward lineman.';
    } else if (waterLevel < 20 && pressure > 1.8) {
      condition = 'Ultrasonic Sensor Fouling';
      anomalyScore = 68;
      confidence = 90;
      probableCause = 'Transducer attenuation due to algae/condensation while line pressure is nominal.';
      recommendedAction = 'Trigger ESP32 mini-wiper self-cleaning mechanism.';
    }

    res.json({
      condition,
      anomalyScore,
      confidence,
      probableCause,
      recommendedAction,
      analyzedAt: new Date().toISOString()
    });
  });

  const PORT = 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JAL MITRA 360] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
