/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Check,
  X,
  LogOut,
  Clock,
  UserCheck,
  ChevronDown,
  Trash2,
  DollarSign,
} from "lucide-react";
import Notification from "../components/Notification";
import DepositModal from "../components/DepositModal";
import ConfirmationModal from "../components/ConfirmationModal";

function Painel() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [clienteAberto, setClienteAberto] = useState(null);

  // Inicialização de estado segura (Lazy initialization)
  const [adminInfo] = useState(() => ({
    nome: localStorage.getItem("usuario-nome") || "Gerente",
    email: localStorage.getItem("usuario-email") || "admin@netbank.com.br",
  }));

  const [notificacao, setNotificacao] = useState({ msg: "", type: "" });
  const [modalDeposito, setModalDeposito] = useState({
    open: false,
    userId: null,
    nome: "",
  });

  const [modalExclusao, setModalExclusao] = useState({ open: false, id: null });

  const showToast = (msg, type = "success") => {
    setNotificacao({ msg, type });
    setTimeout(() => setNotificacao({ msg: "", type: "" }), 4000);
  };

  // --- 1. FUNÇÃO DE ATUALIZAÇÃO (Para Botões Manuais) ---
  const atualizarLista = async () => {
    try {
      const resposta = await api.get("/usuarios");
      setUsuarios(resposta.data);
    } catch (error) {
      console.error("Erro ao atualizar manualmente:", error);
    }
  };

  // --- 2. EFEITO DE MONTAGEM (Isolado) ---
  useEffect(() => {
    let isMounted = true;
    const carregarInicial = async () => {
      try {
        const resposta = await api.get("/usuarios");
        if (isMounted) setUsuarios(resposta.data);
      } catch (error) {
        console.error("Erro no load inicial:", error);
      }
    };
    carregarInicial();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const aprovarCliente = async (id) => {
    try {
      await api.patch(`/usuarios/${id}/status`, { status: "ATIVA" });
      showToast("Cliente aprovado com sucesso!", "success");
      atualizarLista();
    } catch (error) {
      const msg = error.response?.data || "Erro ao aprovar cliente.";
      showToast(msg, "error");
    }
  };

  // --- MODAL DE EXCLUSÃO ---
  const solicitarExclusao = (id) => {
    setModalExclusao({ open: true, id });
  };

  const confirmarExclusaoReal = async () => {
    if (!modalExclusao.id) return;
    try {
      await api.delete(`/usuarios/${modalExclusao.id}`);
      showToast("Registro removido permanentemente.", "warning");
      setModalExclusao({ open: false, id: null });
      atualizarLista();
    } catch (error) {
      const msg = error.response?.data || "Erro ao excluir.";
      showToast(msg, "error");
    }
  };

  const alterarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/usuarios/${id}/status`, { status: novoStatus });
      showToast(`Status alterado para ${novoStatus}`, "success");
      atualizarLista();
    } catch (error) {
      const msg = error.response?.data || "Erro ao mudar status.";
      showToast(msg, "error");
      atualizarLista();
    }
  };

  const abrirModalDeposito = (usuario) => {
    setModalDeposito({ open: true, userId: usuario.id, nome: usuario.nome });
  };

  const confirmarDeposito = async (valor) => {
    try {
      await api.patch(`/usuarios/${modalDeposito.userId}/deposito`, { valor });
      showToast(`R$ ${valor} depositado para ${modalDeposito.nome}`, "success");
      setModalDeposito({ open: false, userId: null, nome: "" });
      atualizarLista();
    } catch (error) {
      const msg = error.response?.data || "Erro ao realizar depósito.";
      showToast(msg, "error");
    }
  };

  const formatarCPF = (cpf) => {
    if (!cpf) return "---";
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarData = (data) => {
    if (!data) return "---";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "BLOQUEADA":
        return "bg-red-900/20 text-red-400 border-red-800/50";
      case "SUSPENSA":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-800/50";
      default:
        return "bg-green-900/20 text-green-400 border-green-800/50";
    }
  };

  const pendentes = usuarios.filter((u) => u.status === "PENDENTE");
  const ativos = usuarios.filter((u) => u.status !== "PENDENTE");

  return (
    <div className="min-h-screen pb-20 font-sans text-blue-100 bg-slate-950">
      <Notification
        message={notificacao.msg}
        type={notificacao.type}
        onClose={() => setNotificacao({ msg: "", type: "" })}
      />

      <DepositModal
        isOpen={modalDeposito.open}
        onClose={() => setModalDeposito({ ...modalDeposito, open: false })}
        onConfirm={confirmarDeposito}
        clienteNome={modalDeposito.nome}
      />

      <ConfirmationModal
        isOpen={modalExclusao.open}
        onClose={() => setModalExclusao({ open: false, id: null })}
        onConfirm={confirmarExclusaoReal}
        title="Excluir Cliente"
        description="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita e todo o histórico financeiro será perdido."
      />

      <header className="sticky top-0 z-20 border-b shadow-lg bg-slate-900/80 backdrop-blur-md border-slate-800">
        <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
         <div className="flex items-center gap-4">
  <img 
    src="/logo02.png" 
    alt="NetBank Manager" 
    className="object-contain w-auto h-9" 
  />
            <span className="hidden md:block px-2 py-0.5 text-[10px] font-bold tracking-widest text-blue-300 border border-blue-900 bg-blue-900/20 rounded uppercase">
    Manager
  </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-white">{adminInfo.nome}</p>
              <p className="text-xs text-blue-400">{adminInfo.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 transition rounded-lg bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-8 px-6 py-8 mx-auto max-w-7xl lg:grid-cols-3">
        {/* COLUNA ESQUERDA: PENDENTES COM ANIMAÇÃO */}
        <div className="space-y-6 lg:col-span-1">
          <div className="overflow-hidden border shadow-xl bg-slate-900/60 border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between p-4 border-b bg-blue-900/20 border-blue-800/30">
              <h3 className="flex items-center gap-2 font-bold text-blue-300">
                <Clock size={18} /> Fila
              </h3>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {pendentes.length}
              </span>
            </div>
            <div className="divide-y divide-slate-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {pendentes.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    layout
                    className="p-4 transition hover:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">{u.nome}</p>
                        <p className="font-mono text-xs text-blue-300/60">
                          {formatarCPF(u.cpf)}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-orange-300 bg-orange-900/20 border border-orange-800/50 px-2 py-1 rounded">
                        PENDENTE
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => aprovarCliente(u.id)}
                        className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-white transition bg-green-600 rounded-lg w-fit hover:bg-green-500"
                      >
                        <Check size={14} /> Aceitar
                      </button>
                      <button
                        onClick={() => solicitarExclusao(u.id)}
                        className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-red-400 transition rounded-lg w-fit bg-red-600/20 hover:bg-red-600/30"
                      >
                        <X size={14} /> Recusar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: TABELA DE ATIVOS COM BANNER RETRÁTIL */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden border shadow-xl bg-slate-900/60 border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <UserCheck className="text-blue-400" /> Clientes
              </h3>
              <span className="px-3 py-1 text-xs font-bold text-blue-300 rounded-full bg-slate-800">
                {ativos.length}
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="text-xs uppercase border-b bg-slate-950 text-blue-300/50 border-slate-800">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Saldo</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ativos.map((u) => (
                  <React.Fragment key={u.id}>
                    <tr
                      onClick={() =>
                        setClienteAberto(clienteAberto === u.id ? null : u.id)
                      }
                      className={`transition-all cursor-pointer hover:bg-slate-800/40 group ${clienteAberto === u.id ? "bg-blue-900/10" : ""}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            size={14}
                            className={`text-blue-500/50 transition-transform ${clienteAberto === u.id ? "rotate-180" : ""}`}
                          />
                          <div>
                            <div className="font-bold text-white">{u.nome}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                              Clique para detalhes
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-green-400">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(u.saldo || 0)}
                      </td>
                      <td className="p-4 text-center">
                        <div
                          className="relative inline-block w-36"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={u.status || "ATIVA"}
                            onChange={(e) =>
                              alterarStatus(u.id, e.target.value)
                            }
                            className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none transition-colors bg-slate-950 focus:ring-2 focus:ring-blue-500 ${getStatusStyle(u.status)}`}
                          >
                            <option value="ATIVA">✅ ATIVA</option>
                            <option value="SUSPENSA">⏸️ SUSPENSA</option>
                            <option value="BLOQUEADA">⛔ BLOQUEADA</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-blue-300/50">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </td>
                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirModalDeposito(u)}
                            className="p-2 text-blue-400 transition border rounded-lg bg-blue-900/30 border-blue-800/50 hover:bg-blue-600 hover:text-white"
                            title="Depositar"
                          >
                            <DollarSign size={18} />
                          </button>
                          <button
                            onClick={() => solicitarExclusao(u.id)}
                            className="p-2 transition rounded-lg opacity-0 text-slate-500 hover:text-red-400 group-hover:opacity-100"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {clienteAberto === u.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-950/50"
                        >
                          <td
                            colSpan={4}
                            className="p-6 border-b border-blue-900/20"
                          >
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">
                                    Documento Identificador
                                  </p>
                                  <p className="font-mono text-sm text-white">
                                    {formatarCPF(u.cpf)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">
                                    Data de Nascimento
                                  </p>
                                  <p className="font-mono text-sm text-white">
                                    {formatarData(u.dataNascimento)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col justify-center p-4 border bg-blue-900/10 rounded-2xl border-blue-800/20">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">
                                  Resumo de Conta
                                </p>
                                <p className="text-xs text-slate-400">
                                  Cliente desde:{" "}
                                  {new Date().toLocaleDateString("pt-BR")}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Limite Pré-Aprovado: R$ 500,00
                                </p>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Painel;
