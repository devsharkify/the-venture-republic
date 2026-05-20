# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:18-slim AS frontend-builder

WORKDIR /frontend

# Copy package files + patch script FIRST so postinstall can run the ajv patch
COPY frontend/package*.json ./
COPY frontend/scripts ./scripts

RUN npm install --legacy-peer-deps

# Now copy the rest of the source
COPY frontend/ .

RUN DISABLE_ESLINT_PLUGIN=true \
    SKIP_PREFLIGHT_CHECK=true \
    GENERATE_SOURCEMAP=false \
    REACT_APP_BACKEND_URL=https://api.venturerepublic.in \
    npm run build

# ── Stage 2: Python backend (serves API + React build) ───────────────────────
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangocairo-1.0-0 libcairo2 libgdk-pixbuf-2.0-0 \
    libffi-dev shared-mime-info \
    fonts-noto fonts-noto-cjk fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

COPY backend/ .

# Copy React build into the container
COPY --from=frontend-builder /frontend/build ./frontend_build

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"]
