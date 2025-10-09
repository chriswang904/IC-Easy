# services/winston_ai_service.py
"""
Winston AI API Integration Service
Detects AI-generated content using Winston AI API
"""

import os
import httpx
import logging
from typing import Dict
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class WinstonAIService:
    """Service for Winston AI content detection"""
    
    def __init__(self):
        self.api_key = os.getenv("WINSTON_AI_API_KEY")
        self.base_url = "https://api.gowinston.ai/v2"
        self.timeout = 30.0

        if not self.api_key:
            logger.warning("[WinstonAI] API key not configured")

    def is_available(self) -> bool:
        """Check if Winston AI service is available"""
        return bool(self.api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def detect_ai_content(self, text: str, language: str = "en") -> Dict:
        """
        Detect if text is AI-generated using Winston AI API
        """
        if not self.is_available():
            return {
                "status": "unavailable",
                "error": "Winston AI API key not configured",
                "ai_probability": None,
                "is_ai_generated": None,
                "confidence": None
            }

        if not text or len(text.strip()) < 50:
            return {
                "status": "invalid_input",
                "error": "Text too short (minimum 50 characters)",
                "ai_probability": 0.0,
                "is_ai_generated": False,
                "confidence": None
            }

        url = f"{self.base_url}/ai-content-detection"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {"text": text, "sentences": True, "language": language}

        try:
            logger.info(f"[WinstonAI] Sending request - text length: {len(text)}")

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

            # --- Normalize score ---
            raw_score = data.get("score", 0.0)
            score = raw_score / 100.0 if raw_score > 1 else raw_score

            # --- Winston API may include numeric confidence (0–1 or 0–100) ---
            api_conf_raw = data.get("confidence")
            if isinstance(api_conf_raw, (int, float)):
                if api_conf_raw > 1:
                    api_conf_raw /= 100.0
                # Map Winston numeric confidence into readable string
                if api_conf_raw >= 0.85:
                    confidence = "very_high"
                elif api_conf_raw >= 0.7:
                    confidence = "high"
                elif api_conf_raw >= 0.5:
                    confidence = "medium"
                else:
                    confidence = "low"
            else:
                # Fallback to internal distance-based confidence
                confidence = self._calculate_confidence(score)


            # --- Build response ---
            result = {
                "status": "success",
                "ai_probability": score,  # 0–1
                "is_ai_generated": score >= 0.5,
                "confidence": confidence,
                "prediction": data.get("prediction", "unknown"),
                "sentences": data.get("sentences", []),
                "details": {
                    "model_version": data.get("model_version"),
                    "language": language,
                    "timestamp": data.get("timestamp"),
                    "raw_score": raw_score
                }
            }

            logger.info(
                f"[WinstonAI] Detection complete - "
                f"score(raw): {raw_score:.2f} → normalized: {score:.4f}, "
                f"confidence: {confidence}"
            )

            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"[WinstonAI] HTTP error {e.response.status_code}: {e.response.text}")
            return {
                "status": "error",
                "error": f"API request failed: {e.response.status_code}",
                "ai_probability": None,
                "is_ai_generated": None,
                "confidence": None
            }

        except Exception as e:
            logger.error(f"[WinstonAI] Unexpected error: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "ai_probability": None,
                "is_ai_generated": None,
                "confidence": None
            }

    def _calculate_confidence(self, score: float) -> str:
        """Calculate confidence level from normalized score (0–1)."""
        try:
            distance = abs(score - 0.5)
            if distance > 0.35:
                return "very_high"
            elif distance > 0.25:
                return "high"
            elif distance > 0.15:
                return "medium"
            else:
                return "low"
        except Exception:
            return "unknown"

    async def get_account_info(self) -> Dict:
        """Get Winston AI account information"""
        if not self.is_available():
            return {"status": "unavailable", "error": "API key not configured"}
        return {
            "status": "configured",
            "message": "API key configured successfully"
        }
