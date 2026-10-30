import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import {
  parseCsv,
  getDfSummary,
  runAuditComputation,
  generateModelCardHtml
} from './src/server/auditEngine.ts';
import { GERMAN_CREDIT_AUDIT, COMPAS_AUDIT } from './src/data/preloadedAudits.ts';
import type { FullAuditResult } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Cache and stores
const DATASETS_CACHE = new Map<string, { columns: string[]; rows: Record<string, any>[]; dtypes: Record<string, string> }>();
const AUDITS_CACHE = new Map<string, FullAuditResult>();
const JOBS_STORE = new Map<string, {
  job_id: string;
  status: 'running' | 'complete' | 'failed';
  stage: string;
  progress: number;
  result: FullAuditResult | null;
  error: string | null;
}>();

const OUTPUTS_DIR = path.resolve(__dirname, 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

// Pre-seed demo datasets into cache
function seedDemos() {
  const germanCsvPath = path.resolve(__dirname, 'demo_data', 'german_credit.csv');
  if (fs.existsSync(germanCsvPath)) {
    try {
      const content = fs.readFileSync(germanCsvPath, 'utf-8');
      DATASETS_CACHE.set('demo_german_credit', parseCsv(content));
    } catch (e) {
      console.warn('[server] Warning loading german_credit.csv:', e);
    }
  }

  const compasCsvPath = path.resolve(__dirname, 'demo_data', 'compas.csv');
  if (fs.existsSync(compasCsvPath)) {
    try {
      const content = fs.readFileSync(compasCsvPath, 'utf-8');
      DATASETS_CACHE.set('demo_compas', parseCsv(content));
    } catch (e) {
      console.warn('[server] Warning loading compas.csv:', e);
    }
  }

  // Pre-seed preloaded audits into cache
  AUDITS_CACHE.set('german_credit', GERMAN_CREDIT_AUDIT);
  AUDITS_CACHE.set('compas', COMPAS_AUDIT);
}

seedDemos();

// --- API ROUTES ---

// 1. Health & Config
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '2.0.0',
    service: 'AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite',
    allow_model_upload: false,
  });
});

// 2. Demo Dataset Summary
app.get('/api/demo/:name', (req, res) => {
  const { name } = req.params;
  const datasetId = `demo_${name}`;
  let dataset = DATASETS_CACHE.get(datasetId);

  if (!dataset) {
    seedDemos();
    dataset = DATASETS_CACHE.get(datasetId);
  }

  if (!dataset) {
    return res.status(404).json({ error: `Demo '${name}' not found. Choose 'german_credit' or 'compas'.` });
  }

  const summary = getDfSummary(dataset);
  const isGerman = name === 'german_credit';

  res.json({
    dataset_id: datasetId,
    demo_name: name,
    default_target: isGerman ? 'Creditability' : 'Low_Risk_Outcome',
    default_positive: 1,
    default_sensitive: isGerman ? ['Sex', 'Age', 'Foreign_Worker'] : ['race', 'sex', 'age'],
    default_use_case: isGerman ? 'credit_scoring' : 'law_enforcement_recidivism',
    columns: summary.columns,
    dtypes: summary.dtypes,
    row_count: summary.row_count,
    preview: summary.preview,
  });
});

// 3. Precomputed Demo Audits
app.get('/api/demo-audit/:name', (req, res) => {
  const { name } = req.params;
  const filePath = path.resolve(OUTPUTS_DIR, `${name}_audit.json`);

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return res.json(JSON.parse(raw));
    } catch (e) {
      console.warn(`[server] Error reading ${filePath}:`, e);
    }
  }

  if (name === 'german_credit') {
    return res.json(GERMAN_CREDIT_AUDIT);
  } else if (name === 'compas') {
    return res.json(COMPAS_AUDIT);
  }

  res.status(404).json({ error: `Precomputed audit for '${name}' not found.` });
});

// 4. File Upload (CSV)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No CSV data file provided in 'file' field." });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    const parsed = parseCsv(csvContent);

    if (parsed.columns.length === 0 || parsed.rows.length === 0) {
      return res.status(400).json({ error: 'Failed to parse CSV. File appears to be empty or invalid.' });
    }

    const datasetId = Math.random().toString(36).substring(2, 12);
    DATASETS_CACHE.set(datasetId, parsed);

    const summary = getDfSummary(parsed);
    res.json({
      dataset_id: datasetId,
      has_custom_model: false,
      columns: summary.columns,
      dtypes: summary.dtypes,
      row_count: summary.row_count,
      preview: summary.preview,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to process CSV file.' });
  }
});

