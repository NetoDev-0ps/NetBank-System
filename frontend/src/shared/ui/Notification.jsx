import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Componente visual para mensagens de sucesso/erro
function Notification({ message, type, onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-green-900/90 border-green-500 text-green-100",
    error: "bg-red-900/90 border-red-500 text-red-100",
    warning: "bg-yellow-900/90 border-yellow-500 text-yellow-100",
  };

  const icons = {
    success: <CheckCircle className="text-green-400" size={24} />,
    error: <XCircle className="text-red-400" size={24} />,
    warning: <AlertTriangle className="text-yellow-400" size={24} />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md animate-slide-in ${styles[type] || styles.success} min-w-[300px]`}
    >
      {icons[type] || icons.success}
      <div className="flex-1">
        <p className="text-sm font-bold">
          {type === "error" ? "Atenção" : "Sucesso"}
        </p>
        <p className="text-xs opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-2 font-bold opacity-50 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export default Notification;
