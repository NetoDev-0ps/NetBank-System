import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../core/contexts/LanguageProvider";

const FLAGS = {
  pt: { img: "https://flagcdn.com/w80/br.png", alt: "Brasil", label: "PT" },
  en: { img: "https://flagcdn.com/w80/us.png", alt: "United States", label: "EN" },
  es: { img: "https://flagcdn.com/w80/es.png", alt: "Espana", label: "ES" },
};

function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    const cycle = ["pt", "en", "es"];
    const next = cycle[(cycle.indexOf(locale) + 1) % cycle.length];
    setLocale(next);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      className="nb-btn-ghost !w-12 !h-12 !rounded-full !p-0"
      title="Trocar idioma"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={locale}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex flex-col items-center gap-0.5"
        >
          <img
            src={FLAGS[locale].img}
            alt={FLAGS[locale].alt}
            className="h-5 w-5 rounded-full border border-white/20 object-cover"
          />
          <span className="text-[9px] font-black tracking-widest text-slate-500 dark:text-slate-300">
            {FLAGS[locale].label}
          </span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default LanguageToggle;