from fastapi import APIRouter, File, UploadFile
import magic

router = APIRouter()

@router.post("/filetype")
async def detect_filetype(file: UploadFile = File(...)):
    contents = await file.read()
    mime = magic.from_buffer(contents, mime=True)
    return {"filename": file.filename, "mime_type": mime}
