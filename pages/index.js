import { useState } from 'react';
import { useRouter } from 'next/router';
import { Globe, CheckCircle, Zap, Shield, Clock } from 'lucide-react';
import { PromptInputBox } from '../components/ui/prompt-input-box';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSend = async (url) => {
    setIsLoading(true);

    try {
      // Store the URL in sessionStorage and navigate to loading page
      sessionStorage.setItem('slideUrl', url);
      router.push('/loading');
    } catch (err) {
      console.error('Navigation error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="p-4 w-[600px] max-w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Google Slides Translator
          </h1>
          <p className="text-gray-600 mb-6">
            Translate presentations between English and Chinese instantly
          </p>
        </div>

        {/* Main Input */}
        <div className="mb-6">
          <PromptInputBox 
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Paste your Google Slides URL here..."
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>Lightning fast</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="w-5 h-5 text-green-500" />
            <span>No setup required</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock className="w-5 h-5 text-purple-500" />
            <span>Preserves formatting</span>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Before you start:</strong> Set your Google Slides to "Anyone with the link can edit" 
            and create a backup copy. We'll handle the rest!
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          Powered by Google Slides API • No API keys required
        </div>
      </div>
    </div>
  );
}
