import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Wallet } from "lucide-react";

const LoginCliente = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulação de API (Delay de Rede)
    setTimeout(() => {
      // VALIDAÇÃO DE EXEMPLO (Pode usar qualquer email/senha para testar)
      if (email && senha) {
        // --- O PULO DO GATO (INTEGRAÇÃO COM APP.JSX) ---
        // Salvamos o token específico que a RotaCliente exige
        localStorage.setItem("cliente_token", "logado");

        // Salvamos dados do usuário para o Dashboard usar
        localStorage.setItem("usuario_nome", "Cliente NetBank");
        localStorage.setItem("usuario_saldo", "1250.00");

        // Redirecionamento para o Dashboard
        navigate("/dashboard");
      } else {
        setError("Preencha todos os campos.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-blue-100 bg-slate-950 selection:bg-blue-500/30">
      {/* Background Abstract Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 overflow-hidden border shadow-2xl bg-slate-900/60 border-slate-800 rounded-3xl backdrop-blur-xl"
      >
        {/* Header */}
       <div className="mb-8 text-center">
  <img 
    src="/logo02.png" 
    alt="NetBank" 
    className="object-contain h-16 mx-auto mb-6 drop-shadow-2xl" 
  />
  <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
  <p className="text-sm text-slate-400">Bem-vindo de volta ao futuro.</p>
</div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User
                className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full p-3.5 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-slate-500"
                required
              />
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition"
                size={20}
              />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full p-3.5 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 text-xs font-bold text-center text-red-300 border rounded-lg bg-red-900/20 border-red-900/50"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20 ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:to-blue-600 text-white transform hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              "Validando acesso..."
            ) : (
              <>
                Entrar na conta <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <Link
            to="/cadastro-cliente"
            className="block text-sm transition text-slate-400 hover:text-white"
          >
            Não tem conta?{" "}
            <span className="font-bold text-blue-400">Abra agora</span>
          </Link>
          <Link
            to="/"
            className="block text-xs transition text-slate-500 hover:text-slate-300"
          >
            Voltar para o início
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginCliente;
