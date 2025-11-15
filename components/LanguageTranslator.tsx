// components/LanguageTranslator.tsx
"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LanguageTranslator() {
  const pathname = usePathname();

  useEffect(() => {
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
  }, []);

  // Re-translate when route changes
  useEffect(() => {
    if (!(window as unknown as Record<string, unknown>).googleTranslateInitialized) return;

    console.log('🔄 Route changed to:', pathname);

    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select && select.value && select.value !== 'en') {
        console.log('🌍 Re-applying translation:', select.value);
        const currentLang = select.value;
        
        select.value = 'en';
        setTimeout(() => {
          select.value = currentLang;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, 100);
      }
    }, 500);
  }, [pathname]);

  return (
    <>
      <div 
        id="google_translate_element"
        className="fixed bottom-6 right-6 z-[9999]"
      />

      <style jsx global>{`
        /* Styled Container */
        #google_translate_element {
          background: white;
          padding: 20px 30px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 90px;
          max-width: 140px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        #google_translate_element:hover {
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }

        /* Hide default Google branding text */
        .goog-te-gadget {
          font-size: 0 !important;
          color: transparent !important;
          line-height: 0 !important;
        }

        .goog-te-gadget > span,
        .goog-te-gadget > span > a {
          display: none !important;
        }

        /* Style the dropdown */
        #google_translate_element select.goog-te-combo {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 16px 45px 16px 20px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
          cursor: pointer !important;
          outline: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          width: 100% !important;
          min-width: 200px !important;
          text-align: left !important;
          letter-spacing: 0.3px !important;
          
          /* Custom arrow */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 15px center !important;
          
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
          transition: all 0.3s ease !important;
        }

        #google_translate_element select.goog-te-combo:hover {
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6) !important;
          transform: translateY(-1px) !important;
        }

        #google_translate_element select.goog-te-combo:active {
          transform: translateY(0) !important;
        }

        /* Style dropdown options */
        #google_translate_element select.goog-te-combo option {
          background: white !important;
          color: #333 !important;
          padding: 12px !important;
          font-weight: 500 !important;
        }

        /* Hide Google logo */
        .goog-logo-link {
          display: none !important;
        }

        /* Hide banner at top */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }

        /* Hide floating balloon */
        .goog-te-balloon-frame {
          display: none !important;
        }

        /* Hide tooltip */
        #goog-gt-tt {
          display: none !important;
        }

        /* Hide spinner */
        .goog-te-spinner-pos {
          display: none !important;
        }

        /* Remove Google's body top padding */
        body {
          top: 0 !important;
          position: static !important;
        }

        /* Ensure smooth transitions */
        html.translated-ltr,
        html.translated-rtl {
          transition: none !important;
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          #google_translate_element {
            min-width: 100px;
            max-width: 250px;
            padding: 16px 20px;
            bottom: 20px;
            right: 20px;
          }

          #google_translate_element select.goog-te-combo {
            font-size: 14px !important;
            padding: 14px 40px 14px 16px !important;
            min-width: 180px !important;
          }
        }
      `}</style>
    </>
  );
}