from fastapi import FastAPI, File, UploadFile # type: ignore
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



@app.get("/hash_sha256")
async def hash_sha256_endpoint(text: str):
    digest = hash_sha256_str(text)
    return {"hash": digest, "hash_type": "sha256"}

@app.post("/hash_file_sha256")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read()

    digest = hash_sha256_bytes(contents)

    return {"filename": file.filename, "hash_type": "sha256", "hash": digest}



@app.get("/hash_sha512")
async def hash_sha512_endpoint(text: str):
    digest = hash_sha512_str(text)
    return {"hash": digest, "hash_type": "sha512"}


@app.post("/hash_file_sha512")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read()

    digest = hash_sha512_bytes(contents)

    return {"filename": file.filename, "hash_type": "sha512", "hash": digest}



@app.get("/hash_sha1")
async def hash_sha1_endpoint(text: str):
    digest = hash_sha1_str(text)
    return {"hash": digest, "hash_type": "sha1"}


@app.post("/hash_file_sha1")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read()

    digest = hash_sha1_bytes(contents)

    return {"filename": file.filename, "hash_type": "sha1", "hash": digest}



@app.get("/hash_md5")
async def hash_sha1_endpoint(text: str):
    digest = hash_md5_str(text)
    return {"hash": digest, "hash_type": "md5"}


@app.post("/hash_file_md5")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read()

    digest = hash_md5_bytes(contents)

    return {"filename": file.filename, "hash_type": "md5", "hash": digest}
