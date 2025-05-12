from fastapi import FastAPI, File, UploadFile
from rustlib import hash_sha256_str, hash_sha256_bytes # Updated import

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "up"}

@app.get("/hello")
async def hello():
    # This could also call rustlib.hello() if you want to keep it consistent
    return {"msg": "Hello from Rust!"} # Assuming rustlib.hello() is also available

@app.get("/hash_sha256")
async def hash_sha256_endpoint(text: str):
    digest = hash_sha256_str(text) # Use the string-specific Rust function
    return {"hash": digest}

@app.post("/hash_file")
async def hash_file_endpoint(file: UploadFile = File(...)):
    contents = await file.read() # Reads file as bytes

    # Now call the Rust function that handles bytes
    digest = hash_sha256_bytes(contents)

    return {"filename": file.filename, "hash_type": "sha256", "hash": digest}

