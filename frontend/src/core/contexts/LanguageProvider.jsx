import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Estado inicial: Busca do localStorage ou define PT
  const [locale, setLocale] = useState(
    () => localStorage.getItem("netbank-locale") || "pt",
  );

  useEffect(() => {
    localStorage.setItem("netbank-locale", locale);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
