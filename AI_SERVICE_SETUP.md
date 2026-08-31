# AI Book Cover Scanner - Setup Guide

## Overview
The AI Book Cover Scanner is a Python FastAPI service that uses EasyOCR and Google Gemini API to automatically extract book information from cover images.

## Architecture
```
React Frontend → Node.js Backend → Python FastAPI AI Service → EasyOCR + Gemini API
```

## Prerequisites

### Python Version
- Python 3.8 or higher

### Node.js Version
- Node.js 14 or higher (already required for BookCycle)

## Installation Steps

### 1. Set Up Python AI Service

#### Navigate to AI Service Directory
```bash
cd ai-service
```

#### Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
AI_SERVICE_PORT=8001
```

#### Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

### 2. Configure Node.js Backend

#### Update Backend Environment Variables
1. Navigate to backend directory:
```bash
cd backend
```

2. Open `.env` file and add:
```
AI_SERVICE_URL=http://localhost:8001
```

3. If `.env` doesn't exist, copy from `.env.example`:
```bash
copy .env.example .env
```

## Running the Services

### Start Python AI Service
```bash
cd ai-service
# If using virtual environment, activate it first
python main.py
```

The AI service will start on `http://localhost:8001`

### Start Node.js Backend
```bash
cd backend
npm start
```

The backend will start on `http://localhost:5000`

### Start React Frontend
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the AI Service

### Health Check
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "ocr_available": true,
  "gemini_configured": true
}
```

### Test Book Cover Scanning
You can test the AI service directly using curl or Postman:

```bash
curl -X POST http://localhost:8001/scan-book-cover \
  -F "file=@path/to/book-cover.jpg"
```

## Using the AI Scanner in BookCycle

1. Navigate to the Add Book page as a seller
2. Upload a book cover image using the existing image upload
3. Click "Scan Book Cover" button in the AI Scanner section
4. Wait for AI processing (typically 5-15 seconds)
5. Review the auto-filled information:
   - Title
   - Author
   - Category
   - Edition
   - Description
6. Edit any fields as needed
7. Submit the listing normally

## Troubleshooting

### AI Service Not Starting
- Ensure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 8001 is not already in use

### Gemini API Errors
- Verify your API key is correct in `.env`
- Check that you have available quota on your Gemini account
- Ensure you're using a supported Gemini model (gemini-1.5-flash)

### OCR Not Working
- EasyOCR requires additional model downloads on first run
- Ensure you have internet connection for initial model download
- Check that the image is clear and has readable text

### Backend Cannot Connect to AI Service
- Ensure AI service is running on port 8001
- Check `AI_SERVICE_URL` in backend `.env`
- Verify no firewall is blocking the connection

### Frontend Not Scanning
- Ensure you're logged in as a seller
- Check that you've uploaded an image first
- Verify browser console for errors
- Check that backend and AI service are both running

## Dependencies

### Python Dependencies (ai-service/requirements.txt)
- fastapi==0.104.1
- uvicorn==0.24.0
- python-multipart==0.0.6
- easyocr==1.7.1
- Pillow==10.1.0
- google-generativeai==0.3.2
- pydantic==2.5.0

### Node.js Dependencies (backend)
- axios (already in package.json)
- form-data (already in package.json)

## Security Notes

- Never commit `.env` files with real API keys
- Keep your Gemini API key secure
- The AI service runs locally and should not be exposed to the public internet without proper authentication
- Rate limiting is handled by Gemini API quotas

## Performance Considerations

- First OCR run downloads models (~200MB)
- Subsequent runs are faster
- AI processing typically takes 5-15 seconds per image
- Maximum image size: 10MB
- Supported formats: JPG, PNG, WEBP

## API Endpoints

### AI Service (Python)
- `GET /` - Service info
- `GET /health` - Health check
- `POST /scan-book-cover` - Scan book cover image

### Backend (Node.js)
- `POST /api/v1/ai/scan-book-cover` - Proxy to AI service (requires authentication)

## Support

For issues with:
- **EasyOCR**: Check [EasyOCR GitHub](https://github.com/JaidedAI/EasyOCR)
- **Gemini API**: Check [Google AI Studio](https://makersuite.google.com/)
- **BookCycle**: Check existing BookCycle documentation
