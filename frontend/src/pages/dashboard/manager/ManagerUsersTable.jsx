import React from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import T from "../../../shared/ui/Translate";
import { buildStatusActions, statusBadgeClass } from "./managerDashboard.constants";

const actionVariantClass = {
  approve:
    "bg-emerald-600/10 border-emerald-600/30 text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-300",
  reject:
    "bg-amber-600/10 border-amber-600/30 text-amber-700 hover:bg-amber-600/20 dark:text-amber-300",
  warning:
    "bg-orange-600/10 border-orange-600/30 text-orange-700 hover:bg-orange-600/20 dark:text-orange-300",
  danger:
    "bg-red-600/10 border-red-600/30 text-red-700 hover:bg-red-600/20 dark:text-red-300",
  delete:
    "bg-rose-600/10 border-rose-600/30 text-rose-700 hover:bg-rose-600/20 dark:text-rose-300",
};

const InfoBox = ({ label, value }) => (
  <div className="p-4 border rounded-2xl bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
      <T>{label}</T>
    </p>
    <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
      {value || "-"}
    </p>
  </div>
);

InfoBox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
};

InfoBox.defaultProps = {
  value: "-",
};

const ActionButton = ({ label, icon, onClick, disabled, variant }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`inline-flex items-center gap-1 px-3 py-2 text-[11px] font-bold transition border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${actionVariantClass[variant]}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

ActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.keys(actionVariantClass)).isRequired,
};

ActionButton.defaultProps = {
  disabled: false,
};

function ManagerUsersTable({
  usuarios,
  clienteAberto,
  statusEmAtualizacao,
  deletando,
  onToggleExpand,
  onAlterarStatus,
  onAbrirExclusao,
}) {
  return (
    <div className="overflow-x-auto bg-white border shadow-sm rounded-3xl border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="min-w-[940px] grid grid-cols-12 gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
        <div className="col-span-4">
          <T>Cliente</T>
        </div>
        <div className="col-span-2">
          <T>Status</T>
        </div>
        <div className="col-span-2">
          <T>Saldo</T>
        </div>
        <div className="col-span-4 text-right">
          <T>Acoes</T>
        </div>
      </div>

      <div className="min-w-[940px] divide-y divide-slate-200 dark:divide-slate-800">
        {usuarios.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <T>Nenhum cliente encontrado.</T>
          </div>
        ) : (
          usuarios.map((usuario) => {
            const carregandoStatus = statusEmAtualizacao === usuario.id;

            return (
              <div
                key={usuario.id}
                className="grid items-center grid-cols-12 gap-2 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <button
                  onClick={() => onToggleExpand(usuario.id)}
                  className="flex items-center col-span-4 gap-3 text-left"
                >
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-black text-white bg-blue-600 rounded-2xl">
                    {usuario.nome?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {usuario.nome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {usuario.email}
                    </p>
                  </div>
                </button>

                <div className="col-span-2">
                  <span
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${statusBadgeClass[usuario.status] || statusBadgeClass.RECUSADA}`}
                  >
                    {usuario.status}
                  </span>
                </div>

                <div className="col-span-2 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(usuario.saldo || 0)}
                </div>

                <div className="col-span-4">
                  <div className="flex justify-end gap-2">
                    {buildStatusActions(usuario.status).map((action) => (
                      <ActionButton
                        key={`${usuario.id}-${action.targetStatus}`}
                        label={action.label}
                        icon={action.icon}
                        onClick={() => onAlterarStatus(usuario.id, action.targetStatus)}
                        disabled={carregandoStatus || deletando}
                        variant={action.variant}
                      />
                    ))}
                    <ActionButton
                      label="Excluir"
                      icon={<Trash2 size={16} />}
                      onClick={() => onAbrirExclusao(usuario)}
                      disabled={carregandoStatus || deletando}
                      variant="delete"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {clienteAberto === usuario.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-12 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800"
                    >
                      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                        <InfoBox label="CPF" value={usuario.cpf} />
                        <InfoBox label="Telefone" value={usuario.telefone} />
                        <InfoBox
                          label="Primeiro login"
                          value={usuario.primeiroLogin ? "SIM" : "NAO"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

ManagerUsersTable.propTypes = {
  usuarios: PropTypes.arrayOf(PropTypes.object).isRequired,
  clienteAberto: PropTypes.number,
  statusEmAtualizacao: PropTypes.number,
  deletando: PropTypes.bool,
  onToggleExpand: PropTypes.func.isRequired,
  onAlterarStatus: PropTypes.func.isRequired,
  onAbrirExclusao: PropTypes.func.isRequired,
};

ManagerUsersTable.defaultProps = {
  clienteAberto: null,
  statusEmAtualizacao: null,
  deletando: false,
};

export default ManagerUsersTable;

