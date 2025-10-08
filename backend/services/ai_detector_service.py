# services/ai_detector_service.py
import os
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoConfig, AutoModel
import logging

logger = logging.getLogger(__name__)

class DesklibAIDetectionModel(nn.Module):
    def __init__(self, encoder, hidden_size):
        super().__init__()
        self.encoder = encoder
        self.classifier = nn.Linear(hidden_size, 1)

    def forward(self, input_ids, attention_mask=None, token_type_ids=None):
        outputs = self.encoder(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids
        )
        last_hidden_state = outputs.last_hidden_state
        pooled = last_hidden_state.mean(dim=1)
        return self.classifier(pooled)


class AIDetectorService:
    def __init__(self, local_dir: str = "./models/desklib_ai_detector_fixed", max_length: int = 768):
        self.local_dir = local_dir
        self.max_length = max_length
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.initialized = False
        try:
            self._initialize_model()
        except Exception as e:
            logger.error(f"[AIDetectorService] Failed to initialize: {e}")

    def _initialize_model(self):
        logger.info("[AIDetectorService] Loading models for AI detection")
        logger.info(f"[AIDetectorService] Using device: {self.device}")

        self.tokenizer = AutoTokenizer.from_pretrained(self.local_dir, use_fast=True)

        base_name = "desklib/ai-text-detector-v1.01"
        cfg = AutoConfig.from_pretrained(base_name)
        encoder = AutoModel.from_pretrained(base_name)

        model = DesklibAIDetectionModel(encoder, cfg.hidden_size)

        sd_path = os.path.join(self.local_dir, "pytorch_model.bin")
        if not os.path.exists(sd_path):
            raise FileNotFoundError(f"Missing state_dict: {sd_path}")
        state = torch.load(sd_path, map_location="cpu")
        model.load_state_dict(state, strict=False)

        model.to(self.device)
        model.eval()
        torch.set_grad_enabled(False)

        self.model = model
        self.initialized = True
        logger.info("[AIDetectorService] Desklib model loaded (encoder+classifier)")

    async def check_ai_content(self, text: str, threshold: float = 0.5):
        if not self.initialized:
            return {"status":"unavailable","ai_probability":0.0,"is_ai_generated":False}
        if not text or len(text.strip()) < 50:
            return {"status":"invalid_input","ai_probability":0.0,"is_ai_generated":False}

        enc = self.tokenizer(
            text, padding="max_length", truncation=True,
            max_length=self.max_length, return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            logits = self.model(**enc)

        p = torch.sigmoid(logits).detach().float().cpu().item()
        is_ai = p >= threshold
        delta = abs(p - 0.5)
        conf = "high" if delta > 0.30 else "medium" if delta > 0.15 else "low"

        return {
            "status": "success",
            "ai_probability": p,
            "is_ai_generated": is_ai,
            "confidence": conf,
            "threshold_used": threshold,
            "details": {"models_used": ["desklib (local state_dict)"]}
        }

    def is_service_available(self) -> bool:
        return self.initialized

    def get_model_info(self):
        return {"device": str(self.device), "initialized": self.initialized}
