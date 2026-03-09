import React from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import T from "../../../shared/ui/Translate";
import { buildStatusActions, canDeleteUser, statusBadgeClass } from "./managerDashboard.constants";

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

const isOperableCustomer = (usuario) => {
  const cargo = String(usuario?.cargo || "CLIENTE").toUpperCase();
  return cargo === "CLIENTE";
};

const InfoBox = ({ label, value }) => (
  <div className="nb-card-soft p-3">
    <p className="nb-eyebrow">
      <T>{label}</T>
    </p>
    <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">{value || "-"}</p>
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
    className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${actionVariantClass[variant]}`}
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

const Actions = ({ usuario, operavel, carregandoStatus, deletando, onAlterarStatus, onAbrirExclusao }) => {
  if (!operavel) {
    return (
      <span className="inline-flex rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <T>Somente leitura</T>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
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
      {canDeleteUser(usuario.status) && (
        <ActionButton
          label="Excluir"
          icon={<Trash2 size={16} />}
          onClick={() => onAbrirExclusao(usuario)}
          disabled={carregandoStatus || deletando}
          variant="delete"
        />
      )}
    </div>
  );
};

Actions.propTypes = {
  usuario: PropTypes.object.isRequired,
  operavel: PropTypes.bool.isRequired,
  carregandoStatus: PropTypes.bool.isRequired,
  deletando: PropTypes.bool.isRequired,
  onAlterarStatus: PropTypes.func.isRequired,
  onAbrirExclusao: PropTypes.func.isRequired,
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
  if (usuarios.length === 0) {
    return (
      <section className="nb-card p-8 text-center text-slate-500 dark:text-slate-400">
        <T>Nenhum cliente encontrado.</T>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="space-y-3 lg:hidden">
        {usuarios.map((usuario) => {
          const expanded = clienteAberto === usuario.id;
          const carregandoStatus = statusEmAtualizacao === usuario.id;
          const operavel = isOperableCustomer(usuario);

          return (
            <article key={usuario.id} className="nb-card p-4">
              <button
                type="button"
                onClick={() => onToggleExpand(usuario.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-sm font-black text-white">
                  {usuario.nome?.charAt(0) || "?"}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{usuario.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{usuario.email}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusBadgeClass[usuario.status] || statusBadgeClass.RECUSADA}`}
                    >
                      {usuario.status}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(usuario.saldo || 0)}
                    </span>
                  </div>
                </div>

                <span className="text-slate-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
              </button>

              <div className="mt-3">
                <Actions
                  usuario={usuario}
                  operavel={operavel}
                  carregandoStatus={carregandoStatus}
                  deletando={deletando}
                  onAlterarStatus={onAlterarStatus}
                  onAbrirExclusao={onAbrirExclusao}
                />
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700"
                  >
                    <div className="grid gap-2">
                      <InfoBox label="CPF" value={usuario.cpf} />
                      <InfoBox label="Telefone" value={usuario.telefone} />
                      <InfoBox label="Primeiro login" value={usuario.primeiroLogin ? "SIM" : "NAO"} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 lg:block">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="col-span-4"><T>Cliente</T></div>
            <div className="col-span-2"><T>Status</T></div>
            <div className="col-span-2"><T>Saldo</T></div>
            <div className="col-span-4 text-right"><T>Acoes</T></div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {usuarios.map((usuario) => {
              const expanded = clienteAberto === usuario.id;
              const carregandoStatus = statusEmAtualizacao === usuario.id;
              const operavel = isOperableCustomer(usuario);

              return (
                <div key={usuario.id} className="grid grid-cols-12 items-center gap-2 px-6 py-5 hover:bg-slate-50/90 dark:hover:bg-slate-800/40">
                  <button type="button" onClick={() => onToggleExpand(usuario.id)} className="col-span-4 flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-sm font-black text-white">
                      {usuario.nome?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{usuario.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{usuario.email}</p>
                    </div>
                  </button>

                  <div className="col-span-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusBadgeClass[usuario.status] || statusBadgeClass.RECUSADA}`}
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
                    <Actions
                      usuario={usuario}
                      operavel={operavel}
                      carregandoStatus={carregandoStatus}
                      deletando={deletando}
                      onAlterarStatus={onAlterarStatus}
                      onAbrirExclusao={onAbrirExclusao}
                    />
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="col-span-12 mt-4 border-t border-slate-200 pt-4 dark:border-slate-800"
                      >
                        <div className="grid gap-4 md:grid-cols-3">
                          <InfoBox label="CPF" value={usuario.cpf} />
                          <InfoBox label="Telefone" value={usuario.telefone} />
                          <InfoBox label="Primeiro login" value={usuario.primeiroLogin ? "SIM" : "NAO"} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
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
