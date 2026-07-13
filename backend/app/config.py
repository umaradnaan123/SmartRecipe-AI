import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    SECRET_KEY: str = "7d5a57dc0d859b8d2d64016147bbcd829efbe64b21b2d41b6c7ad7fbf6ab2912"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
