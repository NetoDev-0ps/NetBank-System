import React from "react";
import T from "../../../shared/ui/Translate";

const PixMenuButton = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="nb-card-soft nb-tilt group flex flex-col items-start justify-between gap-4 p-4 sm:p-5 text-left"
  >
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white dark:bg-blue-400/20 dark:text-blue-100 dark:group-hover:bg-blue-300 dark:group-hover:text-slate-900">
      {icon}
    </span>

    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
      <T>{label}</T>
    </span>
  </button>
);

export default PixMenuButton;
