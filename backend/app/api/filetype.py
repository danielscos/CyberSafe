from fastapi import APIRouter, File, UploadFile
import magic
import mimetypes
import os
import google.generativeai as genai
import time
from .gemini_api_key import gemini_api_key
from rustlib import (
    hash_sha256_bytes,
    hash_md5_bytes,
    entropy_bytes
)

router = APIRouter()

genai.configure(api_key=gemini_api_key)

def interpret_entropy(entropy, filesize):
    if filesize < 1024:
        return {
            "label": "Unreliable",
            "explanation": "Entropy is not reliable for files smaller than 1 KB."
        }
    if entropy < 2.0:
        return {
            "label": "Very Low",
            "explanation": "Very low entropy. Almost certainly plain text or highly repetitive data."
        }
    elif entropy < 4.0:
        return {
            "label": "Low",
            "explanation": "Low entropy. Likely text, config, or uncompressed data."
        }
    elif entropy < 5.5:
        return {
            "label": "Moderate",
            "explanation": "Moderate entropy. Some randomness, possibly mixed or lightly compressed."
        }
    elif entropy < 6.8:
        return {
            "label": "High",
            "explanation": "High entropy. Likely compressed image (e.g., PNG, JPEG), executable, or binary data."
        }
    elif entropy < 7.6:
        return {
            "label": "Very High",
            "explanation": "Very high entropy. Likely compressed archive (ZIP, 7z), compressed image, AppImage, or partially encrypted data."
        }
    else:
        return {
            "label": "Maximal",
            "explanation": "Maximal entropy. Typical for encrypted, random, or well-compressed files (e.g., ZIP, 7z, AppImage, PNG, JPEG)."
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
        filename = file.filename if file.filename else ''
        ext = os.path.splitext(filename)[1].lstrip('.')
        if not ext:
            ext = mime.split('/')[1] if '/' in mime else 'unknown'

    prompt = f"Give a brief, one sentence explanation of what a {ext} file type is and what it is commonly used for. Keep it simple and easy to understand for non-technical users."
    description = "Could not fetch explanation."

    for _ in range(3): # try up to 3 times
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            gemini_response = model.generate_content(prompt)
            description = gemini_response.candidates[0].content.parts[0].text.strip()
            break
        except Exception as e:
            if "overloaded" in str(e).lower():
                time.sleep(2)  # wait and retry
            else:
                break

    filesize = len(contents)
    entropy_value = float(entropy)
    entropy_info = interpret_entropy(entropy_value, filesize)

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
