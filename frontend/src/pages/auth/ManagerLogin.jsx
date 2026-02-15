import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../../core/api/apiClient";

const LoginGerente = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/usuarios/login", { email, senha });
      const data = response.data; 
      
      console.log("DADOS RECEBIDOS DO JAVA:", data);

      // 1. VALIDAÇÃO DE CARGO (Antes de qualquer navegação)
      if (data.cargo !== "GERENTE" && data.cargo !== "ADMIN") {
        setError("Acesso negado. Credenciais sem privilégios administrativos.");
        setLoading(false);
        return;
      }

      // 2. PERSISTÊNCIA DE DADOS (Obrigatório vir antes do navigate)
      // Nota: Ajustamos o token para o que a sua RotaGerente espera no App.jsx
      localStorage.setItem("token", "logado-como-gerente"); 
      localStorage.setItem("usuario-nome", data.nome);
      localStorage.setItem("usuario-email", data.email);
      localStorage.setItem("usuario-cargo", data.cargo);

      // 3. NAVEGAÇÃO FINAL
      // Agora, quando o Painel carregar, o 'token' já estará lá.
      navigate("/painel");

    } catch (err) {
      const mensagemErro = err.response?.data?.message || err.response?.data?.erro || "Acesso negado. Credenciais inválidas.";
      setError(mensagemErro);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-blue-100 bg-slate-950">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 border shadow-2xl bg-slate-900/60 border-slate-800 rounded-3xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 border rounded-2xl bg-slate-800/50 border-slate-700">
            <ShieldCheck size={32} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-sm text-slate-400">NetBank Manager</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Campo de E-mail com Autocomplete */}
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition" size={20} />
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail administrativo"
                className="w-full p-3.5 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-slate-500"
                required
              />
            </div>

            {/* Campo de Senha com Atributos Anti-Leak */}
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition" size={20} />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full p-3.5 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 text-xs font-bold text-center text-red-300 border rounded-lg bg-red-900/20 border-red-900/50">
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
              loading ? "bg-slate-800 text-slate-500" : "bg-gradient-to-r from-blue-600 to-blue-700 text-white transform hover:scale-[1.01]"
            }`}
          >
            {loading ? "Autenticando..." : "Acessar Sistema"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginGerente;