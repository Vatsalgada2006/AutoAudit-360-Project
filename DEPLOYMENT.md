# AutoAudit-360 — Production Deployment & Operations Guide

This guide details the deployment architecture, configuration steps, verification procedures, and operational constraints for **AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite**.

---

## 1. Architecture Overview

AutoAudit-360 uses a dual-engine architecture designed for high-performance responsive UI and rigorous scientific ML computation:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / HTTPS (Port 3000 / $PORT)
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js Express Server                   │
│                       (`server.js`)                         │
│  - Serves compiled React 19 SPA (`dist/`)                   │
│  - Reverse proxies `/api/*` to Python engine (Port 5000)    │
│  - Manages Python child process lifecycle                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Internal HTTP (Port 5000)
┌──────────────────────────────▼──────────────────────────────┐
│                    Python Flask ML Engine                   │
│                         (`app.py`)                          │
│  - Scikit-Learn 1.6.1 + SHAP 0.54.1 audit computation       │
│  - Background worker thread with asynchronous job polling   │
│  - Model Card HTML/JSON generator (`auditors/modelcard.py`) │
│  - Path-traversal sanitization & zero unpickling security   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Verified Local Production Build & Start

The application has been verified to build and run in production mode locally:

```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt

# 2. Build production assets
# Generates optimized dist/ SPA bundle and compiles server.ts to server.js via esbuild
npm run build

# 3. Start unified full-stack server
npm start
# Server listens on http://0.0.0.0:3000 and automatically spawns Python Flask engine on port 5000
```

Verify service readiness:
```bash
curl http://localhost:3000/api/health
# Response: {"status":"healthy","version":"2.0.0","allow_model_upload":false,...}
```

---

## 3. Recommended Deployment Architecture: Docker Web Service

The simplest and most resilient architecture that eliminates Python/Node buildpack version incompatibilities is a **unified container deployment** using the included `Dockerfile`.

### Supported Free/Low-Cost Cloud Platforms:

| Platform | Deployment Mode | Free Tier Support | Build Specs |
| :--- | :--- | :--- | :--- |
| **Render** | Docker Web Service | Yes (Free 512MB RAM, spins down after inactivity) | Built from Git (`render.yaml`) |
| **Railway** | Docker Web Service | Yes ($5 credit/mo free tier) | Auto-detects `Dockerfile` |
| **Google Cloud Run** | Serverless Container | Yes (2M requests/mo free) | Connects to Google AI Studio |
| **Fly.io** | Machines Container | Yes (Free allowance) | `fly launch` with Dockerfile |

---

## 4. Exact Step-by-Step Deployment Instructions

### Method A: Deploy on Render (Recommended Free-Tier Target)

1. **Push Changes to GitHub**:
   Ensure all changes are committed and pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "AutoAudit-360: Signal Edition redesign, test suite, and deployment container"
   git push origin master
   ```

2. **Connect to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository: `https://github.com/Vatsalgada2006/AutoAudit-360-Project`.

3. **Configure Service Settings**:
   - **Name**: `autoaudit-360`
   - **Language / Runtime**: **Docker** (Render automatically detects `Dockerfile`)
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Instance Type**: **Free**
   - **Health Check Path**: `/api/health`

4. **Environment Variables**:
   Add the following environment variables in the Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `ALLOW_MODEL_UPLOAD`: `false`
   - `PYTHONUNBUFFERED`: `1`

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will build the container, execute `npm run build`, and launch `node server.js`.
   - Your live URL will be active at: `https://autoaudit-360.onrender.com` (or your custom service slug).

---

### Method B: Deploy on Google Cloud Run (AI Studio Applet Integration)

Since the project has an existing Google AI Studio applet (`https://ai.studio/apps/1fd1d0ae-9354-4944-afef-56dc3fcdec17`), deploying to Cloud Run enables direct zero-configuration authentication:

```bash
# 1. Build and push container to Google Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/autoaudit-360

# 2. Deploy to Cloud Run
gcloud run deploy autoaudit-360 \
  --image gcr.io/PROJECT_ID/autoaudit-360 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1
```

---

## 5. Environment Variables Reference

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Integer | `3000` | Port for the Node.js reverse proxy & static SPA server. |
| `FLASK_PORT` | Integer | `5000` | Internal port where the Python Flask audit engine listens. |
| `NODE_ENV` | String | `production` | Set to `production` to serve static `dist/` bundle without Vite dev server. |
| `PYTHON_BIN` | String | Auto-detected | Path or command for Python runtime (e.g. `python`, `python3`, `.venv/Scripts/python.exe`). |
| `ALLOW_MODEL_UPLOAD` | Boolean | `false` | Security safeguard: Prevents untrusted arbitrary `.pkl`/`.joblib` deserialization. |
| `CORS_ORIGIN` | String | `*` | Allowed CORS origins for API endpoints. |
| `GEMINI_API_KEY` | String | Empty | Optional Google AI Studio secret for Gemini integrations. |
| `APP_URL` | String | Optional | Public canonical deployment URL. |

---

## 6. Verification and Health Endpoints

Once deployed, verify operational readiness using these endpoints:

1. **System Health Check**:
   ```bash
   curl -s https://<YOUR-APP-URL>/api/health
   # Returns: {"status":"healthy","version":"2.0.0","service":"AutoAudit-360..."}
   ```

2. **Benchmark Metadata Verification**:
   ```bash
   curl -s https://<YOUR-APP-URL>/api/demo/german_credit
   # Returns dataset structure, row count (1000), target, and protected attributes.
   ```

3. **End-to-End Audit Verification**:
   Execute the automated verification script:
   ```bash
   python scripts/verify_e2e.py
   # Confirms health, dispatches German Credit audit, polls progress, and asserts verdict.
   ```

---

## 7. Free-Tier Operational Constraints & Mitigations

- **Cold Starts**: On free tiers (e.g., Render free web services), inactive containers spin down after 15 minutes of inactivity. The initial incoming request will incur a 45–60 second delay while the container boots. The UI displays clear loading states and the Node proxy returns retry-friendly `503` responses while Flask initializes.
- **Memory Footprint**: Scikit-Learn and SHAP computations require approximately 300–450MB of RAM during 5-seed cross-validation and background Shapley estimations. The application is tuned to keep background samples at 80 instances, safely remaining below the 512MB free tier cap.
- **Ephemeral Storage**: Free hosting tiers provide ephemeral disk storage. All custom uploaded CSV files in `data_store/` and generated reports in `outputs/` are kept in memory and local temporary disk; downloads (PDF, HTML, JSON) are streamed directly to the client.

---

## 8. Rollback Procedures

If an unexpected runtime regression occurs on the production service:

1. **Git Rollback**:
   ```bash
   # Revert to the last known stable commit tag
   git checkout master
   git log --oneline -n 5
   # If necessary:
   git revert <COMMIT_HASH>
   git push origin master
   ```

2. **Cloud Dashboard Rollback**:
   - In Render: Go to **Deploys** tab > Select the previous successful deploy > Click **Rollback to this deploy**.
   - In Cloud Run: Re-route 100% of traffic to the previous revision in the Cloud Run Console.
