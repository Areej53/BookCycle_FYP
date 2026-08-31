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
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")

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
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    
    if not ocr_text or len(ocr_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Insufficient text extracted from image")
    
    try:
        # Use Gemini Pro (more stable with deprecated API)
        model = genai.GenerativeModel('gemini-pro')
        
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
        
        response = model.generate_content(prompt)
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
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: 10MB"
        )
    
    if len(file_content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    try:
        # Step 1: Extract text using OCR
        logger.info(f"Processing image: {file.filename}, size: {len(file_content)} bytes")
        ocr_text = extract_text_from_image(file_content)
        
        if not ocr_text or len(ocr_text.strip()) < 5:
            raise HTTPException(
                status_code=400,
                detail="Could not extract enough text from image. Please use a clearer image."
            )
        
        # Step 2: Analyze with Gemini
        book_info = analyze_book_with_gemini(ocr_text)
        
        # Add confidence indicators
        detected_fields = {
            "title": bool(book_info.get("title")),
            "author": bool(book_info.get("author")),
            "edition": bool(book_info.get("edition")),
            "publisher": bool(book_info.get("publisher")),
            "category": bool(book_info.get("category")),
            "description": bool(book_info.get("description"))
        }
        
        return {
            "success": True,
            "data": book_info,
            "detectedFields": detected_fields,
            "message": "Book information detected successfully. Please review before submitting."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during book scanning: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Book scanning failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
