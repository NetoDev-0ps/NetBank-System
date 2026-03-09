import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../core/contexts/ThemeProvider";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className="nb-btn-ghost !w-12 !h-12 !rounded-full !p-0"
      title="Alternar tema"
    >
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-blue-200"
          >
            <Moon size={20} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-amber-500"
          >
            <Sun size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default ThemeToggle;