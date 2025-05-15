from fastapi import FastAPI
from hashing import router as hashing_router
from filetype import router as features_router

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "up"}

app.include_router(hashing_router)
app.include_router(features_router)


