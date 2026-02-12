import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Home,
  PieChart,
  CreditCard,
  Settings,
  Search,
  Bell,
  MoveUpRight,
  PiggyBank,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Atraso entre os elementos
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function ClientDashboard() {
  const navigate = useNavigate();

  // 1. Inicializa o estado lendo direto do localStorage (Lazy Init)
  // Isso evita o erro de "setState inside useEffect" e remove o aviso do ESLint
  const [usuario] = useState(() => {
    const dados = localStorage.getItem("cliente_dados");
    return dados ? JSON.parse(dados) : null;
  });

  // 2. estado para controlar o "Olhinho" do saldo
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  // 3. O useEffect para expulsar quem não tem login
  useEffect(() => {
    if (!usuario) {
      navigate("/login-cliente");
    }
  }, [usuario, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("cliente_token");
    navigate("/");
  };

  // Evita erro de renderização se o usuário não tiver carregado ainda
  if (!usuario) return null;

  return (
    // LAYOUT DARK BLUE
    <div className="flex h-screen overflow-hidden font-sans text-white bg-slate-950">
      {/* SIDEBAR */}
      <aside className="z-20 flex flex-col justify-between w-20 border-r md:w-64 bg-slate-900 border-slate-800">
        <div>
          <div className="flex items-center gap-3 p-6 mb-6 border-b border-slate-800">
            <div className="flex items-center justify-center w-10 h-10 text-lg font-bold bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
              {usuario.nome.charAt(0)}
            </div>
            <span className="hidden font-bold text-blue-100 truncate md:block">
              {usuario.nome.split(" ")[0]}
            </span>
          </div>

          <nav className="px-4 space-y-2">
            <NavItem icon={<Home size={20} />} label="Início" active />
            <NavItem icon={<PieChart size={20} />} label="Extrato" />
            <NavItem icon={<CreditCard size={20} />} label="Meus Cartões" />
            <NavItem icon={<Settings size={20} />} label="Configurações" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 p-3 text-red-400 transition hover:text-red-300 hover:bg-red-900/20 rounded-xl"
          >
            <LogOut size={20} />{" "}
            <span className="hidden text-sm font-bold md:block">
              Sair da Conta
            </span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL COM GRADIENTE */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex-1 p-4 overflow-y-auto md:p-8 bg-gradient-to-br from-slate-950 to-blue-950"
      >
        {/* Detalhe de Fundo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="relative z-10 flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Olá, {usuario.nome.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-blue-300/60">
              Bem-vindo ao seu banco digital.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="p-3 text-blue-200 transition border rounded-full cursor-pointer bg-white/5 border-white/10 hover:bg-white/10">
              <Search size={20} />
            </div>
            <div className="p-3 text-blue-200 transition border rounded-full cursor-pointer bg-white/5 border-white/10 hover:bg-white/10">
              <Bell size={20} />
            </div>
          </div>
        </motion.header>

        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6 lg:col-span-2">
            {/* Cartão Saldo (Glassmorphism) */}
            <div className="relative p-8 overflow-hidden border shadow-2xl bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl border-blue-700/50 group">
              <div className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 transition duration-500 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10"></div>

              <div className="flex items-center justify-between mb-8">
                <span className="font-medium text-blue-200">
                  Saldo Disponível
                </span>
                <button
                  onClick={() => setMostrarSaldo(!mostrarSaldo)}
                  className="text-blue-300 transition hover:text-white"
                >
                  {mostrarSaldo ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  {mostrarSaldo
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(usuario.saldo)
                    : "R$ ••••••"}
                </h2>
              </div>

              <div className="flex gap-4 mt-4">
                <button className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition">
                  Ver Extrato
                </button>
                <button className="bg-blue-700/50 text-white border border-blue-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition">
                  Pagar Fatura
                </button>
              </div>
            </div>

            {/* Atalhos Rápidos */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Botão Pix Conectado */}
              <QuickAction
                icon={<MoveUpRight />}
                label="Transferir Pix"
                onClick={() => navigate("/area-pix")}
              />

              <QuickAction icon={<CreditCard />} label="Cartões" />
              <QuickAction icon={<PiggyBank />} label="Poupança" />
              <QuickAction icon={<TrendingUp />} label="Investir" />
            </div>

            {/* Últimas Transações */}
            <div className="p-6 border bg-slate-900/50 border-slate-800 rounded-3xl backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-blue-100">
                Histórico Recente
              </h3>
              <div className="space-y-4">
                <TransactionItem
                  icon="🚗"
                  title="Uber *Trip"
                  date="Hoje, 14:32"
                  value="- R$ 15,90"
                />
                <TransactionItem
                  icon="🍕"
                  title="iFood *Lanche"
                  date="Ontem, 20:01"
                  value="- R$ 48,90"
                />
                <TransactionItem
                  icon="💰"
                  title="Pix Recebido"
                  date="10/02"
                  value="+ R$ 1.250,00"
                  isIncome
                />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            <div className="flex flex-col h-full p-6 border bg-gradient-to-b from-slate-900 to-slate-900/50 border-slate-800 rounded-3xl backdrop-blur-sm">
              <h3 className="mb-6 text-lg font-bold text-blue-100">
                Meu Cartão
              </h3>

              {/* Cartão Virtual Visual */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 h-48 rounded-2xl p-6 relative overflow-hidden border border-slate-600/50 shadow-lg mb-6 group hover:scale-[1.02] transition">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/20 blur-xl"></div>
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xl italic font-bold tracking-wider text-white/90">
                    NetBank
                  </span>
                  <span className="text-xs text-gray-400">Virtual</span>
                </div>
                <div className="mt-auto">
                  <p className="mb-2 font-mono text-sm text-gray-300">
                    •••• •••• •••• 8829
                  </p>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    {usuario.nome}
                  </p>
                </div>
              </div>

              <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">
                Gastos por Categoria
              </h3>
              <div className="space-y-5">
                <DetailItem
                  label="Alimentação"
                  percent="55%"
                  color="bg-blue-500"
                />
                <DetailItem
                  label="Transporte"
                  percent="25%"
                  color="bg-cyan-400"
                />
                <DetailItem
                  label="Serviços"
                  percent="20%"
                  color="bg-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

// Componentes Auxiliares
const NavItem = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
  >
    {icon}
    <span className="hidden text-sm font-medium md:block">{label}</span>
  </div>
);

const QuickAction = ({ icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(29, 78, 216, 0.8)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-4 transition border bg-slate-800/40 border-slate-800 rounded-2xl group h-28 text-slate-300"
  >
    <div className="p-2 transition rounded-full bg-slate-700/50 group-hover:bg-white/20">
      {icon}
    </div>
    <span className="text-xs font-bold">{label}</span>
  </motion.button>
);

const TransactionItem = ({ icon, title, date, value, isIncome }) => (
  <div className="flex items-center justify-between p-3 transition cursor-default hover:bg-white/5 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 text-xl border rounded-full bg-slate-800 border-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-blue-100">{title}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
    </div>
    <span
      className={`font-bold text-sm ${isIncome ? "text-green-400" : "text-slate-200"}`}
    >
      {value}
    </span>
  </div>
);

const DetailItem = ({ label, percent, color }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${color} shadow-[0_0_10px_currentColor]`}
      ></div>
      <span className="text-slate-300">{label}</span>
    </div>
    <span className="font-bold text-white">{percent}</span>
  </div>
);

export default ClientDashboard;
