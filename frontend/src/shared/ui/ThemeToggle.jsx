import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../core/contexts/ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    // REMOVIDO: <div className="fixed bottom-10 right-10...">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      // Adicionada a classe w-14 h-14 diretamente aqui
      className="flex items-center justify-center transition-colors border rounded-full shadow-2xl w-14 h-14 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 backdrop-blur-xl"
    >
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            <Moon className="text-blue-400 fill-blue-400" size={24} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            <Sun className="text-amber-500 fill-amber-500" size={24} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
    // REMOVIDO: </div>
  );
};

export default ThemeToggle;
