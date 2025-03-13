import { NextRequest, NextResponse } from 'next/server';

// Mock translations database for common German-Persian words
// Used as fallback when API calls fail or for offline development
const mockTranslations: Record<string, Record<string, string>> = {
  'de-fa': {
    'hallo': 'سلام',
    'guten morgen': 'صبح بخیر',
    'guten tag': 'روز بخیر',
    'guten abend': 'عصر بخیر',
    'danke': 'متشکرم',
    'bitte': 'خواهش می‌کنم',
    'ja': 'بله',
    'nein': 'نه',
    'wie geht es dir': 'حال شما چطور است',
    'ich liebe dich': 'دوستت دارم',
    'entschuldigung': 'ببخشید',
    'wasser': 'آب',
    'essen': 'غذا',
    'schlafen': 'خوابیدن',
    'sprechen': 'صحبت کردن',
    'lernen': 'یاد گرفتن',
    'schreiben': 'نوشتن',
    'lesen': 'خواندن',
    'verstehen': 'فهمیدن',
    'arbeiten': 'کار کردن',
  },
  'fa-de': {
    'سلام': 'hallo',
    'صبح بخیر': 'guten morgen',
    'روز بخیر': 'guten tag',
    'عصر بخیر': 'guten abend',
    'متشکرم': 'danke',
    'خواهش می‌کنم': 'bitte',
    'بله': 'ja',
    'نه': 'nein',
    'حال شما چطور است': 'wie geht es dir',
    'دوستت دارم': 'ich liebe dich',
    'ببخشید': 'entschuldigung',
    'آب': 'wasser',
    'غذا': 'essen',
    'خوابیدن': 'schlafen',
    'صحبت کردن': 'sprechen',
    'یاد گرفتن': 'lernen',
    'نوشتن': 'schreiben',
    'خواندن': 'lesen',
    'فهمیدن': 'verstehen',
    'کار کردن': 'arbeiten',
  }
};

// Lingva instance URLs - we can choose from multiple public instances
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://lingva.pussthecat.org',
  'https://lingva.esmailelbob.xyz',
  'https://translate.plausibility.cloud'
];

// Function to translate using Lingva Translate API
async function translateWithLingva(text: string, sourceLang: string, targetLang: string) {
  // Format language codes for Lingva
  const sourceCode = formatLangCodeForLingva(sourceLang);
  const targetCode = formatLangCodeForLingva(targetLang);
  
  // Try multiple Lingva instances in case one is down
  for (const baseUrl of LINGVA_INSTANCES) {
    try {
      console.log(`[API] Trying Lingva instance: ${baseUrl}`);
      
      const apiUrl = `${baseUrl}/api/v1/${sourceCode}/${targetCode}/${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl, { 
        signal: AbortSignal.timeout(5000),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Language Learning App)'
        }
      });
      
      if (!response.ok) {
        console.log(`[API] Lingva instance ${baseUrl} failed with status: ${response.status}`);
        continue; // Try the next instance
      }
      
      const data = await response.json();
      
      if (!data.translation) {
        throw new Error('No translation returned from API');
      }
      
      console.log(`[API] Successfully translated with Lingva (${baseUrl})`);
      return data.translation;
    } catch (error) {
      console.error(`[API] Lingva instance ${baseUrl} error:`, error);
      // Continue to the next instance on failure
    }
  }
  
  // If all instances failed, throw an error
  throw new Error('All Lingva instances failed');
}

// Helper function to format language codes for Lingva API
function formatLangCodeForLingva(langCode: string): string {
  const code = langCode.toLowerCase();
  
  // Map our language codes to Lingva's required format
  const codeMap: Record<string, string> = {
    'de': 'de',
    'fa': 'fa',
    'german': 'de',
    'persian': 'fa',
    'deutsch': 'de',
    'فارسی': 'fa'
  };
  
  return codeMap[code] || code;
}

export async function POST(request: NextRequest) {
  console.log('[API] Translation endpoint called');
  
  try {
    const { text, sourceLang, targetLang } = await request.json();
    
    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { message: 'Missing required parameters: text, sourceLang, targetLang' },
        { status: 400 }
      );
    }
    
    // Standardize language codes
    const sourceCode = sourceLang.toLowerCase();
    const targetCode = targetLang.toLowerCase();
    
    // Check if the text is in our mock database first (for common phrases and faster response)
    const langPair = `${sourceCode}-${targetCode}`;
    const textLower = text.toLowerCase();
    
    if (mockTranslations[langPair] && mockTranslations[langPair][textLower]) {
      console.log('[API] Using mock translation for:', text);
      return NextResponse.json({ 
        translatedText: mockTranslations[langPair][textLower],
        sourceLang: sourceCode,
        targetLang: targetCode,
        originalText: text,
        source: 'dictionary'
      });
    }
    
    // For actual translation, use Lingva Translate API
    try {
      console.log('[API] Attempting Lingva Translate for:', text);
      const translatedText = await translateWithLingva(text, sourceCode, targetCode);
      
      return NextResponse.json({ 
        translatedText,
        sourceLang: sourceCode,
        targetLang: targetCode,
        originalText: text,
        source: 'lingva'
      });
    } catch (lingvaError) {
      console.log('[API] Lingva translation failed:', lingvaError);
      
      // If Lingva fails, return a friendly error message
      return NextResponse.json({ 
        translatedText: `[Translation service unavailable - try again later or use common words like "hallo", "danke"]`,
        sourceLang: sourceCode,
        targetLang: targetCode,
        originalText: text,
        source: 'error'
      });
    }
  } catch (error) {
    console.error('[API] Translation error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
} 