// Test endpoint to verify Google Cloud credentials
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test 1: Check if environment variables exist
    const envCheck = {
      GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
    };

    // Test 2: Try to parse the JSON credentials
    let credentialsValid = false;
    let projectId = null;
    let clientEmail = null;
    
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
      credentialsValid = !!(credentials.type && credentials.project_id && credentials.private_key);
      projectId = credentials.project_id;
      clientEmail = credentials.client_email;
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
    }

    // Test 3: Try to initialize Google Auth
    let authInitialized = false;
    let authError = null;
    
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
        scopes: [
          'https://www.googleapis.com/auth/presentations',
          'https://www.googleapis.com/auth/drive'
        ]
      });
      
      // Try to get an auth client
      const authClient = await auth.getClient();
      authInitialized = !!authClient;
    } catch (error) {
      authError = error.message;
    }

    // Test 4: Try to initialize Google Slides API
    let slidesApiInitialized = false;
    let slidesError = null;
    
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
        scopes: ['https://www.googleapis.com/auth/presentations']
      });
      
      const slides = google.slides({ version: 'v1', auth });
      slidesApiInitialized = !!slides;
    } catch (error) {
      slidesError = error.message;
    }

    res.json({
      success: true,
      tests: {
        environmentVariables: {
          status: Object.values(envCheck).every(Boolean) ? 'PASS' : 'FAIL',
          details: envCheck
        },
        credentialsParsing: {
          status: credentialsValid ? 'PASS' : 'FAIL',
          projectId,
          clientEmail,
          hasPrivateKey: credentialsValid
        },
        googleAuth: {
          status: authInitialized ? 'PASS' : 'FAIL',
          error: authError
        },
        slidesApi: {
          status: slidesApiInitialized ? 'PASS' : 'FAIL',
          error: slidesError
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Credentials test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
