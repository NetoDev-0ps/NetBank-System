import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";

// Importa os botões que já temos
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const FloatingSettings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Posição fixa no canto da tela. O 'flex-col-reverse' faz os botões subirem.
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse items-center gap-3 md:bottom-10 md:right-10">
      {/* BOTÃO PRINCIPAL (ENGRENAGEM / FECHAR) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center transition-colors border rounded-full shadow-2xl w-14 h-14 bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-white/10 backdrop-blur-xl"
        title="Configurações"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-blue-600 dark:text-blue-400"
        >
          {isOpen ? <X size={24} /> : <Settings size={24} />}
        </motion.div>
      </motion.button>

      {/* BOTÕES EXPANSÍVEIS (IDIOMA E TEMA) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2, staggerChildren: 0.1 }}
            className="flex flex-col gap-3"
          >
            <LanguageToggle />
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSettings;
