# services/plagiarism_service.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import util
import numpy as np
from typing import List, Dict
import re
import logging
import nltk

logger = logging.getLogger(__name__)

class PlagiarismService:
    """Service for checking text plagiarism and similarity"""
    
    def __init__(self, max_features: int = 20_000):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            max_features=max_features
        )
        
        self.semantic_model = None
        try:
            from sentence_transformers import SentenceTransformer
            self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
            logger.info("[PlagiarismService] Semantic model loaded successfully")
        except ImportError:
            logger.info("[PlagiarismService] Semantic model not available, TF-IDF fallback only.")
        except Exception as e:
            logger.error(f"[PlagiarismService] Failed to load semantic model: {e}")
    
    def check_tfidf_similarity(self, user_text: str, reference_texts: List[str]) -> Dict:
        """
        Check plagiarism using TF-IDF vectorization and cosine similarity
        
        Args:
            user_text: The text to check
            reference_texts: List of reference texts to compare against
            
        Returns:
            Dictionary containing similarity score and details
        """
        if not user_text.strip():
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': 'User text is empty',
                'method': 'tfidf'
            }
        
        if not reference_texts or all(not t.strip() for t in reference_texts):
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': 'Reference texts are empty',
                'method': 'tfidf'
            }
        
        # Preprocess texts
        user_text = self._preprocess_text(user_text)
        reference_texts = [self._preprocess_text(text) for text in reference_texts]
        
        if not user_text or all(not t for t in reference_texts):
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': 'Text contains only stop words or invalid characters',
                'method': 'tfidf'
            }
        
        # Combine all texts for vectorization
        all_texts = [user_text] + reference_texts
        
        try:
            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate cosine similarity between user text and each reference
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
            
            # Get maximum similarity score
            max_similarity = float(np.max(similarities))
            avg_similarity = float(np.mean(similarities))
            
            # Find most similar reference index
            most_similar_idx = int(np.argmax(similarities))
            
            return {
                'max_similarity': max_similarity,
                'avg_similarity': avg_similarity,
                'most_similar_index': most_similar_idx,
                'most_similar_text': reference_texts[most_similar_idx],
                'all_similarities': similarities.tolist(),
                'method': 'tfidf'
            }
            
        except Exception as e:
            logger.error(f"[PlagiarismService] TF-IDF similarity calculation error: {e}") 
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': str(e),
                'method': 'tfidf'
            }
    
    def check_semantic_similarity(self, user_text: str, reference_texts: List[str]) -> Dict:
        """
        Check plagiarism using semantic embeddings (Sentence Transformers)
        More accurate but requires model download
        
        Args:
            user_text: The text to check
            reference_texts: List of reference texts to compare against
            
        Returns:
            Dictionary containing similarity score and details
        """
        if not self.semantic_model:
            logger.warning("[PlagiarismService] Semantic model not available, falling back to TF-IDF")
            return self.check_tfidf_similarity(user_text, reference_texts)
        
        if not user_text.strip():
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': 'User text is empty',
                'method': 'semantic'
            }
        
        if not reference_texts or all(not t.strip() for t in reference_texts):
            return {
                'max_similarity': 0.0,
                'avg_similarity': 0.0,
                'error': 'Reference texts are empty',
                'method': 'semantic'
            }
        
        try:
            from sentence_transformers import util
            
            user_embedding = self.semantic_model.encode(user_text, convert_to_tensor=True, show_progress_bar=False)
            reference_embeddings = self.semantic_model.encode(reference_texts, convert_to_tensor=True, show_progress_bar=False)

            # Calculate cosine similarities
            similarities = util.cos_sim(user_embedding, reference_embeddings).squeeze()
            
            if len(reference_texts) == 1:
                similarities = [similarities.item()]
            else:
                similarities = similarities.cpu().numpy().tolist()
            
            max_similarity = float(max(similarities))
            avg_similarity = float(np.mean(similarities))
            most_similar_idx = int(np.argmax(similarities))
            
            return {
                'max_similarity': max_similarity,
                'avg_similarity': avg_similarity,
                'most_similar_index': most_similar_idx,
                'all_similarities': similarities,
                'method': 'semantic'
            }
            
        except Exception as e:
            logger.error(f"[PlagiarismService] Semantic similarity calculation error: {e}") 
            logger.info("[PlagiarismService] Falling back to TF-IDF method")
            
            result = self.check_tfidf_similarity(user_text, reference_texts)
            result["error"] = str(e)
            result["method"] = "semantic (fallback)"
            result["original_method"] = "semantic"
            return result
    
    def calculate_risk_level(self, similarity_score: float) -> str:
        """
        Determine plagiarism risk level based on similarity score
        
        Args:
            similarity_score: Similarity score between 0 and 1
            
        Returns:
            Risk level: 'low', 'medium', or 'high'
        """
        if similarity_score < 0.3:
            return "low"
        elif similarity_score < 0.6:
            return "medium"
        else:
            return "high"
    
    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess text for similarity comparison
        
        Args:
            text: Raw text string
            
        Returns:
            Cleaned text string
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters (keep only alphanumeric and spaces)
        # text = re.sub(r'[^a-zA-Z0-9\s.,\-()]', '', text) # Only for Scientific expression
        text = re.sub(r'[^a-zA-Z0-9\s.,;:\-()\[\]%]', '', text)
        
        return text.strip().lower()
    


    def check_sentence_similarity(self, user_text: str, reference_texts: List[str]) -> Dict:
        """Check similarity at sentence level with caching for better performance"""
        
        if not self.semantic_model:
            return {"error": "Semantic model not available"}
        
        try:
            from sentence_transformers import util
            import nltk
            
            # Ensure punkt tokenizer
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt', quiet=True)
            
            # Split user text into sentences
            user_sentences = nltk.sent_tokenize(user_text)
            
            # Pre-compute embeddings for ALL reference sentences (CACHE)
            ref_sentences_cache = []
            ref_embeddings_cache = []
            
            for ref_text in reference_texts:
                ref_sents = nltk.sent_tokenize(ref_text)
                ref_sentences_cache.append(ref_sents)
                
                # Encode all sentences from this reference at once
                ref_embs = self.semantic_model.encode(
                    ref_sents, 
                    convert_to_tensor=True,
                    show_progress_bar=False
                )
                ref_embeddings_cache.append(ref_embs)
            
            # Encode user sentences once
            user_embeddings = self.semantic_model.encode(
                user_sentences, 
                convert_to_tensor=True,
                show_progress_bar=False
            )
            
            # Now compare efficiently using cached embeddings
            sentence_matches = []
            
            for i, user_sent in enumerate(user_sentences):
                max_sim = 0.0
                best_ref_idx = -1
                best_ref_sent = ""
                
                # Compare against all cached reference embeddings
                for ref_idx, ref_embs in enumerate(ref_embeddings_cache):
                    similarities = util.cos_sim(
                        user_embeddings[i:i+1], 
                        ref_embs
                    ).squeeze()
                    
                    # Handle single vs multiple sentences
                    if ref_embs.shape[0] == 1:
                        sim_score = similarities.item()
                        best_sent_idx = 0
                    else:
                        sim_score = similarities.max().item()
                        best_sent_idx = similarities.argmax().item()
                    
                    if sim_score > max_sim:
                        max_sim = sim_score
                        best_ref_idx = ref_idx
                        best_ref_sent = ref_sentences_cache[ref_idx][best_sent_idx]
                
                sentence_matches.append({
                    "user_sentence": user_sent,
                    "similarity": float(max_sim),
                    "reference_index": best_ref_idx,
                    "matched_sentence": best_ref_sent,
                    "is_suspicious": max_sim > 0.7
                })
            
            return {
                "sentence_matches": sentence_matches,
                "suspicious_count": sum(1 for m in sentence_matches if m["is_suspicious"]),
                "total_sentences": len(user_sentences),
                "method": "sentence-level-semantic"
            }
            
        except Exception as e:
            logger.error(f"[PlagiarismService] Sentence similarity failed: {e}")
            return {"error": str(e)}