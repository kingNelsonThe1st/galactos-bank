// components/LanguageTranslator.tsx
"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LanguageTranslator() {
  const pathname = usePathname(); // Detect route changes

  useEffect(() => {
    // Only initialize once globally
    if ((window as unknown as Record<string, unknown>).googleTranslateInitialized) {
      console.log('✅ Translator already initialized');
      return;
    }

    console.log('🔄 Initializing translator...');

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    (window as unknown as Record<string, unknown>).googleTranslateElementInit = () => {
      const google = (window as unknown as Record<string, unknown>).google as Record<string, unknown>;
      const translate = google?.translate as Record<string, unknown>;
      const TranslateElement = translate?.TranslateElement as {
        new (config: unknown, elementId: string): unknown;
        InlineLayout: { SIMPLE: number };
      };

      if (TranslateElement) {
        new TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,zh-CN,ar,pt,ja,ko,ru,hi,it',
          layout: TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        }, 'google_translate_element');

        (window as unknown as Record<string, unknown>).googleTranslateInitialized = true;
        console.log('✅ Translator initialized');
      }
    };
  }, []); // Only run once on mount

  // Re-translate when route changes
  useEffect(() => {
    if (!(window as unknown as Record<string, unknown>).googleTranslateInitialized) return;

    console.log('🔄 Route changed to:', pathname);

    // Wait for new content to load, then re-apply translation
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select && select.value && select.value !== 'en') {
        console.log('🌍 Re-applying translation:', select.value);
        const currentLang = select.value;
        
        // Trigger translation on new content
        select.value = 'en'; // Reset
        setTimeout(() => {
          select.value = currentLang;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, 100);
      }
    }, 500);
  }, [pathname]); // Run when route changes

  return (
    <>
      <div 
        id="google_translate_element"
        className="fixed bottom-6 right-6 z-[9999]"
      />

      <style jsx global>{`
        /* Style the Google Translate widget */
        #google_translate_element {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        #google_translate_element:hover {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        #google_translate_element select.goog-te-combo {
          background: white !important;
          border: none !important;
          border-radius: 20px !important;
          padding: 8px 35px 8px 15px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #333 !important;
          cursor: pointer !important;
          outline: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 10px center !important;
        }

        #google_translate_element select.goog-te-combo:hover {
          background-color: #f0f0f0 !important;
        }

        /* Hide Google branding */
        .goog-te-gadget {
          font-size: 0 !important;
          color: transparent !important;
        }

        .goog-te-gadget > span,
        .goog-te-gadget > span > a,
        .goog-logo-link {
          display: none !important;
        }

        /* Hide the banner and overlays */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-balloon-frame,
        #goog-gt-tt,
        .goog-te-spinner-pos {
          display: none !important;
        }

        body {
          top: 0 !important;
        }

        /* Smooth translation transitions */
        * {
          transition: none !important;
        }

        html.translated-ltr,
        html.translated-rtl {
          transition: none !important;
        }
      `}</style>
    </>
  );
}