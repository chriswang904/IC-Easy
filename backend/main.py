# main.py
"""
Chrome AI Challenge Backend API - Main Application Entry Point

This module initializes the FastAPI application, configures middleware,
registers routes, and sets up logging for the backend service.

Author: Chrome AI Challenge Team
Version: 1.0.0
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api import literature, plagiarism
import os
import logging
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

# Configure logging format and level
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),  # Output to console
        logging.FileHandler('backend.log', encoding='utf-8')  # Output to file
    ]
)

# Create logger for this module
logger = logging.getLogger(__name__)

# ============================================================================
# FASTAPI APPLICATION INITIALIZATION
# ============================================================================

# Create FastAPI application instance with metadata
app = FastAPI(
    title="Chrome AI Challenge Backend API",
    description=(
        "Backend API service for literature search, reference formatting, and plagiarism detection. "
        "Supports multiple data sources (CrossRef, arXiv, OpenAlex) and citation formats (APA, IEEE, MLA)."
    ),
    version="1.0.0",
    docs_url="/docs",           # Swagger UI documentation
    redoc_url="/redoc",         # ReDoc documentation
    openapi_url="/openapi.json" # OpenAPI schema
)

# ============================================================================
# CORS MIDDLEWARE CONFIGURATION
# ============================================================================

# Get allowed origins from environment variable or use default
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

logger.info(f"[CORS] Allowed origins: {origins}")

# Configure Cross-Origin Resource Sharing (CORS)
# This allows frontend applications to make requests to the backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # List of allowed origins
    allow_credentials=True,          # Allow cookies and authentication
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all headers
    expose_headers=["*"],            # Expose all headers to the client
    max_age=3600,                    # Cache preflight requests for 1 hour
)

# ============================================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to catch unhandled exceptions
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse with error details
    """
    logger.error(
        f"[Global Exception Handler] Unhandled exception occurred - "
        f"path={request.url.path}, method={request.method}, error={str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred",
            "error": str(exc),
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url.path)
        }
    )

# ============================================================================
# STARTUP AND SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler
    
    Performs initialization tasks when the application starts:
    - Log application startup
    - Initialize connections (if needed)
    - Warm up services
    """
    logger.info("=" * 60)
    logger.info("Chrome AI Challenge Backend API - Starting Up")
    logger.info("=" * 60)
    logger.info(f"[Startup] Application version: {app.version}")
    logger.info(f"[Startup] Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"[Startup] Allowed CORS origins: {origins}")
    logger.info("[Startup] Initializing services...")
    
    # Initialize services (if needed)
    try:
        # You can add service initialization here
        # For example: warming up ML models, checking API connections, etc.
        logger.info("[Startup] All services initialized successfully")
    except Exception as e:
        logger.error(f"[Startup] Service initialization failed: {str(e)}", exc_info=True)
        raise
    
    logger.info("[Startup] Application startup complete")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler
    
    Performs cleanup tasks when the application shuts down:
    - Log application shutdown
    - Close connections
    - Save state (if needed)
    """
    logger.info("=" * 60)
    logger.info("Chrome AI Challenge Backend API - Shutting Down")
    logger.info("=" * 60)
    logger.info("[Shutdown] Cleaning up resources...")
    
    # Cleanup code here (if needed)
    # For example: closing database connections, saving cache, etc.
    
    logger.info("[Shutdown] Application shutdown complete")
    logger.info("=" * 60)

