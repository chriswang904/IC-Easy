# # services/plagiarism_service.py (UPDATED)
# """
# Unified Plagiarism Detection Service
# Combines local AI detection with online plagiarism checking
# """

# import os
# import logging
# import torch
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from docx import Document
# from pypdf import PdfReader
# from datetime import datetime
# from typing import Dict, Optional

# # Import new services
# from services.ai_detector_service import AIDetectorService
# from services.winston_ai_service import WinstonAIService
# from services.plagiarismcheck_service import PlagiarismCheckService

# logger = logging.getLogger(__name__)

# class PlagiarismService:
#     """Unified service for plagiarism & AI detection"""

#     def __init__(self):
#         # Local AI detector (existing - Desklib)
#         self.local_ai_detector = AIDetectorService()
        
#         # External API services (new)
#         self.winston_ai = WinstonAIService()
#         self.plagiarism_check = PlagiarismCheckService()
        
#         # Device configuration
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
#         # Load local Longformer model (kept as backup)
#         self.plag_model = None
#         self.plag_tokenizer = None
#         self._load_local_plagiarism_model()
        
#         logger.info("[PlagiarismService] Service initialized")
#         logger.info(f"[PlagiarismService] Winston AI available: {self.winston_ai.is_available()}")
#         logger.info(f"[PlagiarismService] PlagiarismCheck available: {self.plagiarism_check.is_available()}")
#         logger.info(f"[PlagiarismService] Local AI detector available: {self.local_ai_detector.is_service_available()}")

#     def _load_local_plagiarism_model(self):
#         """Load local Longformer plagiarism model (backup)"""
#         try:
#             logger.info("[PlagiarismService] Loading local Longformer model...")
#             self.plag_tokenizer = AutoTokenizer.from_pretrained(
#                 "jpwahle/longformer-base-plagiarism-detection"
#             )
#             self.plag_model = AutoModelForSequenceClassification.from_pretrained(
#                 "jpwahle/longformer-base-plagiarism-detection"
#             )
#             self.plag_model.to(self.device)
#             self.plag_model.eval()
#             logger.info("[PlagiarismService] Local model loaded successfully")
#         except Exception as e:
#             logger.error(f"[PlagiarismService] Failed to load local model: {e}")
#             self.plag_model = None

#     # ==================== FILE EXTRACTION ====================
    
#     def extract_text_from_file(self, file_path: str) -> str:
#         """Extract text from txt, docx, or pdf files"""
#         file_path_lower = file_path.lower()

#         if file_path_lower.endswith(".txt"):
#             with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
#                 return f.read()

#         elif file_path_lower.endswith(".docx"):
#             doc = Document(file_path)
#             return "\n".join(p.text for p in doc.paragraphs)

#         elif file_path_lower.endswith(".pdf"):
#             reader = PdfReader(file_path)
#             text_pages = []
#             for page in reader.pages:
#                 try:
#                     text_pages.append(page.extract_text() or "")
#                 except Exception:
#                     text_pages.append("")
#             return "\n".join(text_pages)

#         else:
#             raise ValueError("Unsupported file type (only .txt, .docx, .pdf allowed)")

#     # ==================== AI DETECTION ====================
    
#     async def detect_ai_content(self, text: str, use_api: bool = True) -> Dict:
#         """
#         Detect AI-generated content
#         Priority: Winston AI API > Local Desklib model
        
#         Args:
#             text: Text to analyze
#             use_api: If True, prefer API over local model
            
#         Returns:
#             AI detection result
#         """
#         # Try Winston AI API first (if available and preferred)
#         if use_api and self.winston_ai.is_available():
#             try:
#                 logger.info("[PlagiarismService] Using Winston AI for AI detection")
#                 result = await self.winston_ai.detect_ai_content(text)
                
#                 if result["status"] == "success":
#                     return {
#                         "method": "winston_ai_api",
#                         "status": "success",
#                         "ai_probability": result["ai_probability"],
#                         "is_ai_generated": result["is_ai_generated"],
#                         "confidence": result["confidence"],
#                         "details": result.get("details", {}),
#                         "prediction": result.get("prediction", "unknown")
#                     }
#                 else:
#                     logger.warning(f"[PlagiarismService] Winston AI failed: {result.get('error')}")
            
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] Winston AI error: {e}")
        
#         # Fallback to local Desklib model
#         if self.local_ai_detector.is_service_available():
#             try:
#                 logger.info("[PlagiarismService] Using local Desklib model for AI detection")
#                 result = await self.local_ai_detector.check_ai_content(text)
                
#                 return {
#                     "method": "local_desklib",
#                     "status": result["status"],
#                     "ai_probability": result.get("ai_probability", 0.0),
#                     "is_ai_generated": result.get("is_ai_generated", False),
#                     "confidence": result.get("confidence", "low"),
#                     "details": result.get("details", {})
#                 }
            
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] Local AI detector error: {e}")
        
