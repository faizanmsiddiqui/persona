from fastapi import FastAPI
import logging
import time
import uuid
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .config import get_settings
from .routers.auth import router as auth_router
from .routers.profile import router as profile_router
from .routers.resumes import router as resumes_router

settings = get_settings()
logger = logging.getLogger("persona.audit")
app = FastAPI(title="Persona API", version="1.0.0")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "api", "nginx", "testserver"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resumes_router)

@app.middleware("http")
async def security_headers(request, call_next):
    request_id = str(uuid.uuid4())
    started = time.monotonic()
    if request.headers.get("content-length") and int(request.headers["content-length"]) > 1_000_000:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Request too large"}, status_code=413)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    logger.info("request_complete", extra={"request_id": request_id, "method": request.method, "path": request.url.path, "status": response.status_code, "duration_ms": round((time.monotonic()-started)*1000)})
    response.headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.get("/health/live", tags=["health"])
def live() -> dict[str, str]:
    return {"status": "ok"}
