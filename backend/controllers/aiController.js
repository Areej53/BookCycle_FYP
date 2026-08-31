const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Scan book cover using AI service
 * Receives base64 image, converts to file, sends to Python AI service
 */
const scanBookCover = async (req, res) => {
  try {
    const { image } = req.body;

    // Validate image input
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Image is required' 
      });
    }

    // Check if AI service is available
    try {
      const healthCheck = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
      if (!healthCheck.data.ocr_available || !healthCheck.data.gemini_configured) {
        return res.status(503).json({ 
          success: false, 
          msg: 'AI service is not properly configured. Please check service status.' 
        });
      }
    } catch (healthError) {
      console.error('AI service health check failed:', healthError.message);
      return res.status(503).json({ 
        success: false, 
        msg: 'AI service is unavailable. Please ensure the AI service is running.' 
      });
    }

    // Convert base64 to buffer
    let imageBuffer;
    try {
      if (image.startsWith('data:image')) {
        const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Invalid image format' 
          });
        }
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        // Assume it's already base64 without data URI prefix
        imageBuffer = Buffer.from(image, 'base64');
      }
    } catch (bufferError) {
      console.error('Image buffer conversion failed:', bufferError);
      return res.status(400).json({ 
        success: false, 
        msg: 'Failed to process image data' 
      });
    }

    // Validate image size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (imageBuffer.length > MAX_SIZE) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Image too large. Maximum size: 10MB' 
      });
    }

    if (imageBuffer.length === 0) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Empty image data' 
      });
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'book-cover.jpg',
      contentType: 'image/jpeg'
    });

    // Send to AI service
    console.log('Sending image to AI service...');
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/scan-book-cover`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000 // 60 second timeout for AI processing
      }
    );

    console.log('AI service response:', aiResponse.data);

    // Return AI service response
    return res.status(200).json(aiResponse.data);

  } catch (error) {
    console.error('AI scanning error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        success: false, 
        msg: 'AI service is not running. Please start the AI service.' 
      });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json({ 
        success: false, 
        msg: 'AI processing timed out. Please try again.' 
      });
    }

    if (error.response) {
      // Forward AI service error response
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({ 
      success: false, 
      msg: 'Failed to scan book cover. Please try again or enter details manually.' 
    });
  }
};

module.exports = { scanBookCover };
