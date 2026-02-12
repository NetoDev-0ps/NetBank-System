import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";

const LoginGerente = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulação de delay de rede para UX
    setTimeout(() => {
      // LÓGICA DE ACESSO ADMINISTRATIVO (Hardcoded para teste)
      // Em produção, isso seria uma chamada api.post("/auth/admin")
      if (email === "admin@netbank.com.br" && senha === "admin123") {
        localStorage.setItem("token", "logado-como-gerente"); // Token esperado pelo App.jsx
        localStorage.setItem("usuario-nome", "Carlos Gerente");
        localStorage.setItem("usuario-email", email);
        navigate("/painel");
      } else {
        setError("Credenciais administrativas inválidas.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-blue-100 bg-slate-950">
      {/* Background Abstract Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 overflow-hidden border shadow-2xl bg-slate-900/60 border-slate-800 rounded-3xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 border rounded-2xl bg-slate-800/50 border-slate-700">
            <ShieldCheck size={32} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-sm text-slate-400">NetBank Manager</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail
                className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@netbank.com.br"
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
                placeholder="admin123"
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
              "Verificando..."
            ) : (
              <>
                Acessar Sistema <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Esta área é monitorada. Acesso não autorizado é crime.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginGerente;
