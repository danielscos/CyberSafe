from fastapi import APIRouter, File, UploadFile
import magic
import mimetypes
import os

router = APIRouter()

@router.post("/filetype")
async def detect_filetype(file: UploadFile = File(...)):
    contents = await file.read()
    mime = magic.from_buffer(contents, mime=True)
    description = magic.from_buffer(contents)
    ext = mimetypes.guess_extension(mime)
    if ext:
        ext = ext.lstrip('.')
    else:
        # fallback: get extension from filename
        ext = os.path.splitext(file.filename)[1].lstrip('.')
        if not ext:
            ext = None
    return {
        "filename": file.filename,
        "mime_type": mime,
        "file_type": ext,
        "description": description
    }