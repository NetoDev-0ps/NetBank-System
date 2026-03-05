import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../core/contexts/LanguageProvider";

const LanguageToggle = () => {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    // Ciclo: PT -> EN -> ES -> PT
    const sequence = ["pt", "en", "es"];
    const next = sequence[(sequence.indexOf(locale) + 1) % sequence.length];
    setLocale(next);
  };

  // Imagens via FlagCDN (Rápido, Gratuito e Bonito)
  const flags = {
    pt: {
      img: "https://flagcdn.com/w80/br.png",
      label: "",
      alt: "Brasil",
    },
    en: {
      img: "https://flagcdn.com/w80/us.png",
      label: "",
      alt: "USA",
    },
    es: {
      img: "https://flagcdn.com/w80/es.png",
      label: "",
      alt: "España",
    },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="relative flex flex-col items-center justify-center overflow-hidden transition-colors border rounded-full shadow-2xl w-14 h-14 bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-white/10 backdrop-blur-xl group"
      title="Mudar idioma"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={locale} // A chave muda, forçando a animação de troca
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-0.5"
        >
          {/* A Imagem da Bandeira */}
          <img
            src={flags[locale].img}
            alt={flags[locale].alt}
            className="object-cover w-6 h-6 border rounded-full shadow-sm border-black/10 dark:border-white/10"
          />

          {/* A Sigla Pequena */}
          <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {flags[locale].label}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default LanguageToggle;
