import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowRight,
  CreditCard,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import api from "../../core/api/apiClient";

const LoginCliente = () => {
  const navigate = useNavigate();

  // Estados de Controle de Fluxo
  const [passo, setPasso] = useState(1); // 1: CPF, 2: Email, 3: Senha, 4: Sincronizando
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados dos Dados
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Máscara de CPF automática (UX)
  // Validação de transição entre cards
  const validarEProsseguir = () => {
    setError("");
    if (passo === 1) {
      if (cpf.length < 14)
        return setError("Informe um CPF válido para continuar.");
      setPasso(2);
    } else if (passo === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return setError("Formato de e-mail inválido.");
      setPasso(3);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Chamada para o Back-end Java
      const response = await api.post("/usuarios/login", { email, senha });
      const usuarioLogado = response.data;

      // Validação de Status (Regra de Negócio)
      if (usuarioLogado.status !== "ACEITO") {
        setError("Sua conta ainda está em análise. Procure o gerente.");
        setLoading(false);
        setPasso(1); // Retorna ao início para segurança
        return;
      }

      // Persistência de Sessão
      localStorage.setItem("cliente_dados", JSON.stringify(usuarioLogado));
      localStorage.setItem("cliente_token", "active_session_token");

      // Gatilho da Tela de Sincronização Final
      setPasso(4);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      const msg =
        err.response?.data?.erro || "Senha incorreta ou usuário inexistente.";
      setError(msg);
      setLoading(false);
    }
  };

  // Configurações de Animação (Motion Variants)
  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // RENDERIZAÇÃO DA TELA DE LOADING FINAL
  if (passo === 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen transition-colors duration-500 bg-[#BFCEF5] dark:bg-slate-950 text-slate-800 dark:text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 rounded-full border-blue-500/20 border-t-blue-500 animate-spin" />
            <Lock
              className="absolute text-blue-500 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              size={24}
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Criptografando conexão...
          </h2>
          <p className="mt-2 text-sm text-blue-900/70 dark:text-slate-400">
            Acessando ambiente seguro NetBank.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleCpfChange = (e) => {
    let value = e.target.value;

    // 1. Remove tudo que não for número (evita letras e símbolos)
    value = value.replaceAll(/\D/g, "");

    // 2. Aplica a máscara progressivamente conforme o tamanho
    value = value.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca o primeiro ponto
    value = value.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca o segundo ponto
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca o hífen

    // 3. Atualiza o estado (limitando a 14 caracteres: 000.000.000-00)
    if (value.length <= 14) {
      setCpf(value);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans transition-colors duration-500 bg-[#BFCEF5] dark:bg-slate-950 text-slate-800 dark:text-blue-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        layout
        className="relative w-full max-w-md p-8 overflow-hidden border shadow-2xl bg-white/40 dark:bg-slate-900/60 border-blue-900/10 dark:border-slate-800 rounded-3xl backdrop-blur-xl"
      >
        <header className="mb-8 text-center">
          <img src="/logo02.png" alt="NetBank" className="h-12 mx-auto mb-6" />

          {/* Barra de Progresso Visual */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-10 rounded-full transition-all duration-500 ${passo >= s ? "bg-blue-600 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-blue-900/10 dark:bg-slate-800"}`}
              />
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* PASSO 1: CPF */}
          {passo === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Seja bem-vindo</h2>
                <p className="text-sm text-blue-900/70 dark:text-slate-400">
                  Informe seu CPF para começar o acesso.
                </p>
              </div>
              <div className="relative group">
                <CreditCard
                  className="absolute left-4 top-3.5 text-blue-900/40 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition"
                  size={20}
                />
                <input
                  type="text"
                  value={cpf} // O estado que armazena o valor formatado
                  onChange={handleCpfChange} // A função que acabamos de criar
                  placeholder="000.000.000-00"
                  maxLength="14" // Segurança extra para não passar do tamanho
                  className="w-full p-3.5 pl-12 bg-white/50 dark:bg-slate-950/50 border border-blue-900/20 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white placeholder-blue-900/40 dark:placeholder-slate-500 focus:border-blue-500 transition"
                />
              </div>
              <button
                onClick={validarEProsseguir}
                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-500"
              >
                Próximo <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* PASSO 2: EMAIL */}
          {passo === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <button
                onClick={() => setPasso(1)}
                className="flex items-center gap-2 text-xs font-bold transition text-blue-900/60 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-400"
              >
                <ArrowLeft size={14} /> VOLTAR AO CPF
              </button>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Confirme seu e-mail
                </h2>
                <p className="text-sm text-blue-900/70 dark:text-slate-400">
                  Utilize o e-mail cadastrado na sua conta.
                </p>
              </div>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-3.5 text-blue-900/40 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full p-3.5 pl-12 bg-white/50 dark:bg-slate-950/50 border border-blue-900/20 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white placeholder-blue-900/40 dark:placeholder-slate-500 focus:border-blue-500 transition"
                />
              </div>
              <button
                onClick={validarEProsseguir}
                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-500"
              >
                Confirmar e-mail <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* PASSO 3: SENHA */}
          {passo === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <button
                onClick={() => setPasso(2)}
                className="flex items-center gap-2 text-xs font-bold transition text-blue-900/60 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-400"
              >
                <ArrowLeft size={14} /> VOLTAR AO E-MAIL
              </button>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Senha de acesso
                </h2>
                <p className="text-sm text-blue-900/70 dark:text-slate-400">
                  Insira sua senha de 6 ou mais dígitos.
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-3.5 text-blue-900/40 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition"
                    size={20}
                  />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3.5 pl-12 bg-white/50 dark:bg-slate-950/50 border border-blue-900/20 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white placeholder-blue-900/40 dark:placeholder-slate-500 focus:border-blue-500 transition"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-bold text-white transition rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:to-blue-600 disabled:opacity-50"
                >
                  {loading ? "Autenticando..." : "Entrar no NetBank"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 mt-4 text-xs font-bold text-center text-red-600 bg-red-100 border border-red-200 rounded-lg dark:text-red-300 dark:bg-red-900/20 dark:border-red-900/50"
          >
            {error}
          </motion.div>
        )}

        <footer className="mt-8 text-center">
          <Link
            to="/cadastro-cliente"
            className="text-sm transition text-blue-900/70 dark:text-slate-400 hover:text-blue-800 dark:hover:text-white"
          >
            Não tem conta?{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">Abra agora</span>
          </Link>
        </footer>
      </motion.div>
    </div>
  );
};

export default LoginCliente;