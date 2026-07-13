from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import engine, Base
from .config import settings
from .routes import auth, users, detections

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Object Detector API",
    description="Backend API for AI Object Detector & Smart Resource Finder",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
# Next.js usually runs on port 3000
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4000",
    "http://127.0.0.1:4000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under API v1 prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(detections.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Object Detector API is running.",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
