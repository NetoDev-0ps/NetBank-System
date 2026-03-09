import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import api from "../../core/api/apiClient";
import { ensureCsrfToken } from "../../core/auth/csrf";
import { useAuth } from "../../core/contexts/AuthContext";
import HumanPuzzleCaptcha from "../../shared/ui/HumanPuzzleCaptcha";
import T from "../../shared/ui/Translate";

const mapManagerError = (error) => {
  const code = error.response?.data?.erro;

  switch (code) {
    case "CREDENCIAIS_GERENTE_INVALIDAS":
      return "E-mail ou senha de gerente inválidos.";
    case "GERENTE_INATIVO":
      return "Este gerente está inativo.";
    case "TIPO_ACESSO_INVALIDO":
      return "Tipo de acesso inválido.";
    case "LOGIN_BLOQUEADO_TEMPORARIAMENTE":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "CAPTCHA_PROOF_AUSENTE":
    case "CAPTCHA_PROOF_INVALIDO":
    case "CAPTCHA_PROOF_REUTILIZADO":
    case "CAPTCHA_PROOF_IP_INVALIDO":
      return "Refaça a verificação humana para continuar.";
    default:
      return (
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Não foi possível autenticar como gerente."
      );
  }
};

function ManagerLogin() {
  const navigate = useNavigate();
  const {
    loginManager,
    logout,
    customerUser,
    isManagerAuthenticated,
    isCustomerAuthenticated,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaState, setCaptchaState] = useState({ verified: false, proofToken: "" });
  const [captchaRefresh, setCaptchaRefresh] = useState(0);

  useEffect(() => {
    ensureCsrfToken().catch(() => {
      // token será renovado automaticamente na próxima chamada
    });
  }, []);

  useEffect(() => {
    if (isManagerAuthenticated) {
      navigate("/painel", { replace: true });
    }
  }, [isManagerAuthenticated, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!captchaState.verified || !captchaState.proofToken) {
      setError("Conclua a verificação humana para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          tipoAcesso: "GERENTE",
          email: email.trim(),
          senha,
        },
        {
          headers: {
            "X-Captcha-Proof": captchaState.proofToken,
          },
        },
      );

      const usuario = response.data?.usuario;
      const cargo = usuario?.cargo?.toUpperCase();

      if (cargo !== "GERENTE" && cargo !== "ADMIN") {
        setError("Acesso negado para este perfil.");
        setLoading(false);
        return;
      }

      loginManager(usuario);
      navigate("/painel", { replace: true });
    } catch (requestError) {
      setError(mapManagerError(requestError));
      setCaptchaRefresh((value) => value + 1);
    } finally {
      setLoading(false);
    }
  };

  if (isCustomerAuthenticated) {
    return (
      <div className="nb-page flex items-center justify-center p-4 sm:p-6">
        <div className="nb-shell max-w-xl">
          <div className="nb-panel">
            <p className="nb-eyebrow"><T>Sessão ativa detectada</T></p>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              <T>Você já está logado como cliente</T>
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {customerUser?.email || "cliente@netbank.com.br"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <T>Para entrar como gerente, finalize a sessão atual e continue.</T>
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="nb-button-ghost w-full"
                onClick={() => navigate("/dashboard", { replace: true })}
              >
                <T>Ir para dashboard cliente</T>
              </button>
              <button
                type="button"
                className="nb-button-primary w-full"
                onClick={() => logout("/login-gerente")}
              >
                <T>Trocar para gerente</T>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-page flex items-center justify-center p-4 sm:p-6">
      <div className="nb-shell max-w-6xl">
        <div className="nb-glass overflow-hidden">
          <div className="grid lg:grid-cols-[0.95fr,1.05fr]">
            <aside className="p-7 sm:p-8 lg:p-10 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-blue-100 hover:text-white">
                <ChevronLeft size={15} />
                <T>Início</T>
              </Link>

              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/85">
                <T>Acesso corporativo</T>
              </p>
              <h2 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-extrabold leading-tight text-white">
                <T>Painel de gerenciamento NetBank</T>
              </h2>
              <p className="mt-4 text-sm text-blue-100/90">
                <T>Ambiente para análise de clientes, aprovações, bloqueios e operações com rastreabilidade.</T>
              </p>

              <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-100">
                  <ShieldCheck size={14} />
                  <T>Segurança ativa</T>
                </div>
                <p className="mt-2 text-sm text-blue-100/90">
                  <T>Sessão protegida por cookie HttpOnly, CSRF e validação de perfil no backend.</T>
                </p>
              </div>

              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80"
                alt="Mesa com análise financeira"
                className="mt-8 h-52 w-full rounded-2xl object-cover border border-white/20"
              />
            </aside>

            <section className="p-6 sm:p-8 lg:p-10">
              <header className="mb-6">
                <img src="/brand-logo-primary.png" alt="NetBank" className="h-10 mb-5" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  <T>Área do gerente</T>
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <T>Use suas credenciais administrativas para continuar.</T>
                </p>
              </header>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="manager-email" className="nb-label">
                    <T>E-mail</T>
                  </label>
                  <input
                    id="manager-email"
                    name="managerEmail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@netbank.com.br"
                    className="nb-input mt-2"
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="manager-password" className="nb-label">
                    <T>Senha</T>
                  </label>
                  <input
                    id="manager-password"
                    name="managerPassword"
                    type="password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="********"
                    className="nb-input mt-2"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <HumanPuzzleCaptcha
                  onVerified={setCaptchaState}
                  refreshSignal={captchaRefresh}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading || !captchaState.verified || !captchaState.proofToken}
                  className="nb-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? <T>Entrando...</T> : <T>Entrar como gerente</T>}
                </button>

                {error && (
                  <div className="rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                    <T>{error}</T>
                  </div>
                )}

                <div className="pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Link to="/login-cliente" className="font-bold text-brand-primary hover:text-brand-secondary dark:text-brand-accent">
                    <T>Acesso de cliente</T>
                  </Link>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerLogin;
