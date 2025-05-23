from fastapi import APIRouter, File, UploadFile
import magic
import mimetypes
import os
from google import genai
import time
from .gemini_api_key import gemini_api_key
from rustlib import (
    hash_sha256_bytes,
    hash_md5_bytes,
    entropy_bytes
)


router = APIRouter()

client = genai.Client(api_key=gemini_api_key)

def interpret_entropy(entropy):
    if entropy < 2.0:
        return {
            "label": "Very Low",
            "explanation": "Very low entropy. Almost certainly plain text, source code, or highly structured data."
        }
    elif entropy < 4.0:
        return {
            "label": "Low",
            "explanation": "Low entropy. Likely plain text, configuration files, or uncompressed data."
        }
    elif entropy < 5.5:
        return {
            "label": "Moderate",
            "explanation": "Moderate entropy. May be a mix of text and binary data, or lightly compressed."
        }
    elif entropy < 7.0:
        return {
            "label": "High",
            "explanation": "High entropy. Likely compressed, packed, or obfuscated data."
        }
    elif entropy < 7.8:
        return {
            "label": "Very High",
            "explanation": "Very high entropy. Most likely encrypted, compressed, or random data."
        }
    else:
        return {
            "label": "Maximal",
            "explanation": "Maximal entropy. Almost certainly encrypted or purely random data."
        }

@router.post("/filetype")
async def detect_filetype(file: UploadFile = File(...)):
    contents = await file.read()
    hash_256 = hash_sha256_bytes(contents)
    hash_md5 = hash_md5_bytes(contents)
    entropy = entropy_bytes(contents)
    mime = magic.from_buffer(contents, mime=True)
    ext = mimetypes.guess_extension(mime)
    if ext:
        ext = ext.lstrip('.')
    else:
        ext = os.path.splitext(file.filename)[1].lstrip('.')
        if not ext:
            ext = mime.split('/')[1] if '/' in mime else 'unknown'

    prompt = f"Give a brief, one sentence explanation of what a {ext} file type is and what it is commonly used for. Keep it simple and easy to understand for non-technical users."
    description = "Could not fetch explanation."
    
    for _ in range(3): # try up to 3 times
        try:
            gemini_response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            description = gemini_response.candidates[0].content.parts[0].text.strip()
            break
        except Exception as e:
            if "overloaded" in str(e).lower():
                time.sleep(2)  # wait and retry
            else:
                break

    filesize = len(contents)
    entropy_value = float(entropy)
    entropy_info = interpret_entropy(entropy_value)

    return {
        "filesize": filesize,
        "filename": file.filename,
        "mime_type": mime,
        "file_type": ext,
        "sha256": hash_256,
        "md5": hash_md5,
        "entropy": round(entropy_value, 2),
        "entropy_label": entropy_info["label"],
        "entropy_explanation": entropy_info["explanation"],
        "description": description
    }