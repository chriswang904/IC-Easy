# api/plagiarism.py
"""
API routes for plagiarism and AI detection.
Supports text or file input (.txt, .docx, .pdf).
"""

import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import PlagiarismTextRequest, PlagiarismCheckResponse
from services.plagiarism_service import PlagiarismService

router = APIRouter(prefix="/api/plagiarism", tags=["Plagiarism"])

# 1. Direct text check
@router.post("/check-text", response_model=PlagiarismCheckResponse)
async def check_text(payload: PlagiarismTextRequest):
    """
    Check plagiarism and AI generation from raw text input.
    """
    try:
        service = PlagiarismService()
        result = await service.comprehensive_check_text(payload.text, check_ai=payload.check_ai)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {e}")

# File upload check (.txt / .docx / .pdf)
@router.post("/check-file", response_model=PlagiarismCheckResponse)
async def check_file(file: UploadFile = File(...), check_ai: bool = True):
    """
    Check plagiarism and AI generation from an uploaded file (.txt, .docx, or .pdf).
    """
    service = PlagiarismService()
    os.makedirs("temp", exist_ok=True)
    temp_path = os.path.join("temp", file.filename)

    try:
        # Save temporary file
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        # Extract text
        text = service.extract_text_from_file(temp_path)
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="File does not contain enough readable text.")

        # Run detection
        result = await service.comprehensive_check_text(text, check_ai=check_ai)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading or processing file: {e}")

    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass
