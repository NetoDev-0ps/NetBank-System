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
  inputId,
  ...props
}) {
  const isDate = baseType === "date";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="nb-label pl-1">
        <T>{label}</T>
      </label>

      <div className="relative group">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition"
          />
        )}

        <input
          id={inputId}
          name={inputId}
          type={baseType === "password" && isPasswordVisible ? "text" : baseType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`nb-input ${Icon ? "pl-10" : "pl-4"} ${error ? "!border-rose-400 !ring-rose-300" : ""} ${isDate ? "[color-scheme:light] dark:[color-scheme:dark]" : ""}`}
          {...props}
        />

        {baseType === "password" && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition"
          >
            {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      <div className="min-h-[18px] pl-1">
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400"
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
  inputId: PropTypes.string.isRequired,
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