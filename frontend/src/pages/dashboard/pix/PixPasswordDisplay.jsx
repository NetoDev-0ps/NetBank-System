import React from "react";

const PixPasswordDisplay = ({ value }) => (
  <div className="flex justify-center gap-3 mb-8">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center border-2 rounded-2xl text-xl sm:text-2xl font-black transition-all duration-300 ${
          value[i]
            ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
            : "border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900/50"
        }`}
      >
        {value[i] ? `( ${value[i]} )` : <span className="opacity-20">( )</span>}
      </div>
    ))}
  </div>
);

export default PixPasswordDisplay;
