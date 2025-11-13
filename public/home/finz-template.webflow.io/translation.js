// Add this script to your HTML file
// Either create: public/html-folder/translation.js
// OR paste directly in your HTML between <script></script> tags

(function() {
  let currentLanguage = 'en';
  const originalTexts = new Map();

  // Listen for language change messages from parent Next.js app
  window.addEventListener('message', function(event) {
    if (event.data.type === 'CHANGE_LANGUAGE') {
      const targetLang = event.data.language;
      translateHTMLPage(targetLang);
    }
  });

  // Load saved language on page load
  window.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    if (savedLang !== 'en') {
      translateHTMLPage(savedLang);
    }
  });

  async function translateHTMLPage(targetLang) {
    if (targetLang === 'en') {
      // Restore original texts
      originalTexts.forEach((originalText, element) => {
        element.textContent = originalText;
      });
      currentLanguage = 'en';
      return;
    }

    // Get all elements to translate
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, label, li, td, th');
    const textsToTranslate = [];
    const elementsArray = [];

    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 0 && !el.querySelector('svg') && !el.querySelector('img')) {
        // Store original text if not already stored
        if (!originalTexts.has(el)) {
          originalTexts.set(el, text);
        }
        textsToTranslate.push(originalTexts.get(el));
        elementsArray.push(el);
      }
    });

    // Translate in batches
    const batchSize = 50;
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      const batch = textsToTranslate.slice(i, i + batchSize);
      
      try {
        const translations = await translateBatch(batch, targetLang);
        
        // Apply translations
        translations.forEach((translation, index) => {
          const element = elementsArray[i + index];
          if (element && translation) {
            element.textContent = translation;
          }
        });
      } catch (error) {
        console.error('Translation error:', error);
      }
    }

    currentLanguage = targetLang;
  }

  async function translateBatch(texts, targetLang) {
    try {
      // Use LibreTranslate API
      const translations = await Promise.all(
        texts.map(async (text) => {
          const response = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: text,
              source: 'en',
              target: targetLang,
              format: 'text'
            })
          });

          const data = await response.json();
          return data.translatedText || text;
        })
      );

      return translations;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }
})();