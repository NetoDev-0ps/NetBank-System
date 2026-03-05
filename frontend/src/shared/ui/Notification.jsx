import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

function Notification({ message, type, onClose }) {
  if (!message) return null;

  const styles = {
    success:
      "bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-100",
    error:
      "bg-rose-50/95 border-rose-200 text-rose-900 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-100",
    warning:
      "bg-amber-50/95 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-100",
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
  };

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${styles[type] || styles.success}`}
    >
      {icons[type] || icons.success}
      <div className="flex-1">
        <p className="text-xs font-black uppercase tracking-widest">
          {type === "error" ? "Atencao" : type === "warning" ? "Aviso" : "Sucesso"}
        </p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Fechar notificacao">
        <X size={16} />
      </button>
    </div>
  );
}

export default Notification;
