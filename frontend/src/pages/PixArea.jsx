import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
} from "lucide-react";

const mascaraCPF = (v) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");

function PixArea() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [chaveDestino, setChaveDestino] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dados = localStorage.getItem("cliente_dados");
    if (dados) {
      setUsuario(JSON.parse(dados));
    } else {
      navigate("/login-cliente");
    }
  }, [navigate]);

  const handlePix = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valorNum = parseFloat(valor);
      const dadosPix = {
        cpfRemetente: usuario.cpf,
        chaveDestino: chaveDestino.replace(/\D/g, ""), // Limpa pontos e traços para o Java
        valor: valorNum,
      };

      await api.post("/pix/transferir", dadosPix);

      // --- LOGICA DE ATUALIZAÇÃO SÍNCRONA DE SALDO ---
      const novoSaldo = usuario.saldo - valorNum;
      const novosDados = { ...usuario, saldo: novoSaldo };
      localStorage.setItem("cliente_dados", JSON.stringify(novosDados));

      alert(`✅ Pix de R$ ${valor} realizado com sucesso!`);
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data || "Erro ao processar Pix.";
      alert(`❌ Falha: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 font-sans text-white bg-slate-950">
      <div className="flex items-center justify-between w-full max-w-md mb-8">
        <Link
          to="/dashboard"
          className="p-2 text-blue-400 transition bg-slate-900 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Área Pix</h1>
        <div className="w-10"></div>
      </div>

      {/* ALTERADO: Adicionado motion.div para casar com as variantes e limpar erro */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md p-6 border shadow-xl bg-slate-900/60 border-slate-800 rounded-3xl backdrop-blur-sm"
      >
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-slate-400">Saldo Disponível</p>
          <h2 className="text-3xl font-bold text-white">
            R$ {usuario.saldo.toFixed(2)}
          </h2>
        </div>

        <form onSubmit={handlePix} className="space-y-6">
          <div>
            <label className="block mb-2 ml-1 text-xs font-bold text-blue-500 uppercase">
              Chave Pix (CPF)
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-4 text-slate-500"
                size={20}
              />
              <input
                value={chaveDestino}
                maxLength={14}
                onChange={(e) => setChaveDestino(mascaraCPF(e.target.value))} // ADICIONADO: Mascara de CPF
                className="w-full p-4 pl-12 text-white transition border outline-none bg-slate-950 border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 ml-1 text-xs font-bold text-blue-500 uppercase">
              Valor da Transferência
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-4 top-4 text-slate-500"
                size={20}
              />
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full p-4 pl-12 text-lg font-bold text-white transition border outline-none bg-slate-950 border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 text-white"}`}
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                Confirmar Transferência <CheckCircle size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      <div className="flex items-start max-w-md gap-3 p-4 mt-8 border bg-blue-900/10 border-blue-900/30 rounded-xl">
        <AlertCircle className="text-blue-400 shrink-0" size={20} />
        <p className="text-xs leading-relaxed text-blue-200/60">
          Transações Pix são instantâneas e não podem ser canceladas. Verifique
          a chave do destinatário antes de confirmar.
        </p>
      </div>
    </div>
  );
}

export default PixArea;
