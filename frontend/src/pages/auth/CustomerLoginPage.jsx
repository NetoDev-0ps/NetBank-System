import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Mail, ShieldAlert, UserRound } from "lucide-react";
import api from "../../core/api/apiClient";
import { ensureCsrfToken } from "../../core/auth/csrf";
import { useAuth } from "../../core/contexts/AuthContext";
import HumanPuzzleCaptcha from "../../shared/ui/HumanPuzzleCaptcha";
import WindSense from "../../shared/effects/WindFlowCanvas";
import T from "../../shared/ui/Translate";

const STATUS_BLOCK_MESSAGES = {
  STATUS_PENDENTE: {
    title: "Conta em analise",
    message:
      "Seu cadastro ainda esta em validacao pelo time de compliance. Tente novamente em alguns minutos.",
  },
  STATUS_RECUSADO: {
    title: "Cadastro recusado",
    message:
      "Seu cadastro foi recusado. Entre em contato com o suporte para revisar a situacao.",
  },
  STATUS_SUSPENSO: {
    title: "Conta suspensa",
    message:
      "Sua conta esta suspensa temporariamente. Procure o suporte para regularizacao.",
  },
  STATUS_BLOQUEADO: {
    title: "Conta bloqueada",
    message:
      "Sua conta foi bloqueada por seguranca. Fale com o suporte para investigacao.",
  },
};

const mapCustomerError = (error) => {
  const code = error.response?.data?.erro;

  if (STATUS_BLOCK_MESSAGES[code]) {
    return { type: "status", code };
  }

  switch (code) {
    case "CPF_OBRIGATORIO":
      return { type: "inline", message: "Informe o CPF para continuar." };
    case "EMAIL_OBRIGATORIO":
      return { type: "inline", message: "Informe o e-mail para continuar." };
    case "SENHA_OBRIGATORIA":
      return { type: "inline", message: "Informe a senha para continuar." };
    case "EMAIL_NAO_ENCONTRADO":
      return { type: "inline", message: "E-mail nao encontrado." };
    case "DADOS_DIVERGENTES":
      return {
        type: "inline",
        message: "CPF e e-mail nao pertencem ao mesmo titular.",
      };
    case "SENHA_INCORRETA":
      return { type: "inline", message: "Senha incorreta." };
    case "TIPO_ACESSO_INVALIDO":
      return { type: "inline", message: "Acesso invalido para este perfil." };
    case "LOGIN_BLOQUEADO_TEMPORARIAMENTE":
      return {
        type: "inline",
        message: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
      };
    case "CAPTCHA_PROOF_AUSENTE":
    case "CAPTCHA_PROOF_INVALIDO":
    case "CAPTCHA_PROOF_REUTILIZADO":
    case "CAPTCHA_PROOF_IP_INVALIDO":
      return { type: "inline", message: "Refaca a verificacao humana para continuar." };
    default:
      return {
        type: "inline",
        message:
          error.response?.data?.erro ||
          error.response?.data?.message ||
          "Nao foi possivel concluir o login.",
      };
  }
};

function CustomerLoginPage() {
  const navigate = useNavigate();
  const { loginCustomer, isCustomerAuthenticated, isManagerAuthenticated } = useAuth();

  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusBlock, setStatusBlock] = useState(null);
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
  }, [isCustomerAuthenticated, isManagerAuthenticated, navigate]);

  const onCpfChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");
    value = value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value.slice(0, 14));
  };

  const concluirPrimeiroAcesso = async (user) => {
    if (!user?.id || !user?.primeiroLogin) {
      return user;
    }

    try {
      const response = await api.patch(`/usuarios/${user.id}/primeiro-acesso-concluido`);
      const atualizado = response.data?.usuario;

      if (!atualizado) {
        throw new Error("PRIMEIRO_ACESSO_RESPOSTA_INVALIDA");
      }

      return atualizado;
    } catch {
      setError("Nao foi possivel concluir o primeiro acesso. Tente novamente.");
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusBlock(null);

    if (!captchaState.verified || !captchaState.proofToken) {
      setError("Conclua a verificacao humana para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          tipoAcesso: "CLIENTE",
          cpf,
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
      if (!usuario) {
        setError("Resposta de autenticacao invalida.");
        return;
      }

      const usuarioAtualizado = await concluirPrimeiroAcesso(usuario);
      if (!usuarioAtualizado) {
        return;
      }

      loginCustomer(usuarioAtualizado);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const parsed = mapCustomerError(requestError);
      if (parsed.type === "status") {
        setStatusBlock(parsed.code);
      } else {
        setError(parsed.message);
      }
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

      {statusBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border shadow-2xl bg-white/95 dark:bg-slate-900/95 rounded-2xl border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              <T>{STATUS_BLOCK_MESSAGES[statusBlock].title}</T>
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <T>{STATUS_BLOCK_MESSAGES[statusBlock].message}</T>
            </p>
            <button
              type="button"
              onClick={() => setStatusBlock(null)}
              className="nb-button-primary w-full mt-6"
            >
              <T>Fechar</T>
            </button>
          </div>
        </div>
      )}

      <div className="nb-shell max-w-5xl">
        <div className="grid overflow-hidden nb-card lg:grid-cols-[1fr,1.2fr]">
          <aside className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
            <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-blue-100 hover:text-white w-max">
              <ChevronLeft size={15} />
              <T>Inicio</T>
            </Link>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-100/80">
                <T>Conta pessoal</T>
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight">
                <T>Bem-vindo ao NetBank</T>
              </h2>
              <p className="mt-4 text-sm text-blue-100/90">
                <T>Use CPF, e-mail e senha para entrar com dupla validacao e mais seguranca.</T>
              </p>
            </div>

            <div className="nb-card-soft !bg-white/10 !border-white/20 p-4 text-xs">
              <div className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5" />
                <T>O CPF e exigido somente para cliente como camada adicional de identidade.</T>
              </div>
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
                <T>Login do Cliente</T>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                <T>Acesse sua conta digital com seguranca.</T>
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="nb-label">
                  <T>CPF</T>
                </label>
                <div className="relative mt-2">
                  <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={cpf}
                    onChange={onCpfChange}
                    placeholder="000.000.000-00"
                    className="nb-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="nb-label">
                  <T>E-mail</T>
                </label>
                <div className="relative mt-2">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="nb-input pl-10"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="nb-label">
                  <T>Senha</T>
                </label>
                <div className="relative mt-2">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="********"
                    className="nb-input pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
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
                {loading ? <T>Entrando...</T> : <T>Entrar</T>}
              </button>

              {error && (
                <div className="p-3 text-xs font-bold text-center text-rose-700 bg-rose-100 border border-rose-200 rounded-xl dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-900/40">
                  <T>{error}</T>
                </div>
              )}

              <div className="pt-1 text-xs text-center text-slate-600 dark:text-slate-400">
                <Link to="/login-gerente" className="font-bold text-brand-primary hover:text-brand-secondary dark:text-brand-accent">
                  <T>Sou gerente</T>
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CustomerLoginPage;

