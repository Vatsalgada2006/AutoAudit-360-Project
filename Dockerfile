# AutoAudit-360: Production Unified Full-Stack Container
# Serves React 19 Frontend + Node Express Proxy + Python Flask ML Audit Engine

FROM python:3.11-slim

# Install system dependencies, Node.js 20, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Python audit engine requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 2. Install Node dependencies
COPY package*.json ./
RUN npm install

# 3. Copy application code and build frontend bundle & server runner
COPY . .
RUN npm run build

# 4. Prepare directories and permissions
RUN mkdir -p data_store outputs \
    && chmod -R 777 data_store outputs

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV FLASK_PORT=5000
ENV PYTHON_BIN=python
ENV PYTHONUNBUFFERED=1
ENV ALLOW_MODEL_UPLOAD=false

# Expose public port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start full-stack server
CMD ["node", "server.js"]
