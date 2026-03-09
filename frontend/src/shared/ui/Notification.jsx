import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import T from "./Translate";

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

  const title = type === "error" ? "Atenção" : type === "warning" ? "Aviso" : "Sucesso";

  return (
    <div
      className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${styles[type] || styles.success}`}
      role="status"
      aria-live="polite"
    >
      {icons[type] || icons.success}
      <div className="flex-1">
        <p className="text-xs font-black uppercase tracking-widest">
          <T>{title}</T>
        </p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="nb-button-ghost !p-1.5"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default Notification;
