from fastapi import APIRouter, File, UploadFile
import magic
import mimetypes
import os
from google import genai
import time
from gemini_api_key import gemini_api_key
router = APIRouter()

client = genai.Client(api_key=gemini_api_key)

@router.post("/filetype")
async def detect_filetype(file: UploadFile = File(...)):
    contents = await file.read()
    mime = magic.from_buffer(contents, mime=True)
    ext = mimetypes.guess_extension(mime)
    if ext:
        ext = ext.lstrip('.')
    else:
        ext = os.path.splitext(file.filename)[1].lstrip('.')
        if not ext:
            ext = None

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

    return {
        "filename": file.filename,
        "mime_type": mime,
        "file_type": ext,
        "description": description
    }