FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update || true && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    --fix-missing || true && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5001

CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT}"]
