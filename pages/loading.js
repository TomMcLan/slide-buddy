import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Globe, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('initializing');
  const [message, setMessage] = useState('Preparing translation...');
  const [error, setError] = useState('');
  const [slideUrl, setSlideUrl] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('2-3 minutes');
  const router = useRouter();

  useEffect(() => {
    // Get slide URL from sessionStorage
    const url = sessionStorage.getItem('slideUrl');
    if (!url) {
      router.push('/');
      return;
    }
    setSlideUrl(url);

    // Start translation process
    startTranslation(url);
  }, []);

  const startTranslation = async (url) => {
    try {
      setStatus('starting');
      setMessage('Connecting to Google Slides...');
      setProgress(10);

      const response = await axios.post('/api/translate', {
        slideUrl: url,
        targetLanguage: 'auto' // Auto-detect and translate to opposite language
      });

      if (response.data.success) {
        setProgress(100);
        setStatus('completed');
        setMessage('Translation completed successfully!');
        
        // Store results and redirect to success page
        sessionStorage.setItem('translationResult', JSON.stringify(response.data));
        
        setTimeout(() => {
          router.push('/success');
        }, 2000);
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.response?.data?.details || 'Translation failed. Please try again.');
      setStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Globe className="w-8 h-8 text-primary-600 animate-spin-slow" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="p-4 w-[600px] max-w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Translating Your Presentation
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we process your slides...
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Status Icon and Message */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h2 className={`text-lg font-medium mb-2 ${getStatusColor()}`}>
              {message}
            </h2>
            {!error && (
              <p className="text-sm text-gray-500">
                This typically takes {estimatedTime}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {!error && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">Translation Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Process Steps */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                progress >= 10 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={`text-sm ${progress >= 10 ? 'text-gray-900' : 'text-gray-500'}`}>
                Accessing Google Slides
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                progress >= 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm ${progress >= 30 ? 'text-gray-900' : 'text-gray-500'}`}>
                Extracting text from slides
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                progress >= 60 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${progress >= 60 ? 'text-gray-900' : 'text-gray-500'}`}>
                Translating content (English ↔ Chinese)
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                progress >= 90 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
              </div>
              <span className={`text-sm ${progress >= 90 ? 'text-gray-900' : 'text-gray-500'}`}>
                Updating slides with translations
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        {(error || status === 'completed') && (
          <div className="flex justify-center space-x-4 mb-6">
            {error && (
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            )}
            
            {status === 'completed' && (
              <button
                onClick={() => router.push('/success')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                View Results
              </button>
            )}
          </div>
        )}

        {/* Safe to Leave Notice */}
        {!error && status !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Safe to leave:</strong> You can close this page and return later. Translation continues in the background.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
