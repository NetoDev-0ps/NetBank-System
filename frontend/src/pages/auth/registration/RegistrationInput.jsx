import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import T from "../../../shared/ui/Translate";

function RegistrationInput({
  icon: Icon,
  label,
  error,
  baseType,
  onTogglePassword,
  isPasswordVisible,
  value,
  onChange,
  placeholder,
  ...props
}) {
  const isDate = baseType === "date";

  return (
    <div className="flex flex-col">
      <label className="block mb-2 ml-1 text-xs font-bold uppercase text-blue-900/60 dark:text-blue-300/60">
        <T>{label}</T>
      </label>

      <div className="relative group">
        {Icon && (
          <Icon
            className="absolute left-3 top-3.5 text-blue-900/40 dark:text-blue-300/40 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition"
            size={18}
          />
        )}

        <input
          type={baseType === "password" && isPasswordVisible ? "text" : baseType}
          value={value}
          onChange={onChange}
          className={`w-full p-3 bg-white/50 dark:bg-slate-950/50 border rounded-xl outline-none text-slate-800 dark:text-white placeholder-blue-900/40 dark:placeholder-blue-400/30 transition pl-10
          ${error ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-blue-900/20 dark:border-blue-900/30 focus:ring-2 focus:ring-blue-500"}
          ${isDate ? "[color-scheme:light] dark:[color-scheme:dark]" : ""}`}
          placeholder={placeholder}
          {...props}
        />

        {baseType === "password" && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute transition right-3 top-3.5 text-blue-900/40 dark:text-blue-300/60 hover:text-blue-600 dark:hover:text-white"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <div className="min-h-[20px] mt-1 ml-1">
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold tracking-wide text-red-600 dark:text-red-500"
          >
            <T>{error}</T>
          </motion.p>
        )}
      </div>
    </div>
  );
}

RegistrationInput.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  baseType: PropTypes.string,
  onTogglePassword: PropTypes.func,
  isPasswordVisible: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

RegistrationInput.defaultProps = {
  icon: null,
  error: "",
  baseType: "text",
  onTogglePassword: undefined,
  isPasswordVisible: false,
  value: "",
  onChange: undefined,
  placeholder: "",
};

export default RegistrationInput;