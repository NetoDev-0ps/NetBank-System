import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  LogOut,
  MoveUpRight,
  PieChart,
  PiggyBank,
  RefreshCw,
  Settings,
  TrendingUp,
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
        console.error("Erro na sincronizacao:", err);
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
    <div className="nb-page lg:grid lg:grid-cols-[250px,1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 lg:p-5">
        <div className="flex lg:flex-col justify-between lg:justify-start gap-4">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-black flex items-center justify-center">
                {usuario.nome.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <T>Cliente</T>
                </p>
                <p className="font-bold text-slate-800 dark:text-white truncate max-w-[120px] lg:max-w-none">
                  {usuario.nome.split(" ")[0]}
                </p>
              </div>
            </div>

            <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
              <NavItem icon={<Home size={18} />} label="Inicio" active />
              <NavItem icon={<PieChart size={18} />} label="Extrato" />
              <NavItem icon={<CreditCard size={18} />} label="Cartoes" />
              <NavItem icon={<Settings size={18} />} label="Configuracoes" />
            </nav>
          </div>

          <button onClick={handleLogout} className="nb-button-danger w-full lg:mt-8">
            <LogOut size={16} />
            <T>Sair</T>
          </button>
        </div>
      </aside>

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="nb-shell py-5 sm:py-8">
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              <T>Ola</T>, {usuario.nome.split(" ")[0]}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <T>Visao geral da sua conta digital NetBank.</T>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={sincronizarDados}
              className={`nb-button-ghost !py-2.5 !px-3 ${loadingFreshData ? "animate-spin" : ""}`}
              title="Atualizar"
            >
              <RefreshCw size={16} />
            </button>
            <button className="nb-button-ghost !py-2.5 !px-3" title="Notificacoes">
              <Bell size={16} />
            </button>
          </div>
        </motion.header>

        <div className="grid gap-5 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-5">
            <motion.section variants={itemVariants} className="nb-card p-5 sm:p-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-widest uppercase text-blue-100">
                  <T>Saldo em conta</T>
                </p>
                <button onClick={() => setMostrarSaldo((v) => !v)} className="text-blue-100 hover:text-white">
                  {mostrarSaldo ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <p className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                {mostrarSaldo
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(usuario.saldo)
                  : "R$ ******"}
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button className="nb-button-secondary !bg-white !text-brand-primary !border-white w-full sm:w-auto">
                  <T>Ver extrato</T>
                </button>
                <button className="nb-button-secondary !bg-white/10 !text-white !border-white/20 w-full sm:w-auto">
                  <T>Pagar fatura</T>
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickAction icon={<MoveUpRight size={18} />} label="Transferir Pix" onClick={() => navigate("/area-pix")} />
              <QuickAction icon={<CreditCard size={18} />} label="Cartoes" />
              <QuickAction icon={<PiggyBank size={18} />} label="Poupanca" />
              <QuickAction icon={<TrendingUp size={18} />} label="Investir" />
            </motion.section>

            <motion.section variants={itemVariants} className="nb-card p-5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                <T>Atividade recente</T>
              </h2>
              <div className="mt-4">
                {usuario.saldo > 0 ? (
                  <TransactionItem
                    icon="RS"
                    title="Bonus NetBank"
                    date="Abertura de conta"
                    value="+ R$ 5.000,00"
                    isIncome
                  />
                ) : (
                  <p className="text-sm italic text-slate-500 dark:text-slate-400">
                    <T>Nenhuma transacao realizada ainda.</T>
                  </p>
                )}
              </div>
            </motion.section>
          </div>

          <motion.aside variants={itemVariants} className="nb-card p-5">
            <h2 className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <T>Meus cartoes</T>
            </h2>

            <div className="mt-4 rounded-2xl p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white min-h-[180px]">
              <div className="flex items-center justify-between">
                <p className="text-lg italic font-black">NetBank</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Virtual</span>
              </div>
              <p className="mt-10 font-mono text-sm tracking-widest text-slate-300">**** **** **** 8829</p>
              <p className="mt-3 text-[11px] uppercase tracking-widest text-slate-400">{usuario.nome}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                <T>Analise de gastos</T>
              </h3>
              <div className="mt-4 space-y-3">
                <DetailItem label="Lazer" percent="0%" color="bg-blue-500" />
                <DetailItem label="Mercado" percent="0%" color="bg-cyan-500" />
                <DetailItem label="Servicos" percent="0%" color="bg-indigo-500" />
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.main>
    </div>
  );
}

const NavItem = ({ icon, label, active }) => (
  <button
    type="button"
    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
      active
        ? "bg-brand-primary text-white"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
    <span>
      <T>{label}</T>
    </span>
  </button>
);

const QuickAction = ({ icon, label, onClick }) => (
  <button type="button" onClick={onClick} className="nb-card-soft p-3 sm:p-4 text-left hover:scale-[1.01] transition-transform">
    <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">{icon}</div>
    <p className="mt-3 text-[11px] font-black tracking-widest uppercase text-slate-700 dark:text-slate-200">
      <T>{label}</T>
    </p>
  </button>
);

const TransactionItem = ({ icon, title, date, value, isIncome }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base">
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
    <p className={`text-sm font-black ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
      {value}
    </p>
  </div>
);

const DetailItem = ({ label, percent, color }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-slate-600 dark:text-slate-300">
        <T>{label}</T>
      </span>
    </div>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{percent}</span>
  </div>
);

export default CustomerDashboardPage;




