import { google } from 'googleapis';
const { Translate } = require('@google-cloud/translate').v2;

// Google Slides Translation API
// Inspired by: https://github.com/chrisaharden/google_slides_ai_translator by Chris Harden
// This implementation uses centralized service account credentials for seamless user experience

// Initialize Google APIs with centralized credentials
// These are YOUR API credentials - users don't need to set up anything
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
  scopes: [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive'
  ]
});

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}')
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slideUrl, targetLanguage = 'auto' } = req.body;
    
    // Extract presentation ID from URL
    const presentationId = extractPresentationId(slideUrl);
    
    if (!presentationId) {
      return res.status(400).json({ 
        error: 'Invalid Google Slides URL',
        message: 'Please provide a valid Google Slides presentation URL'
      });
    }

    // Validate that the presentation is accessible
    await validatePresentationAccess(presentationId);

    // Start translation process using our centralized API
    const result = await translatePresentation(presentationId, targetLanguage);
    
    res.json({
      success: true,
      presentationId,
      translatedSlides: result.length,
      results: result,
      message: 'Translation completed successfully - no API setup required!'
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Translation failed. Please try again.';
    
    if (error.message.includes('permission')) {
      userMessage = 'Cannot access presentation. Please ensure it\'s set to "Anyone with the link can edit".';
    } else if (error.message.includes('not found')) {
      userMessage = 'Presentation not found. Please check the URL and try again.';
    } else if (error.message.includes('quota')) {
      userMessage = 'Service temporarily unavailable due to high demand. Please try again in a few minutes.';
    }
    
    res.status(500).json({ 
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Validate that we can access the presentation
async function validatePresentationAccess(presentationId) {
  try {
    const slides = google.slides({ version: 'v1', auth });
    await slides.presentations.get({
      presentationId: presentationId
    });
  } catch (error) {
    if (error.code === 404) {
      throw new Error('Presentation not found. Please check the URL.');
    } else if (error.code === 403) {
      throw new Error('Permission denied. Please set the presentation to "Anyone with the link can edit".');
    }
    throw error;
  }
}

async function translatePresentation(presentationId, targetLanguage) {
  try {
    const slides = google.slides({ version: 'v1', auth });
    
    // Get presentation data
    const presentation = await slides.presentations.get({
      presentationId: presentationId
    });

    const slidePages = presentation.data.slides;
    console.log(`Processing ${slidePages.length} slides in parallel using centralized API...`);

    // Process all slides concurrently - NO LIMITS!
    const translationPromises = slidePages.map((slide, index) => 
      processSlideInParallel(slides, presentationId, slide, targetLanguage, index)
    );

    // Wait for all slides to complete
    const results = await Promise.all(translationPromises);
    
    console.log(`Successfully processed ${results.length} slides with centralized API`);
    return results;

  } catch (error) {
    console.error('Parallel processing error:', error);
    throw error;
  }
}

async function processSlideInParallel(slidesService, presentationId, slide, targetLanguage, slideIndex) {
  try {
    console.log(`Processing slide ${slideIndex + 1}...`);
    
    // Extract all text elements from the slide
    const textElements = extractTextElements(slide);
    
    if (textElements.length === 0) {
      console.log(`Slide ${slideIndex + 1}: No text to translate`);
      return { slideIndex, translatedElements: 0, success: true };
    }

    // Translate all text elements in parallel
    const translationPromises = textElements.map(async (element) => {
      const originalText = element.text;
      
      // Detect source language and translate
      const detectedLang = await detectLanguage(originalText);
      const translatedText = await translateText(originalText, detectedLang, targetLanguage);
      
      return {
        objectId: element.objectId,
        originalText,
        translatedText,
        startIndex: element.startIndex,
        endIndex: element.endIndex
      };
    });

    const translatedElements = await Promise.all(translationPromises);

    // Update slide with all translated text
    await updateSlideText(slidesService, presentationId, slide.objectId, translatedElements);
    
    console.log(`Slide ${slideIndex + 1}: Translated ${translatedElements.length} text elements`);
    
    return {
      slideIndex,
      translatedElements: translatedElements.length,
      success: true
    };

  } catch (error) {
    console.error(`Error processing slide ${slideIndex + 1}:`, error);
    return {
      slideIndex,
      error: error.message,
      success: false
    };
  }
}

function extractTextElements(slide) {
  const textElements = [];
  
  if (!slide.pageElements) return textElements;

  slide.pageElements.forEach(element => {
    if (element.shape && element.shape.text && element.shape.text.textElements) {
      element.shape.text.textElements.forEach((textElement, index) => {
        if (textElement.textRun && textElement.textRun.content.trim()) {
          textElements.push({
            objectId: element.objectId,
            text: textElement.textRun.content.trim(),
            startIndex: textElement.startIndex,
            endIndex: textElement.endIndex
          });
        }
      });
    }
    
    // Handle tables
    if (element.table && element.table.tableRows) {
      element.table.tableRows.forEach((row, rowIndex) => {
        row.tableCells.forEach((cell, cellIndex) => {
          if (cell.text && cell.text.textElements) {
            cell.text.textElements.forEach((textElement) => {
              if (textElement.textRun && textElement.textRun.content.trim()) {
                textElements.push({
                  objectId: element.objectId,
                  text: textElement.textRun.content.trim(),
                  startIndex: textElement.startIndex,
                  endIndex: textElement.endIndex,
                  isTable: true,
                  rowIndex,
                  cellIndex
                });
              }
            });
          }
        });
      });
    }
  });

  return textElements;
}

async function updateSlideText(slidesService, presentationId, slideObjectId, translatedElements) {
  const requests = translatedElements.map(element => ({
    replaceAllText: {
      containsText: {
        text: element.originalText,
        matchCase: true
      },
      replaceText: element.translatedText,
      pageObjectIds: [slideObjectId]
    }
  }));

  if (requests.length > 0) {
    await slidesService.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests
      }
    });
  }
}

async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    // Handle English ↔ Chinese translation
    let targetLang;
    
    if (targetLanguage === 'auto') {
      // Auto-detect and translate to opposite language
      if (sourceLanguage === 'en') {
        targetLang = 'zh-CN';
      } else if (sourceLanguage.startsWith('zh')) {
        targetLang = 'en';
      } else {
        targetLang = 'en'; // Default to English
      }
    } else {
      targetLang = targetLanguage;
    }
    
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLang
    });

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

async function detectLanguage(text) {
  try {
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

function extractPresentationId(url) {
  const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}