#         # No detector available
#         return {
#             "method": "none",
#             "status": "unavailable",
#             "error": "No AI detection service available",
#             "ai_probability": None,
#             "is_ai_generated": None,
#             "confidence": None
#         }

#     # ==================== PLAGIARISM DETECTION ====================
    
#     async def detect_plagiarism(
#         self,
#         text: str,
#         use_online: bool = True,
#         custom_author: Optional[str] = None
#     ) -> Dict:
#         """
#         Detect plagiarism
#         Priority: PlagiarismCheck.org API > Local Longformer model
        
#         Args:
#             text: Text to check
#             use_online: If True, use online API
#             custom_author: Optional author name
            
#         Returns:
#             Plagiarism detection result
#         """
#         # Try PlagiarismCheck.org API first
#         if use_online and self.plagiarism_check.is_available():
#             try:
#                 logger.info("[PlagiarismService] Using PlagiarismCheck.org API")
#                 result = await self.plagiarism_check.check_plagiarism(
#                     text,
#                     custom_author=custom_author,
#                     wait_for_result=True
#                 )
                
#                 if result["status"] == "success":
#                     plag_percent = result.get("plagiarism_percent", 0)
#                     risk_level = self.plagiarism_check.calculate_risk_level(plag_percent)
                    
#                     return {
#                         "method": "plagiarismcheck_api",
#                         "status": "success",
#                         "plagiarism_probability": plag_percent / 100.0,
#                         "plagiarism_percent": plag_percent,
#                         "unique_percent": result.get("unique_percent", 100),
#                         "risk_level": risk_level,
#                         "sources_found": len(result.get("sources", [])),
#                         "sources": result.get("sources", [])[:5],  # Top 5 sources
#                         "report_url": result.get("report_url"),
#                         "details": result
#                     }
#                 else:
#                     logger.warning(f"[PlagiarismService] PlagiarismCheck failed: {result.get('error')}")
            
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] PlagiarismCheck error: {e}")
        
#         # Fallback to local Longformer model
#         if self.plag_model:
#             try:
#                 logger.info("[PlagiarismService] Using local Longformer model")
#                 result = self._check_local_plagiarism(text)
#                 return result
            
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] Local plagiarism check error: {e}")
        
#         # No detector available
#         return {
#             "method": "none",
#             "status": "unavailable",
#             "error": "No plagiarism detection service available",
#             "plagiarism_probability": None,
#             "risk_level": "unknown"
#         }

#     def _check_local_plagiarism(self, text: str) -> Dict:
#         """Local plagiarism check using Longformer (backup method)"""
#         try:
#             inputs = self.plag_tokenizer(
#                 text,
#                 truncation=True,
#                 padding=True,
#                 max_length=4096,
#                 return_tensors="pt"
#             ).to(self.device)

#             with torch.no_grad():
#                 outputs = self.plag_model(**inputs)

#             logits = outputs.logits
            
#             # Handle different logit shapes
#             if logits.shape[-1] == 1:
#                 prob = float(torch.sigmoid(logits).item())
#             else:
#                 prob = float(torch.softmax(logits, dim=-1)[0, 1].item())

#             risk = self._calculate_risk_level(prob)

#             return {
#                 "method": "local_longformer",
#                 "status": "success",
#                 "plagiarism_probability": prob,
#                 "risk_level": risk,
#                 "note": "Local model estimates - not compared against actual sources"
#             }

#         except Exception as e:
#             logger.error(f"[PlagiarismService] Local check failed: {e}")
#             return {
#                 "method": "local_longformer",
#                 "status": "error",
#                 "error": str(e),
#                 "plagiarism_probability": 0.0,
#                 "risk_level": "unknown"
#             }

#     def _calculate_risk_level(self, score: float) -> str:
#         """Calculate risk level from probability score"""
#         if score < 0.3:
#             return "low"
#         elif score < 0.6:
#             return "medium"
#         else:
#             return "high"

#     # ==================== COMPREHENSIVE CHECK ====================
    
#     async def comprehensive_check_text(
#         self,
#         text: str,
#         check_ai: bool = True,
#         check_plagiarism: bool = True,
#         use_online_apis: bool = True,
#         custom_author: Optional[str] = None
#     ) -> Dict:
#         """
#         Complete plagiarism + AI detection workflow
        
#         Args:
#             text: Text to analyze
#             check_ai: Enable AI detection
#             check_plagiarism: Enable plagiarism detection
#             use_online_apis: Prefer online APIs over local models
#             custom_author: Optional author name
            
#         Returns:
#             Comprehensive analysis report
#         """
#         logger.info(f"[PlagiarismService] Starting comprehensive check - {len(text)} chars")
        
#         results = {
#             "ai_detection": None,
#             "plagiarism": None
#         }
        
