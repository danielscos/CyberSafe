from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from hashing import router as hashing_router
from filetype import router as features_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # The frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"status": "up"}

app.include_router(hashing_router)
app.include_router(features_router)