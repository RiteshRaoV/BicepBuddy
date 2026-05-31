from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.core.database import Base, engine

# Create tables for now (in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BicepBuddy API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to BicepBuddy API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
