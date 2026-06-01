import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('jn_lang') || 'en');
  
  const toggleLang = (l) => { 
    setLang(l); 
    localStorage.setItem('jn_lang', l); 
  };
  
  const t = (key) => translations[lang][key] || key;

  // Sync Tamil mode font class
  useEffect(() => {
    if (lang === 'ta') {
      document.body.classList.add('tamil-mode');
    } else {
      document.body.classList.remove('tamil-mode');
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
