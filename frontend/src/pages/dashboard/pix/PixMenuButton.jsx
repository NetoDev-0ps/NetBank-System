import React from "react";
import T from "../../../shared/ui/Translate";

const PixMenuButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 transition-all group"
  >
    <div className="transition-colors text-slate-500 group-hover:text-blue-500">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
      <T>{label}</T>
    </span>
  </button>
);

export default PixMenuButton;