// 5. Run Audit
app.post('/api/audit', (req, res) => {
  const {
    dataset_id,
    target,
    sensitive = [],
    positive_label = 1,
    use_case = 'credit_scoring',
    pred_col,
    pred_threshold,
    questionnaire = {},
    privileged_groups = {},
    sync = false,
  } = req.body || {};

  const datasetId = dataset_id || 'demo_german_credit';
  const csvData = DATASETS_CACHE.get(datasetId);

  const jobId = Math.random().toString(36).substring(2, 10);

  // Compute the audit result using our TypeScript engine
  const result = runAuditComputation({
    datasetId,
    targetCol: target,
    sensitiveCols: sensitive,
    useCase: use_case,
    positiveLabel: positive_label,
    predCol: pred_col,
    predThreshold: pred_threshold,
    questionnaire,
    privilegedGroups: privileged_groups,
    csvData,
  });

  AUDITS_CACHE.set(jobId, result);

  // Persist JSON and HTML
  try {
    fs.writeFileSync(path.resolve(OUTPUTS_DIR, `${jobId}.json`), JSON.stringify(result, null, 2));
    fs.writeFileSync(path.resolve(OUTPUTS_DIR, `${jobId}.html`), generateModelCardHtml(result));
  } catch (e) {
    console.warn('[server] Error persisting audit files:', e);
  }

  if (sync) {
    return res.json(result);
  }

  // Register background job with smooth progress simulation
  JOBS_STORE.set(jobId, {
    job_id: jobId,
    status: 'running',
    stage: 'fairness',
    progress: 25,
    result: null,
    error: null,
  });

  setTimeout(() => {
    const job = JOBS_STORE.get(jobId);
    if (job) {
      job.stage = 'explain';
      job.progress = 50;
    }
  }, 400);

  setTimeout(() => {
    const job = JOBS_STORE.get(jobId);
    if (job) {
      job.stage = 'robustness';
      job.progress = 75;
    }
  }, 800);

  setTimeout(() => {
    const job = JOBS_STORE.get(jobId);
    if (job) {
      job.stage = 'compliance';
      job.progress = 90;
    }
  }, 1200);

  setTimeout(() => {
    const job = JOBS_STORE.get(jobId);
    if (job) {
      job.status = 'complete';
      job.stage = 'complete';
      job.progress = 100;
      job.result = result;
    }
  }, 1600);

  res.status(202).json({
    job_id: jobId,
    status: 'running',
    stage: 'fairness',
    progress: 25,
  });
});

// 6. Poll Audit Job
app.get('/api/audit/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (JOBS_STORE.has(jobId)) {
    return res.json(JOBS_STORE.get(jobId));
  }

  if (AUDITS_CACHE.has(jobId)) {
    return res.json({
      job_id: jobId,
      status: 'complete',
      stage: 'complete',
      progress: 100,
      result: AUDITS_CACHE.get(jobId),
      error: null,
    });
  }

  const jsonPath = path.resolve(OUTPUTS_DIR, `${jobId}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      AUDITS_CACHE.set(jobId, data);
      return res.json({
        job_id: jobId,
        status: 'complete',
        stage: 'complete',
        progress: 100,
        result: data,
        error: null,
      });
    } catch {}
  }

  res.status(404).json({ error: `Audit job '${jobId}' not found.` });
});

// 7. Download Model Card HTML / JSON
app.get('/api/modelcard/:auditId.:ext', (req, res) => {
  const { auditId, ext } = req.params;
  const lowerExt = ext.toLowerCase();

  if (lowerExt !== 'html' && lowerExt !== 'json') {
    return res.status(400).json({ error: "Extension must be 'html' or 'json'." });
  }

  const filePath = path.resolve(OUTPUTS_DIR, `${auditId}.${lowerExt}`);
  if (fs.existsSync(filePath)) {
    if (lowerExt === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="modelcard_${auditId}.html"`);
      return res.send(fs.readFileSync(filePath, 'utf-8'));
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="modelcard_${auditId}.json"`);
      return res.send(fs.readFileSync(filePath, 'utf-8'));
    }
  }

  let auditData = AUDITS_CACHE.get(auditId);
  if (!auditData) {
    if (auditId === 'german_credit') auditData = GERMAN_CREDIT_AUDIT;
    else if (auditId === 'compas') auditData = COMPAS_AUDIT;
  }

  if (auditData) {
    if (lowerExt === 'html') {
      const html = generateModelCardHtml(auditData);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="modelcard_${auditId}.html"`);
      return res.send(html);
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="modelcard_${auditId}.json"`);
      return res.json(auditData);
    }
  }

  res.status(404).json({ error: `Model Card for audit '${auditId}' not found.` });
});

// 8. Comparison Benchmark
app.get('/api/comparison', (_req, res) => {
  const compPath = path.resolve(OUTPUTS_DIR, 'comparison.json');
  if (fs.existsSync(compPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(compPath, 'utf-8'));
      return res.json(data);
    } catch (e) {
      console.warn('[server] Error reading comparison.json:', e);
    }
  }

  res.status(404).json({ error: 'Comparison benchmark data not found.' });
});

// Server Initialization
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[server] Running with Vite dev middleware');
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[server] Serving static production bundle from ' + distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] AutoAudit-360 full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[server] Fatal server error:', err);
  process.exit(1);
});
