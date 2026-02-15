/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../core/api/apiClient";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Check, X, LogOut, Clock, UserCheck, 
  ChevronDown, Trash2, Search, TrendingUp, Users 
} from "lucide-react";

// IMPORTAÇÃO DOS COMPONENTES QUE VOCÊ ENVIOU
import WindSense from "../../shared/effects/WindFlowCanvas"; 
import Notification from "../../shared/ui/Notification";
import DepositModal from "../../shared/modals/DepositModal";
import ConfirmationModal from "../../shared/modals/ConfirmationModal";

function Painel() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [clienteAberto, setClienteAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const [adminInfo] = useState(() => ({
    nome: localStorage.getItem("usuario-nome") || "Gerente",
    email: localStorage.getItem("usuario-email") || "admin@netbank.com.br",
  }));

  const [notificacao, setNotificacao] = useState({ msg: "", type: "" });
  const [modalDeposito, setModalDeposito] = useState({ open: false, userId: null, nome: "" });
  const [modalExclusao, setModalExclusao] = useState({ open: false, id: null });

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (err) {
      setNotificacao({ msg: "Falha na sincronização Core.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  // FILTRAGEM DE GESTÃO: Remove Administradores (como o Neto Manager) da lista
  const { pendentes, ativos, estatisticas } = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const apenasClientes = usuarios.filter(u => u.cargo === "CLIENTE");

    const filtrados = apenasClientes.filter(u =>
      u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo)
    );

    return {
      pendentes: filtrados.filter(u => u.status === "PENDENTE"),
      ativos: filtrados.filter(u => u.status !== "PENDENTE"),
      estatisticas: {
        total: apenasClientes.length,
        liquidez: apenasClientes.reduce((acc, curr) => acc + curr.saldo, 0),
        aguardando: apenasClientes.filter(u => u.status === "PENDENTE").length
      }
    };
  }, [usuarios, busca]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden font-sans text-white bg-slate-950 selection:bg-blue-500/30">
      
      {/* CAMADA DE FUNDO: Efeito Vento + Orbes (Baseado na sua Home.jsx) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <WindSense /> 
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-50" /> [cite: 275]
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px] opacity-30" /> [cite: 276]
      </div>

      <Notification 
        message={notificacao.msg} type={notificacao.type} 
        onClose={() => setNotificacao({ msg: "", type: "" })} 
      />

      {/* HEADER EXECUTIVO */}
      <header className="relative z-50 border-b bg-slate-950/50 backdrop-blur-xl border-white/[0.05]">
        <div className="flex items-center justify-between px-8 py-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 shadow-lg rounded-xl shadow-blue-900/40">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.4em] uppercase">NetBank <span className="text-blue-500">Admin</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{adminInfo.nome}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-6 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase border rounded-full border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all">
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 px-8 py-12 mx-auto max-w-7xl">
        {/* KPI SECTION */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          {[
            { label: "Liquidez Core", val: estatisticas.liquidez, icon: TrendingUp },
            { label: "Clientes Ativos", val: estatisticas.total, icon: Users },
            { label: "Pendências", val: estatisticas.aguardando, icon: Clock }
          ].map((kpi, i) => (
            <div key={i} className="p-8 border bg-slate-900/40 border-white/[0.05] rounded-3xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</span>
                <kpi.icon size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl italic font-light">
                {kpi.label.includes("Liquidez") ? `R$ ${kpi.val.toLocaleString()}` : kpi.val}
              </p>
            </div>
          ))}
        </div>

        {/* LISTAGEM PRINCIPAL */}
        <section className="border bg-slate-900/30 border-white/[0.05] rounded-[2.5rem] overflow-hidden backdrop-blur-lg">
          <div className="flex items-center justify-between p-8 border-b border-white/[0.05]">
             <h2 className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-3">
                <UserCheck size={18} className="text-blue-500" /> Gestão de Contas
             </h2>
             <div className="relative">
                <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-600" size={14} />
                <input 
                  type="text" placeholder="Buscar por CPF ou Nome..." value={busca} onChange={(e) => setBusca(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-xs text-white outline-none focus:border-blue-500/50 w-80 transition-all"
                />
             </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/[0.02]">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Saldo</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {ativos.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white transition-colors group-hover:text-blue-400">{u.nome}</span>
                      <span className="text-[9px] font-mono text-slate-600">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black border ${
                      u.status === 'ATIVA' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs text-white">R$ {u.saldo.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setClienteAberto(u.id === clienteAberto ? null : u.id)}>
                      <ChevronDown className={`transition-transform duration-500 ${clienteAberto === u.id ? 'rotate-180 text-blue-500' : 'text-slate-700'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* INTEGRAÇÃO DOS MODAIS QUE VOCÊ ENVIOU */}
      <DepositModal 
        isOpen={modalDeposito.open} 
        clienteNome={modalDeposito.nome}
        onClose={() => setModalDeposito({ open: false })} 
        onConfirm={(v) => console.log("Aporte:", v)} // Aqui ligaremos ao back futuramente
      /> 

      <ConfirmationModal 
        isOpen={modalExclusao.open} 
        title="Eliminar Cliente"
        description="Esta ação removerá todos os dados do Core Banking permanentemente."
        onClose={() => setModalExclusao({ open: false })} 
      /> 
    </div>
  );
}

export default Painel;