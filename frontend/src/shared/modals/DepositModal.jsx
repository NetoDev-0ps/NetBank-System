import { X, DollarSign } from "lucide-react";

function DepositModal({ isOpen, onClose, onConfirm, clienteNome }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = parseFloat(e.target.valor.value);
    onConfirm(valor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm p-6 border shadow-2xl bg-slate-900 border-blue-500/30 rounded-2xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute transition top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="mb-1 text-xl font-bold text-white">Realizar Depósito</h3>
        <p className="mb-6 text-xs text-blue-300/60">
          Adicionar saldo para:{" "}
          <span className="font-bold text-blue-200">{clienteNome}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-3.5 text-blue-500"
              size={18}
            />
            <input
              name="valor"
              type="number"
              step="0.01"
              min="1"
              autoFocus
              className="w-full p-3 pl-10 text-white transition border outline-none bg-slate-950 border-blue-900/50 rounded-xl focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-bold text-white transition bg-blue-600 shadow-lg hover:bg-blue-500 rounded-xl shadow-blue-900/20"
          >
            Confirmar Depósito
          </button>
        </form>
      </div>
    </div>
  );
}

export default DepositModal;
