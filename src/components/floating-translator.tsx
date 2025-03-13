'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLanguage, FaTimes, FaExchangeAlt, FaCopy, FaVolumeUp } from 'react-icons/fa';

export function FloatingTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState<'de' | 'fa'>('de');
  const [targetLang, setTargetLang] = useState<'de' | 'fa'>('fa');
  const [translationSource, setTranslationSource] = useState<string | null>(null);
  const [recentTranslations, setRecentTranslations] = useState<Array<{original: string, translated: string}>>([]);
  
  const translatorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Close the translator when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (translatorRef.current && !translatorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when translator opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Swap languages
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // Copy translation to clipboard
  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  };

  // Text-to-speech function
  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'de' ? 'de-DE' : 'fa-IR';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit translation
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setTranslationSource(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          targetLang,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Translation failed');
      }
      
      setTranslatedText(data.translatedText);
      setTranslationSource(data.source || null);
      
      // Save to recent translations
      setRecentTranslations(prev => {
        const newTranslations = [
          { original: inputText, translated: data.translatedText },
          ...prev.slice(0, 4) // Keep only the 5 most recent
        ];
        return newTranslations;
      });
    } catch (err) {
      setError((err as Error).message || 'Something went wrong');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-8 z-50" ref={translatorRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 sm:w-96 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {sourceLang === 'de' ? 'Deutsch → فارسی' : 'فارسی → Deutsch'}
                </h3>
                <button
                  onClick={handleSwapLanguages}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Swap languages"
                >
                  <FaExchangeAlt className="text-primary" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {sourceLang === 'de' ? 'Deutsch' : 'فارسی'}
                    </label>
                    {inputText && (
                      <button
                        onClick={() => handleSpeak(inputText, sourceLang)}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                        aria-label="Speak input text"
                      >
                        <FaVolumeUp />
                      </button>
                    )}
                  </div>
                  <textarea
                    ref={inputRef}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows={3}
                    placeholder={sourceLang === 'de' ? 'Text auf Deutsch eingeben...' : 'متن فارسی را وارد کنید...'}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    dir={sourceLang === 'fa' ? 'rtl' : 'ltr'}
                  />
                </div>
                
                {/* Translate Button */}
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary-darker'
                  }`}
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? 'Translating...' : 'Translate'}
                </button>
                
                {/* Translation Result */}
                {translatedText && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {targetLang === 'de' ? 'Deutsch' : 'فارسی'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSpeak(translatedText, targetLang)}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                          aria-label="Speak translated text"
                        >
                          <FaVolumeUp />
                        </button>
                        <button
                          onClick={handleCopyTranslation}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                          aria-label="Copy translation"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                    <p className={`text-gray-800 dark:text-gray-200 ${targetLang === 'fa' ? 'text-right' : 'text-left'}`} 
                       dir={targetLang === 'fa' ? 'rtl' : 'ltr'}>
                      {translatedText}
                    </p>
                    {translationSource && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                        <span>
                          {translationSource === 'dictionary' && 'From built-in dictionary'}
                          {translationSource === 'lingva' && 'Powered by Google Translate'}
                          {translationSource === 'error' && 'Translation service offline'}
                        </span>
                        {translationSource === 'error' && (
                          <span className="text-amber-500">Try common words like &ldquo;hallo&rdquo;, &ldquo;danke&rdquo;, &ldquo;bitte&rdquo;</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
                
                {/* Recent Translations */}
                {recentTranslations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Translations
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto text-sm">
                      {recentTranslations.map((item, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            setInputText(item.original);
                            setTranslatedText(item.translated);
                          }}
                        >
                          <div className="truncate">{item.original}</div>
                          <div className="truncate text-gray-600 dark:text-gray-400">{item.translated}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        aria-label="Toggle Translator"
        className={`p-4 rounded-full shadow-lg text-white ${
          isOpen ? 'bg-gray-600' : 'bg-yellow-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaLanguage className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
} 