import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
import { AbstractIntlMessages } from 'next-intl';

// Define the list of available locales for the application
export const locales = ['fa', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fa';

// Create shared pathnames for navigation
export const { Link, redirect, usePathname, useRouter } = 
  createSharedPathnamesNavigation({ locales });

// List of translation sections
const translationSections = [
  'common',
  'admin',
  'adminblog',
  'frontend',
  'blog',
  'courses',
  'metadata',
  'nav',
  'footer',
  'charters'
];

// Function to get translations by locale
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }
  
  try {
    // First check if we have separate files
    let messages: AbstractIntlMessages = {};
    
    // Try to load each section
    for (const section of translationSections) {
      try {
        // For filesystem, use section name with hyphen
        const fileSection = section === 'adminblog' ? 'adminblog' : section;
        
        // Try to import the file
        try {
          const sectionMessages = (await import(`./messages/${locale}/${fileSection}.json`)).default;
          
          // Handle the 'frontend' section specially - extract the top-level keys and merge them directly
          if (section === 'frontend') {
            // This lets us access frontend.home.xyz as just home.xyz
            messages = { ...messages, ...sectionMessages };
          } else {
            // For other sections, keep them under their respective namespace
            messages = { ...messages, [section]: sectionMessages };
          }
          
        } catch (importError) {
          console.warn(`Could not load translation section '${section}' for locale '${locale}'. Using fallback.`, importError);
          
          // If we can't load the file for the current locale, try the default locale
          if (locale !== defaultLocale) {
            try {
              const defaultMessages = (await import(`./messages/${defaultLocale}/${fileSection}.json`)).default;
              
              if (section === 'frontend') {
                // This lets us access frontend.home.xyz as just home.xyz
                messages = { ...messages, ...defaultMessages };
              } else {
                // For other sections, keep them under their respective namespace
                messages = { ...messages, [section]: defaultMessages };
              }
              
              console.log(`Using default locale (${defaultLocale}) for section '${section}'`);
            } catch (error) {
              // If we can't load the default locale either, use an empty object
              console.warn(`Could not load default translation for section '${section}'. Using empty object.`, error);
              messages = { ...messages, [section]: {} };
            }
          } else {
            // If we're already using the default locale, use an empty object
            messages = { ...messages, [section]: {} };
          }
        }
      } catch (e) {
        console.warn(`Error processing section '${section}' for locale '${locale}'.`, e);
        messages = { ...messages, [section]: {} };
      }
    }
    
    // If we have no sections loaded, try the legacy full file
    if (Object.keys(messages).length === 0) {
      console.log(`Loading legacy translation file for locale '${locale}'`);
      try {
        messages = (await import(`./messages/${locale}.json`)).default;
      } catch (legacyError) {
        console.warn(`Could not load legacy translation file for locale '${locale}'.`, legacyError);
        // Try default locale as a last resort
        messages = (await import(`./messages/${defaultLocale}.json`)).default;
      }
    }
    
    console.log(`Loaded translations for locale '${locale}'`);
    
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to load translations for locale '${locale}':`, error);
    // In case of error, load at least the default locale
    const messages = (await import(`./messages/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages,
    };
  }
}); 