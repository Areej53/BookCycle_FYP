import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import google.generativeai as genai
import os
import io
import base64
import json
from PIL import Image
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BookCycle AI Scanner Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR reader
try:
    reader = easyocr.Reader(['en'], gpu=False)
    logger.info("EasyOCR initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize EasyOCR: {e}")
    reader = None

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured")
else:
    logger.warning("GEMINI_API_KEY not found or not configured")

VALID_CATEGORIES = [
    "Programming", "Science", "Novels", "Self Development", 
    "Algebra", "Mathematics", "Physics", "Notes", "Other"
]

def extract_text_from_image(image_data: bytes) -> str:
    """Extract text from image using EasyOCR"""
    if not reader:
        raise HTTPException(status_code=500, detail="OCR service not available")
    
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Perform OCR
        result = reader.readtext(image)
        
        # Extract text from results
        extracted_text = " ".join([text[1] for text in result])
        logger.info(f"OCR extracted {len(extracted_text)} characters")
        
        return extracted_text
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")

def analyze_book_with_gemini(ocr_text: str) -> dict:
    """Analyze OCR text using Gemini API to extract book information"""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    
    if not ocr_text or len(ocr_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Insufficient text extracted from image")
    
    try:
        # Candidate model names in priority order
        candidate_models = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-pro']
        
        prompt = f"""
Analyze the following text extracted from a book cover and extract book information.
Return ONLY valid JSON without markdown formatting.

Extracted text:
{ocr_text}

Extract the following information:
- title: The book title (if clearly identifiable)
- author: The author name (if clearly identifiable) 
- edition: Edition or year (if available, otherwise null)
- publisher: Publisher name (if available, otherwise null)
- category: Choose from: {', '.join(VALID_CATEGORIES)} (if determinable, otherwise "Other")
- description: A concise 2-4 sentence professional description based on the title and author

Rules:
- Return null/empty for information that cannot be determined
- Do not invent or hallucinate information
- Keep description concise and professional
- Return ONLY JSON, no markdown formatting

Response format:
{{
  "title": "...",
  "author": "...",
  "edition": null,
  "publisher": null,
  "category": "...",
  "description": "..."
}}
"""

        response = None
        last_error = None
        for model_name in candidate_models:
            try:
                logger.info(f"Attempting analysis with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                if response and hasattr(response, 'text') and response.text:
                    logger.info(f"Successfully generated response using model {model_name}")
                    break
            except Exception as model_err:
                logger.warning(f"Model {model_name} failed: {model_err}")
                last_error = model_err

        if not response or not hasattr(response, 'text') or not response.text:
            raise last_error or Exception("No compatible Gemini model could be reached.")

        response_text = response.text.strip()
        
        # Clean response - remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON response
        book_info = json.loads(response_text)
        
        # Validate category
        if book_info.get("category") not in VALID_CATEGORIES:
            book_info["category"] = "Other"
        
        logger.info(f"Gemini analysis successful: title={book_info.get('title')}, author={book_info.get('author')}")
        
        return book_info
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        logger.error(f"Response text: {response_text}")
        raise HTTPException(status_code=500, detail="Invalid response from AI service")
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "BookCycle AI Scanner Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ocr_available": reader is not None,
        "gemini_configured": GEMINI_API_KEY is not None
    }

@app.post("/scan-book-cover")
async def scan_book_cover(file: UploadFile = File(...)):
    """
    Scan a book cover image and extract book information using OCR and AI.
    
    Args:
        file: Image file (JPG, PNG, WEBP)
        
    Returns:
        JSON with extracted book information
    """
    logger.info(f"Received scan request for file: {file.filename}, content_type: {file.content_type}")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        logger.warning(f"Invalid file type: {file.content_type}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        logger.warning(f"File too large: {len(file_content)} bytes")
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: 10MB"
        )
    
    if len(file_content) == 0:
        logger.warning("Empty file received")
        raise HTTPException(status_code=400, detail="Empty file")
    
    try:
        # Step 1: Extract text using OCR
        logger.info(f"Processing image: {file.filename}, size: {len(file_content)} bytes")
        ocr_text = extract_text_from_image(file_content)
        logger.info(f"OCR extracted text: {ocr_text[:100]}... (length: {len(ocr_text)})")
        
        if not ocr_text or len(ocr_text.strip()) < 5:
            logger.warning("Insufficient text extracted from image")
            raise HTTPException(
                status_code=400,
                detail="Could not extract enough text from image. Please use a clearer image."
            )
        
        # Step 2: Analyze with Gemini
        logger.info("Starting Gemini analysis...")
        book_info = analyze_book_with_gemini(ocr_text)
        logger.info(f"Gemini analysis completed: {book_info}")
        
        # Add confidence indicators
        detected_fields = {
            "title": bool(book_info.get("title")),
            "author": bool(book_info.get("author")),
            "edition": bool(book_info.get("edition")),
            "publisher": bool(book_info.get("publisher")),
            "category": bool(book_info.get("category")),
            "description": bool(book_info.get("description"))
        }
        
        logger.info(f"Returning book info with detected fields: {detected_fields}")
        
        return {
            "success": True,
            "data": book_info,
            "detectedFields": detected_fields,
            "message": "Book information detected successfully. Please review before submitting."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during book scanning: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Book scanning failed: {str(e)}"
        )

def free_port_if_in_use(port: int):
    """If port is occupied, automatically free it before starting uvicorn server."""
    import socket
    import subprocess
    import time
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            in_use = (s.connect_ex(('127.0.0.1', port)) == 0)
            
        if not in_use:
            return

        logger.info(f"Port {port} is currently in use. Automatically freeing port {port}...")
        if os.name == 'nt':
            output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
            pids = set()
            for line in output.strip().split('\n'):
                parts = line.split()
                if len(parts) >= 5 and 'LISTENING' in line:
                    pid = parts[-1]
                    if pid != '0' and pid != str(os.getpid()):
                        pids.add(pid)
            for pid in pids:
                logger.info(f"Terminating old process PID {pid} on port {port}...")
                subprocess.call(f'taskkill /F /PID {pid}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(1)
    except Exception as e:
        logger.warning(f"Could not automatically free port {port}: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8003))
    free_port_if_in_use(port)
    uvicorn.run(app, host="0.0.0.0", port=port)
