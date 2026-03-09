import React, { useCallback, useEffect, useState } from "react";
import { LogOut, RotateCcw, Search } from "lucide-react";
import api from "../../core/api/apiClient";
import { useAuth } from "../../core/contexts/AuthContext";
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
  encerradas: 0,
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
    }, 320);

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
          "Falha ao sincronizar usuários com o servidor.",
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
    if (novoStatus === "ENCERRADA") {
      const confirmado = window.confirm(
        "Encerrar esta conta remove o acesso do cliente e mantém apenas a opção de exclusão definitiva. Deseja continuar?",
      );

      if (!confirmado) {
        return;
      }
    }

    try {
      setStatusEmAtualizacao(id);
      await api.patch(`/usuarios/${id}/status`, { status: novoStatus });
      setNotificacao({
        msg: `Status alterado para ${novoStatus}.`,
        type: "success",
      });
      await carregarUsuarios(page);
    } catch (error) {
      setNotificacao({
        msg: mapManagerApiError(error, "Não foi possível atualizar o status."),
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
      setNotificacao({ msg: "Cliente excluído com sucesso.", type: "success" });
      setModalExclusao({ open: false, id: null, nome: "" });
      await carregarUsuarios(Math.max(0, page));
    } catch (error) {
      setNotificacao({
        msg: mapManagerApiError(error, "Não foi possível excluir o cliente."),
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
      <div className="nb-page flex items-center justify-center">
        <div className="nb-card p-6 sm:p-8 flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
            <T>Carregando painel</T>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-page text-slate-800 dark:text-slate-200">
      <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Notification
            message={notificacao.msg}
            type={notificacao.type}
            onClose={() => setNotificacao({ msg: "", type: "" })}
          />
        </div>
      </div>

      <header className="nb-topbar">
        <div className="nb-shell py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="nb-eyebrow"><T>Painel administrativo</T></p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              NetBank Gestão
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {adminInfo.nome} - {adminInfo.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => carregarUsuarios(page)}
              className="nb-button-ghost"
            >
              <RotateCcw size={16} />
              <T>Atualizar</T>
            </button>

            <button
              type="button"
              onClick={() => logout("/home")}
              className="nb-button-danger"
            >
              <LogOut size={16} />
              <T>Sair</T>
            </button>
          </div>
        </div>
      </header>

      <main className="nb-shell py-6 sm:py-8">
        {loadError && (
          <div className="mb-6 rounded-2xl border border-rose-300 bg-rose-100 p-4 text-rose-700 dark:border-rose-800 dark:bg-rose-900/25 dark:text-rose-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="nb-eyebrow !text-rose-600 dark:!text-rose-300"><T>Falha de sincronização</T></p>
                <p className="mt-1 text-sm">{loadError}</p>
              </div>
              <button
                type="button"
                onClick={() => carregarUsuarios(page)}
                className="nb-button-primary !py-2 !px-4"
              >
                <T>Tentar novamente</T>
              </button>
            </div>
          </div>
        )}

        <ManagerStatsGrid stats={stats} />

        <section className="nb-card p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400"
              />
              <input
                id="manager-user-search"
                name="managerUserSearch"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="nb-input pl-12"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarRecusados((valor) => !valor)}
              className="nb-button-secondary"
            >
              <T>{mostrarRecusados ? "Ocultar contas recusadas" : "Mostrar contas recusadas"}</T>
            </button>
          </div>
        </section>

        <ManagerUsersTable
          usuarios={usuarios}
          clienteAberto={clienteAberto}
          statusEmAtualizacao={statusEmAtualizacao}
          deletando={deletando}
          onToggleExpand={(id) => setClienteAberto(clienteAberto === id ? null : id)}
          onAlterarStatus={alterarStatus}
          onAbrirExclusao={abrirModalExclusao}
        />

        <section className="nb-card mt-6 p-4 sm:p-5 flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <T>Total encontrado:</T> {totalElements}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 0}
              className="nb-button-ghost"
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
              className="nb-button-ghost"
            >
              <T>Próxima</T>
            </button>
          </div>
        </section>
      </main>

      <ConfirmationModal
        isOpen={modalExclusao.open}
        onClose={() => setModalExclusao({ open: false, id: null, nome: "" })}
        onConfirm={() => deletarUsuario(modalExclusao.id)}
        title="Excluir cliente"
        description={`Confirma a exclusão definitiva de ${modalExclusao.nome}?`}
        confirmText="Sim, excluir"
        isLoading={deletando}
      />
    </div>
  );
}

export default ManagerDashboardPage;