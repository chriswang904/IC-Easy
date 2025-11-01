# api/plagiarism.py (UPDATED - Winston AI Only)
"""
API routes for plagiarism and AI detection
Integrates Winston AI 
"""

import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from models.schemas import PlagiarismTextRequest

from services.winston_ai_service import WinstonAIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Detection"])

# ==================== QUICK AI CHECK ====================

@router.post("/check-ai-only")
async def check_ai_only(
    file: UploadFile = File(...),
    use_api: bool = Query(default=True, description="Use Winston AI API")
):
    """
    AI-only content detection using Winston AI (accepts uploaded file).
    Reads text from the uploaded file and performs AI detection.
    """
    try:
        logger.info(f"[API] AI-only check (file): {file.filename}")

        # Read and decode file
        raw_bytes = await file.read()
        text = raw_bytes.decode("utf-8", errors="ignore")

        # Validate minimum text length
        if len(text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="File contains too little readable text (minimum 50 characters)."
            )

        # --- Run Winston AI detection ---
        winston = WinstonAIService()
        result = await winston.detect_ai_content(text)

        # Check if Winston AI succeeded
        if result.get("status") != "success":
            error_msg = result.get("error", "Winston AI detection failed")
            logger.error(f"[API] Winston AI error: {error_msg}")
            raise HTTPException(
                status_code=500,
                detail=f"Winston AI API error: {error_msg}. Please check your API key configuration."
            )

        # --- Extract and normalize probability ---
        # Winston AI returns probability as 0-1, convert to 0-100
        ai_probability_raw = result.get("ai_probability")
        
        if ai_probability_raw is None:
            logger.error(f"[API] Winston AI returned None for ai_probability: {result}")
            raise HTTPException(
                status_code=500,
                detail="Winston AI returned invalid response. Please check API configuration."
            )
        
        ai_prob = float(ai_probability_raw) * 100.0
        ai_prob = max(0.0, min(ai_prob, 100.0))  # Clamp between 0-100
        
        # --- Determine if AI generated (threshold: 50%) ---
        is_ai = ai_prob >= 50.0
        method_used = result.get("method", "Winston AI")

        # --- Risk level classification ---
        if ai_prob >= 90:
            overall_risk = "very_high"
        elif ai_prob >= 70:
            overall_risk = "high"
        elif ai_prob >= 40:
            overall_risk = "medium"
        else:
            overall_risk = "low"

        logger.info(f"[API] AI Detection Complete:")
        logger.info(f"  - Probability: {ai_prob:.2f}%")
        logger.info(f"  - Is AI: {is_ai}")
        logger.info(f"  - Method: {method_used}")
        logger.info(f"  - Risk: {overall_risk}")

        # --- Final response payload ---
        return {
            "status": "success",
            "filename": file.filename,
            "ai_probability": round(ai_prob, 2),
            "is_ai_generated": is_ai,
            "method": method_used,
            "overall_risk": overall_risk,
            "details": {
                "ai_detection": {
                    "status": "success",
                    "method": method_used,
                    "probability": round(ai_prob, 2),
                    "raw_response": result  # Include full Winston AI response for debugging
                }
            },
            "recommendations": [
                {
                    "type": "ai_detected" if is_ai else "clean",
                    "severity": overall_risk,
                    "message": (
                        "AI-Generated Content Detected"
                        if is_ai else "Content Appears Human-Written"
                    ),
                    "suggestion": (
                        f"This text has a {ai_prob:.1f}% probability of being AI-generated. "
                        "Consider rewriting in your own words or adding clear disclosure."
                        if is_ai
                        else f"Your text has only a {ai_prob:.1f}% probability of being AI-generated. "
                        "It appears authentic and human-written."
                    ),
                }
            ],
        }

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"[API] Value conversion error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process Winston AI response: {str(e)}"
        )
    except Exception as e:
        logger.error(f"[API] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )