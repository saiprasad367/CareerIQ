# ============================================================
# CareerIQ — Backend Dockerfile
# ============================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for build tools and PostgreSQL libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . .

# Create non-root user and private storage directory
RUN useradd -m careeriq && \
    mkdir -p /app/storage_data && \
    chown -R careeriq:careeriq /app

USER careeriq

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
