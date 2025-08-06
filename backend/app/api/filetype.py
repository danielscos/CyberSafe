from fastapi import APIRouter, File, UploadFile
import mimetypes
import os
import time
import sys

# Try to import magic with fallback handling
try:
    import magic
    MAGIC_AVAILABLE = True
    # Test if magic files are available
    try:
        magic.from_buffer(b"test", mime=True)
        MAGIC_WORKING = True
    except Exception as e:
        print(f"Magic files not available: {e}")
        MAGIC_WORKING = False
except ImportError:
    MAGIC_AVAILABLE = False
    MAGIC_WORKING = False
    print("Warning: python-magic not available, using fallback detection")

from rustlib import (
    hash_sha256_bytes,
    hash_md5_bytes,
    entropy_bytes
)

import google.generativeai as genai

router = APIRouter()

def get_mime_type_fallback(contents, filename=""):
    """Fallback MIME type detection without python-magic"""

    # Common file signatures (magic numbers)
    signatures = {
        b'\x89PNG\r\n\x1a\n': 'image/png',
        b'\xff\xd8\xff': 'image/jpeg',
        b'GIF87a': 'image/gif',
        b'GIF89a': 'image/gif',
        b'%PDF': 'application/pdf',
        b'PK\x03\x04': 'application/zip',
        b'PK\x05\x06': 'application/zip',
        b'PK\x07\x08': 'application/zip',
        b'\x7fELF': 'application/x-executable',
        b'MZ': 'application/x-executable',
        b'\xca\xfe\xba\xbe': 'application/x-executable',  # Java class
        b'\xfe\xed\xfa\xce': 'application/x-executable',  # Mach-O
        b'\xfe\xed\xfa\xcf': 'application/x-executable',  # Mach-O
        b'\xcf\xfa\xed\xfe': 'application/x-executable',  # Mach-O
        b'\xce\xfa\xed\xfe': 'application/x-executable',  # Mach-O
        b'Rar!\x1a\x07\x00': 'application/x-rar-compressed',
        b'Rar!\x1a\x07\x01': 'application/x-rar-compressed',
        b'\x1f\x8b\x08': 'application/gzip',
        b'BZh': 'application/x-bzip2',
        b'\xfd7zXZ\x00': 'application/x-xz',
        b'#!/bin/sh': 'text/x-shellscript',
        b'#!/bin/bash': 'text/x-shellscript',
        b'#!/usr/bin/env python': 'text/x-python',
        b'#!/usr/bin/python': 'text/x-python',
        b'<html': 'text/html',
        b'<!DOCTYPE html': 'text/html',
        b'<?xml': 'application/xml',
        b'\x00\x00\x00\x18ftypmp4': 'video/mp4',
        b'\x00\x00\x00\x20ftypM4A': 'audio/mp4',
        b'ID3': 'audio/mpeg',
        b'\xff\xfb': 'audio/mpeg',
        b'\xff\xf3': 'audio/mpeg',
        b'\xff\xf2': 'audio/mpeg',
        b'OggS': 'application/ogg',
        b'RIFF': 'audio/wav',  # Could also be video, need further check
        b'\x42\x4d': 'image/bmp',
        b'\x00\x00\x01\x00': 'image/x-icon',
        b'\x00\x00\x02\x00': 'image/x-icon',
    }

    # Check file signatures
    for signature, mime_type in signatures.items():
        if contents.startswith(signature):
            return mime_type

    # Special case for RIFF files (WAV/AVI)
    if contents.startswith(b'RIFF') and len(contents) > 11:
        if contents[8:12] == b'WAVE':
            return 'audio/wav'
        elif contents[8:12] == b'AVI ':
            return 'video/x-msvideo'

    # Check for text content
    if len(contents) > 0:
        try:
            # Try to decode as UTF-8 text
            text_sample = contents[:1024].decode('utf-8', errors='strict')

            # Check for specific text file patterns
            if filename.endswith('.py') or '#!/usr/bin/env python' in text_sample:
                return 'text/x-python'
            elif filename.endswith('.js'):
                return 'application/javascript'
            elif filename.endswith('.css'):
                return 'text/css'
            elif filename.endswith('.html') or filename.endswith('.htm'):
                return 'text/html'
            elif filename.endswith('.xml'):
                return 'application/xml'
            elif filename.endswith('.json'):
                return 'application/json'
            elif filename.endswith('.sh') or text_sample.startswith('#!'):
                return 'text/x-shellscript'
            else:
                return 'text/plain'
        except UnicodeDecodeError:
            pass

    # Try mimetypes based on filename
    if filename:
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type:
            return mime_type

    # Default fallback
    return 'application/octet-stream'

def detect_mime_type(contents, filename=""):
    """Detect MIME type with fallback support"""
    if MAGIC_WORKING:
        try:
            return magic.from_buffer(contents, mime=True)
        except Exception as e:
            print(f"Magic detection failed: {e}, using fallback")

    return get_mime_type_fallback(contents, filename)

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

    # Detect MIME type with fallback
    filename = file.filename if file.filename else ''
    mime = detect_mime_type(contents, filename)

    # Get file extension
    ext = mimetypes.guess_extension(mime)
    if ext:
        ext = ext.lstrip('.')
    else:
        if filename:
            ext = os.path.splitext(filename)[1].lstrip('.')
        if not ext:
            ext = mime.split('/')[1] if '/' in mime else 'unknown'

    prompt = f"Give a brief, one sentence explanation of what a {ext} file type is and what it is commonly used for. Keep it simple and easy to understand for non-technical users."
    description = "Could not fetch explanation."

    try:
        # Step 1: Configure the library with your API key
        genai.configure(api_key="AIzaSyD7LPM2NeyJLBmkpdvE-PkAqtcr3enzBT8")

        # Step 2: Create a model instance
        model = genai.GenerativeModel("gemini-1.5-flash-latest")

        # Step 3: Generate content
        gemini_response = model.generate_content(prompt)
        description = gemini_response.text.strip()

    except Exception as e:
        print(f"Gemini API error: {e}")
        description = f"An error occurred with the Gemini API: {e}"

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
            "description": description,
            "magic_available": MAGIC_WORKING
        }
