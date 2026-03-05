import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import api from "../../core/api/apiClient";
import { ensureCsrfToken } from "../../core/auth/csrf";
import { useAuth } from "../../core/contexts/AuthContext";
import HumanPuzzleCaptcha from "../../shared/ui/HumanPuzzleCaptcha";
import T from "../../shared/ui/Translate";
import WindSense from "../../shared/effects/WindFlowCanvas";

const mapManagerError = (error) => {
  const code = error.response?.data?.erro;

  switch (code) {
    case "CREDENCIAIS_GERENTE_INVALIDAS":
      return "Email ou senha de gerente invalidos.";
    case "GERENTE_INATIVO":
      return "Este gerente esta inativo.";
    case "TIPO_ACESSO_INVALIDO":
      return "Tipo de acesso invalido.";
    case "LOGIN_BLOQUEADO_TEMPORARIAMENTE":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "CAPTCHA_PROOF_AUSENTE":
    case "CAPTCHA_PROOF_INVALIDO":
    case "CAPTCHA_PROOF_REUTILIZADO":
    case "CAPTCHA_PROOF_IP_INVALIDO":
      return "Refaca a verificacao humana para continuar.";
    default:
      return (
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Nao foi possivel autenticar como gerente."
      );
  }
};

function ManagerLogin() {
  const navigate = useNavigate();
  const { loginManager, isManagerAuthenticated, isCustomerAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaState, setCaptchaState] = useState({ verified: false, proofToken: "" });
  const [captchaRefresh, setCaptchaRefresh] = useState(0);

  useEffect(() => {
    ensureCsrfToken().catch(() => {
      // token sera renovado automaticamente na proxima chamada
    });
  }, []);

  useEffect(() => {
    if (isManagerAuthenticated) {
      navigate("/painel", { replace: true });
      return;
    }

    if (isCustomerAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isManagerAuthenticated, isCustomerAuthenticated, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!captchaState.verified || !captchaState.proofToken) {
      setError("Conclua a verificacao humana para continuar.");
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

  return (
    <div className="nb-page flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <WindSense />
      </div>

      <div className="nb-shell max-w-5xl">
        <div className="grid overflow-hidden nb-card lg:grid-cols-[1fr,1.2fr]">
          <aside className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
            <div>
              <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-blue-100 hover:text-white">
                <ChevronLeft size={15} />
                <T>Inicio</T>
              </Link>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-100/80">
                <T>Acesso corporativo</T>
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight">
                <T>Painel de Gerencia NetBank</T>
              </h2>
              <p className="mt-4 text-sm text-blue-100/90">
                <T>Controle de clientes, status e operacoes com seguranca e rastreabilidade.</T>
              </p>
            </div>

            <div className="nb-card-soft !bg-white/10 !border-white/20 p-4 text-xs">
              <div className="flex items-center gap-2 font-black tracking-widest uppercase">
                <ShieldCheck size={14} />
                <T>Seguranca ativa</T>
              </div>
              <p className="mt-2 text-blue-100">
                <T>Sessao protegida por cookie HttpOnly e validacao no backend.</T>
              </p>
            </div>
          </aside>

          <section className="p-5 sm:p-8">
            <div className="mb-6 lg:hidden">
              <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                <ChevronLeft size={15} />
                <T>Inicio</T>
              </Link>
            </div>

            <header className="mb-6">
              <img src="/brand-logo-primary.png" alt="NetBank" className="h-10 mb-5" />
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                <T>Area do Gerente</T>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                <T>Entre com suas credenciais administrativas.</T>
              </p>
            </header>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="nb-label">
                  <T>E-mail</T>
                </label>
                <input
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
                <label className="nb-label">
                  <T>Senha</T>
                </label>
                <input
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
                className="nb-button-primary w-full"
              >
                {loading ? <T>Entrando...</T> : <T>Entrar como gerente</T>}
              </button>

              {error && (
                <div className="p-3 text-xs font-bold text-center text-rose-700 bg-rose-100 border border-rose-200 rounded-xl dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-900/40">
                  <T>{error}</T>
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ManagerLogin;

