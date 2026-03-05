import React, { useCallback, useEffect, useState } from "react";
import { LogOut, RotateCcw, Search } from "lucide-react";
import api from "../../core/api/apiClient";
import { useAuth } from "../../core/contexts/AuthContext";
import WindSense from "../../shared/effects/WindFlowCanvas";
import ConfirmationModal from "../../shared/modals/ConfirmationModal";
import Notification from "../../shared/ui/Notification";
import T from "../../shared/ui/Translate";
import ManagerStatsGrid from "./manager/ManagerStatsGrid";
import ManagerUsersTable from "./manager/ManagerUsersTable";
import { mapManagerApiError } from "./manager/managerDashboard.constants";

const PAGE_SIZE = 12;

const EMPTY_STATS = {
  total: 0,
  ativos: 0,
  pendentes: 0,
  suspensas: 0,
  bloqueadas: 0,
  recusadas: 0,
};

function ManagerDashboardPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [clienteAberto, setClienteAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mostrarRecusados, setMostrarRecusados] = useState(false);

  const [stats, setStats] = useState(EMPTY_STATS);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [notificacao, setNotificacao] = useState({ msg: "", type: "" });
  const [statusEmAtualizacao, setStatusEmAtualizacao] = useState(null);
  const [deletando, setDeletando] = useState(false);
  const [modalExclusao, setModalExclusao] = useState({
    open: false,
    id: null,
    nome: "",
  });

  const { managerUser, logout } = useAuth();
  const adminInfo = {
    nome: managerUser?.nome || "Gerente",
    email: managerUser?.email || "admin@netbank.com.br",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(busca.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  const carregarUsuarios = useCallback(
    async (nextPage = 0) => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await api.get("/usuarios/paginado", {
          params: {
            page: nextPage,
            size: PAGE_SIZE,
            busca: buscaDebounced || undefined,
            incluirRecusadas: mostrarRecusados,
          },
        });

        const payload = response.data || {};
        setUsuarios(Array.isArray(payload.items) ? payload.items : []);
        setStats(payload.stats || EMPTY_STATS);
        setPage(Number.isInteger(payload.page) ? payload.page : nextPage);
        setTotalPages(Number.isInteger(payload.totalPages) ? payload.totalPages : 0);
        setTotalElements(Number.isInteger(payload.totalElements) ? payload.totalElements : 0);
      } catch (error) {
        const mensagem = mapManagerApiError(
          error,
          "Falha ao sincronizar usuarios com o servidor.",
        );
        setLoadError(mensagem);
        setNotificacao({ msg: mensagem, type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [buscaDebounced, mostrarRecusados],
  );

  useEffect(() => {
    carregarUsuarios(0);
  }, [carregarUsuarios]);

  const alterarStatus = async (id, novoStatus) => {
    try {
      setStatusEmAtualizacao(id);
      await api.patch(`/usuarios/${id}/status`, { status: novoStatus });
      setNotificacao({
        msg: `Status atualizado para ${novoStatus}.`,
        type: "success",
      });
      await carregarUsuarios(page);
    } catch (error) {
      setNotificacao({
        msg: mapManagerApiError(error, "Nao foi possivel atualizar o status."),
        type: "error",
      });
    } finally {
      setStatusEmAtualizacao(null);
    }
  };

  const abrirModalExclusao = (usuario) => {
    setModalExclusao({
      open: true,
      id: usuario.id,
      nome: usuario.nome || "cliente",
    });
  };

  const deletarUsuario = async (id) => {
    if (!id) return;

    try {
      setDeletando(true);
      await api.delete(`/usuarios/${id}`);
      setNotificacao({ msg: "Cliente excluido com sucesso.", type: "success" });
      setModalExclusao({ open: false, id: null, nome: "" });
      await carregarUsuarios(Math.max(0, page));
    } catch (error) {
      setNotificacao({
        msg: mapManagerApiError(error, "Nao foi possivel excluir o cliente."),
        type: "error",
      });
    } finally {
      setDeletando(false);
    }
  };

  const handlePrevPage = () => {
    if (page <= 0) return;
    carregarUsuarios(page - 1);
  };

  const handleNextPage = () => {
    if (page + 1 >= totalPages) return;
    carregarUsuarios(page + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#CFF3F8] dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans transition-colors bg-[#CFF3F8] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <WindSense />
      </div>

      <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Notification
            message={notificacao.msg}
            type={notificacao.type}
            onClose={() => setNotificacao({ msg: "", type: "" })}
          />
        </div>
      </div>

      <header className="relative z-[90] bg-white border-b shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-5 mx-auto max-w-7xl">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <T>Painel Administrativo</T>
            </p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              NetBank - Gerencia
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {adminInfo.nome} - {adminInfo.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => carregarUsuarios(page)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-black tracking-widest uppercase transition border rounded-2xl bg-white/80 border-slate-200 text-slate-700 hover:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <RotateCcw size={16} />
              <T>Atualizar</T>
            </button>

            <button
              onClick={() => logout("/home")}
              className="flex items-center gap-2 px-4 py-3 text-xs font-black tracking-widest text-white uppercase transition bg-rose-600 rounded-2xl hover:bg-rose-500"
            >
              <LogOut size={16} />
              <T>Sair</T>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 mx-auto max-w-7xl">
        {loadError && (
          <div className="p-4 mb-6 border rounded-2xl bg-white/80 border-rose-500/30 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-300">
                  <T>Falha de sincronizacao</T>
                </p>
                <p className="mt-1 text-sm">{loadError}</p>
              </div>
              <button
                onClick={() => carregarUsuarios(page)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 rounded-xl hover:bg-rose-500 transition"
              >
                <T>Tentar novamente</T>
              </button>
            </div>
          </div>
        )}

        <ManagerStatsGrid stats={stats} />

        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400"
            />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, e-mail ou CPF..."
              className="w-full py-4 pl-12 pr-4 text-sm border outline-none bg-white/80 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
          </div>

          <button
            onClick={() => setMostrarRecusados((valor) => !valor)}
            className="px-5 py-4 text-xs font-black tracking-widest uppercase transition border rounded-2xl bg-white/80 border-slate-200 text-slate-700 hover:bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          >
            <T>{mostrarRecusados ? "Ocultar recusadas" : "Mostrar recusadas"}</T>
          </button>
        </div>

        <ManagerUsersTable
          usuarios={usuarios}
          clienteAberto={clienteAberto}
          statusEmAtualizacao={statusEmAtualizacao}
          deletando={deletando}
          onToggleExpand={(id) => setClienteAberto(clienteAberto === id ? null : id)}
          onAlterarStatus={alterarStatus}
          onAbrirExclusao={abrirModalExclusao}
        />

        <div className="flex flex-col items-center justify-between gap-3 px-4 py-5 mt-6 border bg-white/80 rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-800 md:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <T>Total filtrado:</T> {totalElements}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 0}
              className="px-4 py-2 text-xs font-bold transition border rounded-xl border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              <T>Anterior</T>
            </button>
            <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={page + 1 >= totalPages}
              className="px-4 py-2 text-xs font-bold transition border rounded-xl border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              <T>Proxima</T>
            </button>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={modalExclusao.open}
        onClose={() => setModalExclusao({ open: false, id: null, nome: "" })}
        onConfirm={() => deletarUsuario(modalExclusao.id)}
        title="Excluir cliente"
        description={`Confirma a exclusao definitiva de ${modalExclusao.nome}?`}
        confirmText="Sim, excluir"
        isLoading={deletando}
      />
    </div>
  );
}

export default ManagerDashboardPage;