# ============================================================================
# REQUEST MIDDLEWARE (Optional - for logging all requests)
# ============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all incoming requests and their processing time
    
    Args:
        request: The incoming request
        call_next: The next middleware or route handler
        
    Returns:
        Response from the route handler
    """
    # Generate unique request ID
    request_id = f"{datetime.now().timestamp()}"
    
    # Log incoming request
    logger.info(
        f"[Request {request_id}] Incoming - "
        f"method={request.method}, path={request.url.path}, "
        f"client={request.client.host if request.client else 'unknown'}"
    )
    
    # Record start time
    start_time = datetime.now()
    
    # Process the request
    try:
        response = await call_next(request)
        
        # Calculate processing time
        process_time = (datetime.now() - start_time).total_seconds()
        
        # Log response
        logger.info(
            f"[Request {request_id}] Completed - "
            f"status={response.status_code}, "
            f"duration={process_time:.3f}s"
        )
        
        # Add custom headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.3f}"
        
        return response
        
    except Exception as e:
        # Log error
        process_time = (datetime.now() - start_time).total_seconds()
        logger.error(
            f"[Request {request_id}] Failed - "
            f"error={str(e)}, duration={process_time:.3f}s",
            exc_info=True
        )
        raise

# ============================================================================
# ROUTE REGISTRATION
# ============================================================================

# Include API routers
logger.info("[Route Registration] Registering literature routes...")
app.include_router(literature.router)

logger.info("[Route Registration] Registering plagiarism routes...")
app.include_router(plagiarism.router)

logger.info("[Route Registration] All routes registered successfully")

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """
    Root endpoint - API information and available endpoints
    
    Returns:
        Dictionary with API information and endpoint list
    """
    logger.debug("[Root] API information requested")
    
    return {
        "message": "Chrome AI Challenge Backend API",
        "version": "1.0.0",
        "status": "running",
        "description": "Backend API for literature search, reference formatting, and plagiarism detection",
        "data_sources": {
            "crossref": "General academic papers with DOI",
            "arxiv": "Preprints in physics, math, computer science",
            "openalex": "Open access comprehensive academic database"
        },
        "features": [
            "Literature search across multiple sources",
            "Reference formatting (APA, IEEE, MLA)",
            "Plagiarism detection (TF-IDF and Semantic)",
            "DOI, arXiv ID, and OpenAlex ID lookup"
        ],
        "endpoints": {
            "literature_search": "POST /api/literature/search",
            "literature_by_doi": "GET /api/literature/doi/{doi}",
            "literature_by_arxiv": "GET /api/literature/arxiv/{arxiv_id}",
            "literature_by_openalex": "GET /api/literature/openalex/{openalex_id}",
            "format_reference": "POST /api/literature/format-reference",
            "plagiarism_check": "POST /api/plagiarism/check",
            "health_check": "GET /health"
        },
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_schema": "/openapi.json"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """
    Global health check endpoint
    
    Returns:
        Dictionary with service health status
    """
    logger.debug("[Health Check] Global health check requested")
    
    # Check service health (you can add actual health checks here)
    health_status = {
        "status": "healthy",
        "service": "backend-api",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "uptime": "unknown",  # You can calculate actual uptime if needed
        "services": {
            "literature": "operational",
            "plagiarism": "operational"
        },
        "data_sources": {
            "crossref": "operational",
            "arxiv": "operational",
            "openalex": "operational"
        }
    }
    
    return health_status

@app.get("/api/info")
async def api_info():
    """
    Detailed API information endpoint
    
    Returns:
        Dictionary with detailed API specifications
    """
    logger.debug("[API Info] Detailed API information requested")
    
    return {
        "api_name": "Chrome AI Challenge Backend API",
        "version": "1.0.0",
        "description": "RESTful API for academic literature management",
        "base_url": "/api",
        "authentication": "None (Open API for demonstration)",
        "rate_limit": "None (Currently unlimited)",
        "response_format": "JSON",
        "supported_methods": ["GET", "POST"],
        "available_routes": {
            "literature": {
                "search": {
                    "method": "POST",
                    "path": "/api/literature/search",
                    "description": "Search for academic literature",
                    "parameters": {
                        "keyword": "Search query (string, required)",
                        "limit": "Number of results (integer, 1-50, default: 10)",
                        "source": "Data source (crossref|arxiv|openalex, default: crossref)"
                    }
                },
                "doi_lookup": {
                    "method": "GET",
                    "path": "/api/literature/doi/{doi}",
                    "description": "Get literature by DOI"
                },
                "arxiv_lookup": {
                    "method": "GET",
                    "path": "/api/literature/arxiv/{arxiv_id}",
                    "description": "Get paper by arXiv ID"
                },
                "openalex_lookup": {
                    "method": "GET",
                    "path": "/api/literature/openalex/{openalex_id}",
                    "description": "Get work by OpenAlex ID"
                },
                "format_reference": {
                    "method": "POST",
                    "path": "/api/literature/format-reference",
                    "description": "Format literature reference",
                    "formats": ["apa", "ieee", "mla"]
                }
            },
            "plagiarism": {
                "check": {
                    "method": "POST",
                    "path": "/api/plagiarism/check",
                    "description": "Check text for plagiarism",
                    "methods": ["tfidf", "semantic"]
                }
            }
        },
        "contact": {
            "repository": "https://github.com/your-repo/chrome-ai-challenge",
            "email": "your-email@example.com"
        }
    }

# ============================================================================
# DEVELOPMENT SERVER RUNNER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    logger.info("=" * 60)
    logger.info("Starting Uvicorn Server")
    logger.info("=" * 60)
    logger.info(f"Host: {host}")
    logger.info(f"Port: {port}")
    logger.info(f"Reload: {reload}")
    logger.info(f"Log Level: {log_level}")
    logger.info("=" * 60)
    
    # Run the application with Uvicorn
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,          # Auto-reload on code changes (development only)
        log_level=log_level,    # Logging level
        access_log=True,        # Enable access logging
        use_colors=True         # Colorize log output
    )