import React from "react";
import PropTypes from "prop-types";
import T from "../../../shared/ui/Translate";
import { statsCards } from "./managerDashboard.constants";

const ManagerStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
    {statsCards.map((item) => (
      <div
        key={item.key}
        className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200 dark:bg-slate-900 dark:border-slate-800"
      >
        <div className={`mb-3 ${item.color}`}>{item.icon}</div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <T>{item.label}</T>
        </p>
        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
          {stats[item.key] || 0}
        </p>
      </div>
    ))}
  </div>
);

ManagerStatsGrid.propTypes = {
  stats: PropTypes.shape({
    ativos: PropTypes.number,
    pendentes: PropTypes.number,
    suspensas: PropTypes.number,
    bloqueadas: PropTypes.number,
  }).isRequired,
};

export default ManagerStatsGrid;
