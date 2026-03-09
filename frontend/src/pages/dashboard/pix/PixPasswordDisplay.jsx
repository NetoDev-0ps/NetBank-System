import React from "react";

const PixPasswordDisplay = ({ value }) => (
  <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`flex h-16 w-12 items-center justify-center rounded-2xl border text-xl font-black transition-all duration-300 sm:h-20 sm:w-14 sm:text-2xl ${
          value[i]
            ? "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-[0_0_20px_rgba(30,77,162,0.2)] dark:border-blue-300 dark:bg-blue-400/20 dark:text-blue-100"
            : "border-slate-300 bg-white/75 text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-600"
        }`}
      >
        {value[i] ? <span>{value[i]}</span> : <span className="opacity-25">*</span>}
      </div>
    ))}
  </div>
);

export default PixPasswordDisplay;
