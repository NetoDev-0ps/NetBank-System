import React from "react";
import PropTypes from "prop-types";
import T from "../../../shared/ui/Translate";
import { statsCards } from "./managerDashboard.constants";

const ManagerStatsGrid = ({ stats }) => (
  <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
    {statsCards.map((item) => (
      <article key={item.key} className="nb-panel">
        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
          {item.icon}
        </div>

        <p className="nb-eyebrow">
          <T>{item.label}</T>
        </p>
        <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{stats[item.key] || 0}</p>
      </article>
    ))}
  </section>
);

ManagerStatsGrid.propTypes = {
  stats: PropTypes.shape({
    ativos: PropTypes.number,
    pendentes: PropTypes.number,
    suspensas: PropTypes.number,
    bloqueadas: PropTypes.number,
    encerradas: PropTypes.number,
  }).isRequired,
};

export default ManagerStatsGrid;
