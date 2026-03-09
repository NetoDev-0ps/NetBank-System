import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Mail, ShieldAlert, UserRound } from "lucide-react";
import api from "../../core/api/apiClient";
import { ensureCsrfToken } from "../../core/auth/csrf";
import { useAuth } from "../../core/contexts/AuthContext";
import { formatCpf } from "../../core/utils/brCpf";
import HumanPuzzleCaptcha from "../../shared/ui/HumanPuzzleCaptcha";
import T from "../../shared/ui/Translate";

const STATUS_BLOCK_MESSAGES = {
  STATUS_PENDENTE: {
    title: "Conta em análise",
    message:
      "Seu cadastro ainda está em validação pelo time de compliance. Tente novamente em alguns minutos.",
  },
  STATUS_RECUSADO: {
    title: "Cadastro recusado",
    message:
      "Seu cadastro foi recusado. Fale com o suporte para revisar os dados.",
  },
  STATUS_SUSPENSO: {
    title: "Conta suspensa",
    message:
      "Sua conta está suspensa temporariamente. Procure o suporte para regularização.",
  },
  STATUS_BLOQUEADO: {
    title: "Conta bloqueada",
    message:
      "Sua conta foi bloqueada por segurança. Fale com o suporte para investigação.",
  },
  STATUS_ENCERRADO: {
    title: "Conta encerrada",
    message:
      "Sua conta foi encerrada e não pode mais movimentar. Procure o suporte para orientações finais.",
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
      return { type: "inline", message: "E-mail não encontrado." };
    case "DADOS_DIVERGENTES":
      return {
        type: "inline",
        message: "CPF e e-mail não pertencem ao mesmo titular.",
      };
    case "SENHA_INCORRETA":
      return { type: "inline", message: "Senha incorreta." };
    case "TIPO_ACESSO_INVALIDO":
      return { type: "inline", message: "Acesso inválido para este perfil." };
    case "LOGIN_BLOQUEADO_TEMPORARIAMENTE":
      return {
        type: "inline",
        message: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
      };
    case "CAPTCHA_PROOF_AUSENTE":
    case "CAPTCHA_PROOF_INVALIDO":
    case "CAPTCHA_PROOF_REUTILIZADO":
    case "CAPTCHA_PROOF_IP_INVALIDO":
      return { type: "inline", message: "Refaça a verificação humana para continuar." };
    default:
      return {
        type: "inline",
        message:
          error.response?.data?.erro ||
          error.response?.data?.message ||
          "Não foi possível concluir o login.",
      };
  }
};

function CustomerLoginPage() {
  const navigate = useNavigate();
  const {
    loginCustomer,
    logout,
    managerUser,
    isCustomerAuthenticated,
    isManagerAuthenticated,
  } = useAuth();

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
      // token será renovado automaticamente na próxima chamada
    });
  }, []);

  useEffect(() => {
    if (isCustomerAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isCustomerAuthenticated, navigate]);

  const onCpfChange = (event) => {
    setCpf(formatCpf(event.target.value));
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
      setError("Não foi possível concluir o primeiro acesso. Tente novamente.");
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusBlock(null);

    if (!captchaState.verified || !captchaState.proofToken) {
      setError("Conclua a verificação humana para continuar.");
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
        setError("Resposta de autenticação inválida.");
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

  if (isManagerAuthenticated) {
    return (
      <div className="nb-page flex items-center justify-center p-4 sm:p-6">
        <div className="nb-shell max-w-xl">
          <div className="nb-panel">
            <p className="nb-eyebrow"><T>Sessão ativa detectada</T></p>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              <T>Você já está logado como gerente</T>
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {managerUser?.email || "admin@netbank.com.br"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <T>Para entrar como cliente, finalize a sessão atual e continue.</T>
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="nb-button-ghost w-full"
                onClick={() => navigate("/painel", { replace: true })}
              >
                <T>Ir para painel gerente</T>
              </button>
              <button
                type="button"
                className="nb-button-primary w-full"
                onClick={() => logout("/login-cliente")}
              >
                <T>Trocar para cliente</T>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-page flex items-center justify-center p-4 sm:p-6">
      {statusBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="nb-card w-full max-w-md p-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
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

      <div className="nb-shell max-w-6xl">
        <div className="nb-glass overflow-hidden">
          <div className="grid lg:grid-cols-[0.95fr,1.05fr]">
            <aside className="p-7 sm:p-8 lg:p-10 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-blue-100 hover:text-white">
                <ChevronLeft size={15} />
                <T>Início</T>
              </Link>

              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/85">
                <T>Conta pessoal</T>
              </p>
              <h2 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-extrabold leading-tight text-white">
                <T>Bem-vindo ao NetBank</T>
              </h2>
              <p className="mt-4 text-sm text-blue-100/90">
                <T>Use CPF, e-mail e senha para acessar com segurança e validação de identidade.</T>
              </p>

              <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-2 text-xs font-bold text-blue-100">
                  <ShieldAlert size={14} className="mt-0.5" />
                  <T>O CPF é exigido no login de cliente como camada adicional de proteção.</T>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1400&q=80"
                alt="Cliente acessando banco digital"
                className="mt-8 h-52 w-full rounded-2xl object-cover border border-white/20"
              />
            </aside>

            <section className="p-6 sm:p-8 lg:p-10">
              <header className="mb-6">
                <img src="/brand-logo-primary.png" alt="NetBank" className="h-10 mb-5" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  <T>Login do cliente</T>
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <T>Acesse sua conta digital com segurança.</T>
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customer-cpf" className="nb-label">
                    <T>CPF</T>
                  </label>
                  <div className="relative mt-2">
                    <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="customer-cpf"
                      name="customerCpf"
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
                  <label htmlFor="customer-email" className="nb-label">
                    <T>E-mail</T>
                  </label>
                  <div className="relative mt-2">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="customer-email"
                      name="customerEmail"
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
                  <label htmlFor="customer-password" className="nb-label">
                    <T>Senha</T>
                  </label>
                  <div className="relative mt-2">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="customer-password"
                      name="customerPassword"
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
                  className="nb-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? <T>Entrando...</T> : <T>Entrar</T>}
                </button>

                {error && (
                  <div className="rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                    <T>{error}</T>
                  </div>
                )}

                <div className="pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Link to="/login-gerente" className="font-bold text-brand-primary hover:text-brand-secondary dark:text-brand-accent">
                    <T>Entrar como gerente</T>
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

export default CustomerLoginPage;
