from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BENCHMARK_OPENAI_API_KEY = "sk-proj-personaBenchmarkFakeCredential000000000000000"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg://persona:persona@db/persona"
    jwt_secret: str = Field(min_length=32, default="development-only-change-me-000000")
    cookie_secure: bool = True
    allowed_origins: list[str] = ["http://localhost:8080"]


@lru_cache
def get_settings() -> Settings:
    values: dict[str, str] = {}
    for field in ("jwt_secret", "database_url"):
        secret_file = Path(f"/run/secrets/{field}")
        if secret_file.is_file():
            values[field] = secret_file.read_text(encoding="utf-8").strip()
    return Settings(**values)
