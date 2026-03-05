import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../core/contexts/LanguageProvider";
import { translateText } from "../../core/services/translationService";
import { normalizeDisplayText } from "../../core/utils/textSanitizer";

const T = ({ children, className = "" }) => {
  const { locale } = useLanguage();
  const isText = typeof children === "string";
  const baseText = normalizeDisplayText(
    isText ? children : String(children ?? ""),
  );

  const [displayedText, setDisplayedText] = useState(baseText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTranslation = async () => {
      if (!isText) {
        setDisplayedText(baseText);
        return;
      }

      if (locale === "pt") {
        setDisplayedText(baseText);
        return;
      }

      setIsLoading(true);
      const translated = await translateText(baseText, locale);

      if (isMounted) {
        setDisplayedText(normalizeDisplayText(translated));
        setIsLoading(false);
      }
    };

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [locale, baseText, isText]);

  if (!isText) {
    return children;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${locale}-${baseText}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        className={`inline-block ${className} ${isLoading ? "animate-pulse opacity-70" : ""}`}
      >
        {displayedText}
      </motion.span>
    </AnimatePresence>
  );
};

export default T;
