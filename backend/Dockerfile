FROM python:3.12.10-slim-bookworm AS builder
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1
WORKDIR /build
COPY pyproject.toml .
COPY app ./app
RUN python -m venv /opt/venv && /opt/venv/bin/pip install .

FROM python:3.12.10-slim-bookworm
ENV PATH=/opt/venv/bin:$PATH PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends fonts-liberation2 libharfbuzz-subset0 libpango-1.0-0 libpangoft2-1.0-0 libxml2-utils && rm -rf /var/lib/apt/lists/*
RUN groupadd --system persona && useradd --system --gid persona --home /app persona
COPY --from=builder /opt/venv /opt/venv
WORKDIR /app
COPY --chown=persona:persona . .
USER persona
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/live')"
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000","--no-access-log"]