#         # AI Detection
#         if check_ai:
#             try:
#                 results["ai_detection"] = await self.detect_ai_content(
#                     text,
#                     use_api=use_online_apis
#                 )
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] AI detection failed: {e}")
#                 results["ai_detection"] = {
#                     "status": "error",
#                     "error": str(e)
#                 }
        
#         # Plagiarism Detection
#         if check_plagiarism:
#             try:
#                 results["plagiarism"] = await self.detect_plagiarism(
#                     text,
#                     use_online=use_online_apis,
#                     custom_author=custom_author
#                 )
#             except Exception as e:
#                 logger.error(f"[PlagiarismService] Plagiarism detection failed: {e}")
#                 results["plagiarism"] = {
#                     "status": "error",
#                     "error": str(e)
#                 }
        
#         # Build unified response
#         ai = results["ai_detection"] or {}
#         plag = results["plagiarism"] or {}
        
#         response = {
#             # AI Detection Results
#             "ai_probability": ai.get("ai_probability"),
#             "is_ai_generated": ai.get("is_ai_generated"),
#             "ai_confidence": ai.get("confidence"),
#             "ai_detection_method": ai.get("method", "none"),
#             "ai_prediction": ai.get("prediction"),
            
#             # Plagiarism Results
#             "plagiarism_probability": plag.get("plagiarism_probability"),
#             "plagiarism_percent": plag.get("plagiarism_percent"),
#             "unique_percent": plag.get("unique_percent"),
#             "plagiarism_risk": plag.get("risk_level", "unknown"),
#             "plagiarism_method": plag.get("method", "none"),
#             "sources_found": plag.get("sources_found", 0),
#             "top_sources": plag.get("sources", []),
#             "report_url": plag.get("report_url"),
            
#             # Overall Assessment
#             "overall_risk": self._calculate_overall_risk(ai, plag),
#             "recommendations": self._generate_recommendations(ai, plag),
            
#             # Metadata
#             "timestamp": datetime.now().isoformat(),
#             "text_length": len(text),
#             "checks_performed": {
#                 "ai_detection": check_ai,
#                 "plagiarism": check_plagiarism,
#                 "used_online_apis": use_online_apis
#             },
            
#             # Detailed results
#             "details": {
#                 "ai_detection": ai,
#                 "plagiarism": plag
#             }
#         }
        
#         logger.info(
#             f"[PlagiarismService] Check complete - "
#             f"AI: {response['ai_probability']}, "
#             f"Plagiarism: {response['plagiarism_percent']}%"
#         )
        
#         return response
    
#     def _calculate_overall_risk(self, ai_result: Dict, plag_result: Dict) -> str:
#         """Calculate overall risk level from both checks"""
#         risks = []
        
#         # AI risk
#         ai_prob = ai_result.get("ai_probability")
#         if ai_prob is not None:
#             if ai_prob > 0.7:
#                 risks.append("high")
#             elif ai_prob > 0.5:
#                 risks.append("medium")
#             else:
#                 risks.append("low")
        
#         # Plagiarism risk
#         plag_risk = plag_result.get("risk_level", "low")
#         risks.append(plag_risk)
        
#         # Determine overall risk
#         if "very_high" in risks or risks.count("high") >= 2:
#             return "very_high"
#         elif "high" in risks:
#             return "high"
#         elif "medium" in risks:
#             return "medium"
#         else:
#             return "low"
    
#     def _generate_recommendations(self, ai_result: Dict, plag_result: Dict) -> list:
#         """Generate recommendations based on detection results"""
#         recommendations = []
        
#         # AI detection recommendations
#         ai_prob = ai_result.get("ai_probability")
#         if ai_prob is not None and ai_prob > 0.5:
#             recommendations.append({
#                 "type": "ai_detected",
#                 "severity": "high" if ai_prob > 0.7 else "medium",
#                 "message": f"Content appears to be {ai_prob:.0%} AI-generated",
#                 "suggestion": "Consider rewriting in your own words or clearly cite AI assistance"
#             })
        
#         # Plagiarism recommendations
#         plag_percent = plag_result.get("plagiarism_percent")
#         if plag_percent is not None and plag_percent > 15:
#             sources_count = plag_result.get("sources_found", 0)
#             recommendations.append({
#                 "type": "plagiarism_detected",
#                 "severity": "very_high" if plag_percent > 50 else "high" if plag_percent > 30 else "medium",
#                 "message": f"{plag_percent}% similarity found with {sources_count} sources",
#                 "suggestion": "Review matched sources and add proper citations or paraphrase content"
#             })
        
#         # All clear
#         if not recommendations:
#             recommendations.append({
#                 "type": "clear",
#                 "severity": "none",
#                 "message": "Content appears original and human-written",
#                 "suggestion": "No immediate action required"
#             })
        
#         return recommendations