import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, ExternalLink, ArrowLeft, Copy, RefreshCw, FileText } from 'lucide-react';

export default function Success() {
  const [result, setResult] = useState(null);
  const [slideUrl, setSlideUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get results from sessionStorage
    const resultData = sessionStorage.getItem('translationResult');
    const url = sessionStorage.getItem('slideUrl');
    
    if (!resultData || !url) {
      router.push('/');
      return;
    }

    setResult(JSON.parse(resultData));
    setSlideUrl(url);
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openSlide = () => {
    window.open(slideUrl, '_blank');
  };

  const startNewTranslation = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="p-4 w-[600px] max-w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Translation Completed!
          </h1>
          <p className="text-gray-600 mb-6">
            Your Google Slides presentation has been successfully translated
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Results Summary */}
          <div className="text-center mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {result.translatedSlides}
                </div>
                <div className="text-xs text-green-700">Slides Processed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {result.results?.reduce((total, slide) => total + (slide.translatedElements || 0), 0) || 0}
                </div>
                <div className="text-xs text-blue-700">Text Elements</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Open Translated Slide */}
            <button
              onClick={openSlide}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Translated Presentation</span>
            </button>

            {/* Copy URL */}
            <button
              onClick={() => copyToClipboard(slideUrl)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Presentation URL'}</span>
            </button>
          </div>

          {/* Translation Details */}
          {result.results && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3 text-sm">Translation Details</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {result.results.map((slide, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-700">
                        Slide {slide.slideIndex + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {slide.success ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600">
                            {slide.translatedElements}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-600">Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Success!</strong> Your presentation has been translated while preserving all formatting. 
            Original layout and design remain intact.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between text-sm">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={startNewTranslation}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Translate Another</span>
          </button>
        </div>

      </div>
    </div>
  );
}
