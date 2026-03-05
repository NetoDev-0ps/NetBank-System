import React from "react";
import { Ban, Check, Clock, ShieldAlert, UserCheck, X } from "lucide-react";

export const statusBadgeClass = {
  ATIVA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  PENDENTE: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  SUSPENSA: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  BLOQUEADA: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  RECUSADA: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export const statsCards = [
  {
    key: "ativos",
    label: "Ativas",
    icon: <UserCheck />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "pendentes",
    label: "Pendentes",
    icon: <Clock />,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "suspensas",
    label: "Suspensas",
    icon: <Ban />,
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "bloqueadas",
    label: "Bloqueadas",
    icon: <ShieldAlert />,
    color: "text-red-700 dark:text-red-400",
  },
];

export const mapManagerApiError = (error, fallback) => {
  const code = error.response?.data?.erro;

  switch (code) {
    case "NAO_AUTENTICADO":
      return "Sua sessao expirou. Faca login novamente.";
    case "ACESSO_NEGADO":
      return "Voce nao tem permissao para essa acao.";
    case "CONFLITO_DE_DADOS":
      return "Nao foi possivel concluir por conflito de dados.";
    case "TRANSICAO_STATUS_INVALIDA":
      return "Transicao de status nao permitida para este cliente.";
    default:
      return code || fallback;
  }
};

export const buildStatusActions = (status) => {
  switch (status) {
    case "PENDENTE":
      return [
        { label: "Aprovar", targetStatus: "ATIVA", variant: "approve", icon: <Check size={16} /> },
        { label: "Recusar", targetStatus: "RECUSADA", variant: "reject", icon: <X size={16} /> },
      ];
    case "ATIVA":
      return [
        { label: "Suspender", targetStatus: "SUSPENSA", variant: "warning", icon: <Ban size={16} /> },
        { label: "Bloquear", targetStatus: "BLOQUEADA", variant: "danger", icon: <ShieldAlert size={16} /> },
      ];
    case "SUSPENSA":
      return [
        { label: "Reativar", targetStatus: "ATIVA", variant: "approve", icon: <Check size={16} /> },
        { label: "Bloquear", targetStatus: "BLOQUEADA", variant: "danger", icon: <ShieldAlert size={16} /> },
      ];
    case "BLOQUEADA":
    case "RECUSADA":
      return [];
    default:
      return [];
  }
};
