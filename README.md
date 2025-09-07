# Google Slides Translator

A web application that translates Google Slides presentations between English and Chinese while preserving formatting and layout. **No API setup required for users!**

## Features

- ✅ **English ↔ Chinese Translation**: Auto-detects source language and translates to the opposite
- ✅ **Zero Setup for Users**: Just paste URL and go - we handle all API credentials
- ✅ **Parallel Processing**: Processes all slides simultaneously for maximum speed
- ✅ **No Size Limits**: Handle presentations of any size
- ✅ **Format Preservation**: Maintains original design, fonts, and layout
- ✅ **Real-time Progress**: Live updates during translation process
- ✅ **Modern UI**: Clean, responsive interface with three main views

## Architecture

### Frontend (Next.js + React)
- **Welcome Page**: URL input with validation
- **Loading Page**: Real-time progress tracking
- **Success Page**: Results summary and access to translated slides

### Backend (Vercel Serverless Functions)
- **Translation API**: Handles Google Slides API integration
- **Progress API**: Real-time status updates
- **Parallel Processing**: Concurrent slide processing

## Deployment

### For Service Owner (You)

You'll need to set up the centralized API credentials that serve all users:

#### 1. Google Cloud Project Setup
1. Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Google Slides API
   - Google Translate API

#### 2. Service Account (Centralized)
1. Go to IAM & Admin > Service Accounts
2. Create a new service account for the application
3. Download the JSON credentials file
4. Grant the following roles:
   - Cloud Translation API User
   - Service Account User

#### 3. Environment Variables (Server-Side Only)

Set these in your Vercel dashboard:

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id_here
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...} # Full JSON as string
```

**Important**: These credentials are used by your server to process all user requests. Users never see or need these credentials.

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GOOGLE_CLOUD_PROJECT_ID
   vercel env add GOOGLE_APPLICATION_CREDENTIALS
   ```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:3000
   ```

## Usage

**Super Simple - No API Setup Required!**

1. **Prepare your Google Slides**:
   - Set sharing to "Anyone with the link can edit"
   - Create a backup copy (recommended)

2. **Start translation**:
   - Paste your Google Slides URL
   - Click "Start Translation" 
   - **That's it!** We handle all the technical stuff

3. **Monitor progress**:
   - Watch real-time progress updates
   - Safe to close browser and return later

4. **Access results**:
   - View translation summary
   - Open translated presentation
   - Copy URL for sharing

**No Google Cloud setup, no API keys, no technical configuration needed!**

## API Endpoints

### POST `/api/translate`
Translates a Google Slides presentation.

**Request**:
```json
{
  "slideUrl": "https://docs.google.com/presentation/d/...",
  "targetLanguage": "auto"
}
```

**Response**:
```json
{
  "success": true,
  "presentationId": "abc123",
  "translatedSlides": 15,
  "results": [...],
  "message": "Translation completed successfully"
}
```

### GET `/api/progress/[jobId]`
Gets translation progress for a job.

**Response**:
```json
{
  "progress": 75,
  "status": "translating",
  "message": "Processing slide 12 of 16"
}
```

## Technical Details

### Parallel Processing Implementation
- Each slide is processed concurrently using `Promise.all()`
- Text elements within slides are also translated in parallel
- No artificial limits on presentation size

### Translation Logic
- Auto-detects source language (English or Chinese)
- Translates to opposite language automatically
- Preserves original formatting and positioning
- Handles tables, shapes, and text boxes

### Error Handling
- Graceful fallbacks for API failures
- Retry mechanisms for rate limiting
- Detailed error messages for debugging

## Limitations

- Requires "Anyone with the link can edit" permissions
- Cannot translate text embedded in images
- Complex animations may need manual review
- Rate limits apply based on Google Cloud quotas

## Support

For issues or questions:
1. Check the error messages in the UI
2. Verify your Google Cloud setup
3. Ensure proper API permissions
4. Review Vercel function logs

## Acknowledgments

This project was inspired by and references the excellent work from:
- [Google Slides AI Translator](https://github.com/chrisaharden/google_slides_ai_translator) by Chris Harden - Original Google Apps Script implementation for translating Google Slides using AI

## License

MIT License - see LICENSE file for details.
