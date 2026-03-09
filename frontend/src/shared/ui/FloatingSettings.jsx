import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings2, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

function FloatingSettings() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 z-[9999] flex flex-col-reverse items-center gap-3 sm:bottom-7 sm:right-7">
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((prev) => !prev)}
        className="nb-btn-ghost !w-12 !h-12 !rounded-full !p-0"
        title="Preferencias"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-brand-primary dark:text-brand-accent"
        >
          {open ? <X size={20} /> : <Settings2 size={20} />}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <LanguageToggle />
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FloatingSettings;