from fastapi import FastAPI, File, UploadFile
from rustlib import (
    hash_sha256_str,
    hash_sha256_bytes,
    hash_md5_str,
    hash_md5_bytes,
    hash_sha1_str,
    hash_sha1_bytes,
    hash_sha512_str,
    hash_sha512_bytes
)

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "up"}

@app.get("/hello")
async def hello():
    return {"msg": "Hello from Rust!"}

@app.get("/hash_sha256")
async def hash_sha256_endpoint(text: str):
    digest = hash_sha256_str(text)
    return {"hash": digest}

@app.post("/hash_file")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read()

    digest = hash_sha256_bytes(contents)

    return {"filename": file.filename, "hash_type": "sha256", "hash": digest}

