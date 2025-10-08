# services/plagiarism_service.py
"""
Plagiarism detection service + AI detection.
Uses:
- Longformer model (jpwahle/longformer-base-plagiarism-detection)
- Ensemble AI detector (Desklib)
- Supports .txt, .docx, .pdf file extraction
"""

import os
import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from docx import Document
from pypdf import PdfReader
from datetime import datetime
from services.ai_detector_service import AIDetectorService

logger = logging.getLogger(__name__)

class PlagiarismService:
    """Main service for plagiarism & AI detection."""

    _plag_model = None
    _plag_tokenizer = None
    _model_loaded = False

    def __init__(self):
        # Load AI detector (Desklib ensemble)
        self.ai_detector_service = AIDetectorService()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load Longformer plagiarism detection model
        try:
            logger.info("[PlagiarismService] Loading Longformer plagiarism model...")
            self.plag_tokenizer = AutoTokenizer.from_pretrained("jpwahle/longformer-base-plagiarism-detection")
            self.plag_model = AutoModelForSequenceClassification.from_pretrained(
                "jpwahle/longformer-base-plagiarism-detection"
            )
            self.plag_model.to(self.device)
            self.plag_model.eval()

            PlagiarismService._plag_model = self.plag_model
            PlagiarismService._plag_tokenizer = self.plag_tokenizer
            PlagiarismService._model_loaded = True

            logger.info("[PlagiarismService] Longformer model loaded successfully.")
        except Exception as e:
            self.plag_model = None
            logger.error(f"[PlagiarismService] Failed to load Longformer model: {e}")


    # Text Extraction from files
    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from txt, docx, or pdf files."""
        file_path = file_path.lower()

        if file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs)

        elif file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            text_pages = []
            for page in reader.pages:
                try:
                    text_pages.append(page.extract_text() or "")
                except Exception:
                    text_pages.append("")
            return "\n".join(text_pages)

        else:
            raise ValueError("Unsupported file type (only .txt, .docx, .pdf allowed).")

    # Plagiarism Detection 
    def check_plagiarism_noref(self, text: str) -> dict:
        """Check plagiarism risk without needing reference texts."""
        if not self.plag_model:
            return {
                "plagiarism_probability": 0.0,
                "risk_level": "low",
                "method": "longformer",
                "error": "Plagiarism model not initialized",
            }

        try:
            inputs = self.plag_tokenizer(text, truncation=True, padding=True, max_length=4096, return_tensors="pt").to(self.device)

            with torch.no_grad():
                outputs = self.plag_model(**inputs)

            logits = outputs.logits
            # Handle both 1D and 2D logits
            if logits.shape[-1] == 1:
                prob = float(torch.sigmoid(logits).item())
            else:
                prob = float(torch.softmax(logits, dim=-1)[0, 1].item())

            risk = self.calculate_risk_level(prob)

            return {
                "plagiarism_probability": prob,
                "risk_level": risk,
                "method": "longformer",
            }

        except Exception as e:
            logger.error(f"[PlagiarismService] Longformer inference failed: {e}")
            return {
                "plagiarism_probability": 0.0,
                "risk_level": "low",
                "method": "longformer",
                "error": str(e),
            }

    # Risk level helper
    def calculate_risk_level(self, score: float) -> str:
        if score < 0.3:
            return "low"
        elif score < 0.6:
            return "medium"
        else:
            return "high"

    # Combined Plagiarism + AI check
    async def comprehensive_check_text(self, text: str, check_ai: bool = True) -> dict:
        """Run plagiarism + AI detection for plain text."""
        results = {"plagiarism": None, "ai_detection": None}

        # Run plagiarism detection
        results["plagiarism"] = self.check_plagiarism_noref(text)

        # Run AI detection if enabled
        if check_ai and self.ai_detector_service.is_service_available():
            try:
                results["ai_detection"] = await self.ai_detector_service.check_ai_content(text)
            except Exception as e:
                logger.error(f"[PlagiarismService] AI detection failed: {e}")
                results["ai_detection"] = {"error": str(e), "status": "failed"}
        else:
            results["ai_detection"] = {"status": "ai_detection_disabled"}

        # Return unified format
        plag = results["plagiarism"]
        ai = results["ai_detection"]

        return {
            "plagiarism_probability": plag.get("plagiarism_probability", 0.0),
            "plagiarism_risk": plag.get("risk_level", "low"),
            "ai_probability": ai.get("ai_probability", None),
            "is_ai_generated": ai.get("is_ai_generated", None),
            "ai_confidence": ai.get("confidence", None),
            "details": {"plagiarism": plag, "ai": ai},
            "timestamp": datetime.now().isoformat(),
        }
