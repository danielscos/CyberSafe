import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.hashing import router as hashing_router
from api.filetype import router as features_router
from api.yara_scanner import router as yara_router
from api.clamav_scanning import router as clamav_router
from api.sandbox import router as sandbox_router
from api.sandbox_terminal import router as sandbox_terminal_router
from api.sandbox_files import router as sandbox_files_router
from api.session_manager import router as session_manager_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "up"}

app.include_router(hashing_router)
app.include_router(features_router)
app.include_router(yara_router)
app.include_router(clamav_router)
app.include_router(sandbox_router)
app.include_router(sandbox_terminal_router)
app.include_router(sandbox_files_router)
app.include_router(session_manager_router)

# Mount static files for the interactive sandbox interface
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
