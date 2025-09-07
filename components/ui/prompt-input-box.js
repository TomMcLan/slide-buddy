import { useState } from 'react';
import { Send, Link, AlertCircle } from 'lucide-react';

export const PromptInputBox = ({ onSend, placeholder = "Paste your Google Slides URL here...", disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateGoogleSlidesUrl = (url) => {
    const regex = /^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/;
    return regex.test(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setIsValid(false);
      return;
    }

    if (!validateGoogleSlidesUrl(message.trim())) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
    onSend(message.trim());
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isValid && e.target.value.trim()) {
      setIsValid(true);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-white border-2 rounded-xl transition-all duration-200 ${
          isValid 
            ? 'border-gray-200 focus-within:border-blue-500 focus-within:shadow-lg' 
            : 'border-red-300 focus-within:border-red-500'
        }`}>
          {/* URL Icon */}
          <div className="pl-4 pr-2">
            <Link className={`w-5 h-5 ${isValid ? 'text-gray-400' : 'text-red-400'}`} />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-2 py-4 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="m-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {!isValid && (
          <div className="flex items-center space-x-2 mt-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Please enter a valid Google Slides URL</span>
          </div>
        )}
      </form>
    </div>
  );
};
