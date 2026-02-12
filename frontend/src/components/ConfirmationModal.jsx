import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

// Modal Genérico de Confirmação (Padrão Senior)
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (Fundo Escuro) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Card do Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl"
          >
            {/* Faixa de Perigo no Topo */}
            <div className="w-full h-2 bg-red-600/80" />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 text-red-500 border rounded-full bg-red-900/20 shrink-0 border-red-900/30">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium transition rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition bg-red-600 rounded-lg shadow-lg hover:bg-red-700 shadow-red-900/20"
                >
                  {isLoading ? (
                    "Excluindo..."
                  ) : (
                    <>
                      <Trash2 size={16} /> Confirmar Exclusão
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Botão X no topo */}
            <button
              onClick={onClose}
              className="absolute transition top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
