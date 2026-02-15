import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("netbank-theme");
    return saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("netbank-theme", theme);
  }, [theme]);

  return (
    <div className="fixed bottom-10 right-10 z-[9999]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center justify-center transition-all duration-500 bg-white border rounded-full shadow-2xl w-14 h-14 dark:bg-slate-900 border-slate-200 dark:border-white/10 backdrop-blur-xl"
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div key="moon" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              <Moon className="text-blue-500 fill-blue-500" size={24} />
            </motion.div>
          ) : (
            <motion.div key="sun" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              <Sun className="text-orange-500 fill-orange-500" size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ThemeToggle;