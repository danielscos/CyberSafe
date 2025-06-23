from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.hashing import router as hashing_router
from api.filetype import router as features_router
from api.yara_scanner import router as yara_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
