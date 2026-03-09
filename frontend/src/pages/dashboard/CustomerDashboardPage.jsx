import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  LogOut,
  PieChart,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../core/api/apiClient";
import { getCustomerData, logout, saveCustomerSession } from "../../core/auth/session";
import T from "../../shared/ui/Translate";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function CustomerDashboardPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(() => getCustomerData());
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [loadingFreshData, setLoadingFreshData] = useState(false);
  const userId = usuario?.id;
  const userStatus = usuario?.status;

  const handleLogout = useCallback(() => {
    logout("/home");
  }, []);

  const sincronizarDados = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingFreshData(true);
      const response = await api.get(`/usuarios/${userId}`);
      const dadosAtualizados = response.data;

      if (dadosAtualizados.status !== "ATIVA") {
        handleLogout();
        return;
      }

      setUsuario(dadosAtualizados);
      saveCustomerSession(dadosAtualizados);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Erro na sincronização:", err);
      }
    } finally {
      setLoadingFreshData(false);
    }
  }, [userId, handleLogout]);

  useEffect(() => {
    if (!userId) {
      logout("/login-cliente");
      return;
    }

    if (userStatus !== "ATIVA") {
      handleLogout();
      return;
    }

    sincronizarDados();
  }, [userId, userStatus, handleLogout, sincronizarDados]);

  if (!usuario) return null;

  return (
    <div className="nb-page">
      <header className="nb-topbar">
        <div className="nb-shell py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent text-white font-extrabold">
              {usuario.nome.charAt(0)}
            </div>
            <div>
              <p className="nb-eyebrow"><T>Conta pessoal</T></p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{usuario.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sincronizarDados}
              className={`nb-button-ghost !px-3 !py-2.5 ${loadingFreshData ? "animate-spin" : ""}`}
              title="Atualizar"
            >
              <RefreshCw size={15} />
            </button>
            <button type="button" className="nb-button-ghost !px-3 !py-2.5" title="Notificações">
              <Bell size={15} />
            </button>
            <button type="button" onClick={handleLogout} className="nb-button-danger !px-3 !py-2.5" title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="nb-shell py-6 sm:py-8">
        <section className="grid gap-5 xl:grid-cols-[1.5fr,1fr]">
          <div className="space-y-5">
            <motion.article variants={itemVariants} className="nb-panel bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                <T>Saldo em conta</T>
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <h1 className="text-[clamp(2rem,7vw,3.4rem)] font-extrabold leading-none text-white">
                  {mostrarSaldo
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(usuario.saldo)
                    : "R$ ******"}
                </h1>
                <button
                  type="button"
                  onClick={() => setMostrarSaldo((value) => !value)}
                  className="nb-button-secondary !border-white/35 !bg-white/10 !text-white !p-2.5 !rounded-full"
                >
                  {mostrarSaldo ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickChip icon={<ArrowUpRight size={16} />} label="Área Pix" onClick={() => navigate("/area-pix")} />
                <QuickChip icon={<CreditCard size={16} />} label="Cartões" />
                <QuickChip icon={<PieChart size={16} />} label="Extrato" />
                <QuickChip icon={<PiggyBank size={16} />} label="Reservas" />
              </div>
            </motion.article>

            <motion.article variants={itemVariants} className="nb-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="nb-eyebrow"><T>Atividade recente</T></p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                    <T>Últimos movimentos</T>
                  </h2>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {usuario.saldo > 0 ? (
                  <TransactionItem
                    icon="NB"
                    title="Bônus de boas-vindas"
                    date="Crédito inicial"
                    value="+ R$ 5.000,00"
                    isIncome
                  />
                ) : (
                  <p className="text-sm italic text-slate-500 dark:text-slate-400">
                    <T>Nenhuma transação registrada ainda.</T>
                  </p>
                )}
              </div>
            </motion.article>
          </div>

          <div className="space-y-5">
            <motion.article variants={itemVariants} className="nb-panel">
              <p className="nb-eyebrow"><T>Cartão digital</T></p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold">NetBank</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                    <T>Virtual</T>
                  </span>
                </div>
                <p className="mt-10 font-mono tracking-[0.2em] text-slate-300">**** **** **** 8829</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">{usuario.nome}</p>
              </div>
            </motion.article>

            <motion.article variants={itemVariants} className="nb-panel">
              <p className="nb-eyebrow"><T>Segurança da conta</T></p>
              <div className="mt-3 space-y-3">
                <SecurityRow icon={<ShieldCheck size={16} />} label="Conta protegida" value="OK" />
                <SecurityRow icon={<Wallet size={16} />} label="Saldo atualizado" value="Atual" />
              </div>
            </motion.article>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

const QuickChip = ({ icon, label, onClick }) => (
  <button type="button" onClick={onClick} className="rounded-xl border border-white/20 bg-white/10 p-3 text-left text-white transition hover:bg-white/20">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">{icon}</div>
    <p className="mt-2 text-[11px] font-black uppercase tracking-wider">
      <T>{label}</T>
    </p>
  </button>
);

const TransactionItem = ({ icon, title, date, value, isIncome }) => (
  <div className="nb-card-soft p-3 sm:p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          <T>{title}</T>
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          <T>{date}</T>
        </p>
      </div>
    </div>

    <p className={`text-sm font-extrabold ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
      {value}
    </p>
  </div>
);

const SecurityRow = ({ icon, label, value }) => (
  <div className="nb-card-soft p-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      {icon}
      <span className="text-sm font-bold"><T>{label}</T></span>
    </div>
    <span className="text-xs font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent">
      {value}
    </span>
  </div>
);

export default CustomerDashboardPage;