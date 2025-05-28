from fastapi import APIRouter, File, UploadFile
from rustlib import (
    hash_sha256_str,
    hash_sha256_bytes,
    hash_md5_str,
    hash_md5_bytes,
    hash_sha1_str,
    hash_sha1_bytes,
    hash_sha512_str,
    hash_sha512_bytes,
    hash_blake3_str,
    hash_blake3_bytes
)

router = APIRouter()

@router.get("/hash_sha256")
async def hash_sha256_endpoint(text: str):
    digest = hash_sha256_str(text)
    return {"hash": digest, "hash_type": "sha256"}

@router.post("/hash_file_sha256")
async def hash_file_sha256(file: UploadFile = File(...)):
    contents = await file.read()
    digest = hash_sha256_bytes(contents)
    return {"filename": file.filename, "hash_type": "sha256", "hash": digest}

@router.get("/hash_sha512")
async def hash_sha512_endpoint(text: str):
    digest = hash_sha512_str(text)
    return {"hash": digest, "hash_type": "sha512"}

@router.post("/hash_file_sha512")
async def hash_file_sha512(file: UploadFile = File(...)):
    contents = await file.read()
    digest = hash_sha512_bytes(contents)
    return {"filename": file.filename, "hash_type": "sha512", "hash": digest}

@router.get("/hash_sha1")
async def hash_sha1_endpoint(text: str):
    digest = hash_sha1_str(text)
    return {"hash": digest, "hash_type": "sha1"}

@router.post("/hash_file_sha1")
async def hash_file_sha1(file: UploadFile = File(...)):
    contents = await file.read()
    digest = hash_sha1_bytes(contents)  
    return {"filename": file.filename, "hash_type": "sha1", "hash": digest}

@router.get("/hash_md5")
async def hash_md5_endpoint(text: str):
    digest = hash_md5_str(text)
    return {"hash": digest, "hash_type": "md5"}

@router.post("/hash_file_md5")
async def hash_file_md5(file: UploadFile = File(...)):
    contents = await file.read()
    digest = hash_md5_bytes(contents)
    return {"filename": file.filename, "hash_type": "md5", "hash": digest}

@router.get("/hash_blake3")
async def hash_blake3_endpoint(text: str):
    digest = hash_blake3_str(text)
    return {"hash": digest, "hash_type": "blake3"}

@router.post("/hash_file_blake3")
async def hash_file_blake3(file: UploadFile = File(...)):
    contents = await file.read()
    digest = hash_blake3_bytes(contents)
    return {"filename": file.filename, "hash_type": "blake3", "hash": digest}