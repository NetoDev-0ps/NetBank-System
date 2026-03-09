import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import T from "../ui/Translate";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = "Confirmar",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="nb-card relative w-full max-w-md overflow-hidden p-6"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="nb-button-ghost absolute right-4 top-4 !p-2"
              aria-label="Fechar modal"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description || message}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="nb-button-ghost w-full disabled:cursor-not-allowed disabled:opacity-55"
              >
                <T>Cancelar</T>
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="nb-button-danger w-full disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isLoading ? (
                  <T>Processando...</T>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
