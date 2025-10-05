# api/plagiarism.py
from fastapi import APIRouter, HTTPException
from models.schemas import PlagiarismCheckRequest, PlagiarismCheckResponse
from services.plagiarism_service import PlagiarismService

router = APIRouter(prefix="/api/plagiarism", tags=["Plagiarism"])

# Initialize plagiarism service
plagiarism_service = PlagiarismService(max_features=20_000)

@router.post("/check", response_model=PlagiarismCheckResponse)
async def check_plagiarism(request: PlagiarismCheckRequest):
    """
    Check text for plagiarism against reference texts
    
    Args:
        request: PlagiarismCheckRequest containing user text, reference texts, and method
        
    Returns:
        PlagiarismCheckResponse with similarity score and risk level
    """
    try:
        # Validate inputs
        if not request.user_text or not request.user_text.strip():
            raise HTTPException(status_code=400, detail="User text cannot be empty")
        
        if not request.reference_texts or len(request.reference_texts) == 0:
            raise HTTPException(status_code=400, detail="At least one reference text is required")
        
        # Choose plagiarism detection method
        if request.method == "tfidf":
            result = plagiarism_service.check_tfidf_similarity(
                request.user_text,
                request.reference_texts
            )
        elif request.method == "semantic":
            result = plagiarism_service.check_semantic_similarity(
                request.user_text,
                request.reference_texts
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported method: {request.method}. Use 'tfidf' or 'semantic'"
            )
        
        # Check for errors in similarity calculation
        if 'error' in result and "fallback" not in result.get('method', ''):
            raise HTTPException(status_code=500, detail=result['error'])

        
        # Calculate risk level based on maximum similarity
        similarity_score = result['max_similarity']
        risk_level = plagiarism_service.calculate_risk_level(similarity_score)
        
        return PlagiarismCheckResponse(
            similarity_score=similarity_score,
            risk_level=risk_level,
            details={
                'method': result.get('method'),
                'avg_similarity': result.get('avg_similarity'),
                'most_similar_index': result.get('most_similar_index'),
                'all_similarities': result.get('all_similarities', [])
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plagiarism check failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for plagiarism API"""
    return {
        "status": "healthy",
        "service": "plagiarism",
        "available_methods": ["tfidf", "semantic"]
    }

@router.post("/check-sentences", response_model=dict)
async def check_sentence_plagiarism(request: PlagiarismCheckRequest):
    """
    Check plagiarism at sentence level with highlighting
    
    Returns detailed sentence-by-sentence similarity analysis
    """
    try:
        if not request.user_text or not request.reference_texts:
            raise HTTPException(status_code=400, detail="Invalid input")
        
        result = plagiarism_service.check_sentence_similarity(
            request.user_text,
            request.reference_texts
        )
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))