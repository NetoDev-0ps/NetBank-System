import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import HumanPuzzleCaptcha from "../../../shared/ui/HumanPuzzleCaptcha";
import T from "../../../shared/ui/Translate";
import RegistrationInput from "./RegistrationInput";

function RegistrationForm({
  form,
  errors,
  minDate,
  maxDate,
  passwordStrength,
  showPassword,
  showConfirmPassword,
  acceptedTerms,
  captchaState,
  captchaRefresh,
  loading,
  itemVariants,
  onNameChange,
  onPhoneChange,
  onCpfChange,
  onFieldChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onCaptchaVerified,
  onAcceptedTermsChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-1">
      <motion.h3 variants={itemVariants} className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-800 dark:text-white">
        <UserPlus className="text-blue-600 dark:text-blue-400" /> <T>Dados Pessoais</T>
      </motion.h3>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <RegistrationInput
          icon={User}
          label="Nome Completo"
          baseType="text"
          value={form.nome}
          onChange={(event) => onNameChange(event, "nome")}
          placeholder="Apenas letras..."
          error={errors.nome}
          autoComplete="name"
        />
        <RegistrationInput
          icon={Phone}
          label="Telefone"
          baseType="text"
          value={form.telefone}
          onChange={onPhoneChange}
          placeholder="(00) 0 0000-0000"
          error={errors.telefone}
          autoComplete="tel"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <RegistrationInput
          icon={CreditCard}
          label="CPF"
          baseType="text"
          value={form.cpf}
          onChange={onCpfChange}
          placeholder="000.000.000-00"
          maxLength={14}
          error={errors.cpf}
          autoComplete="off"
        />
        <RegistrationInput
          icon={Calendar}
          label="Nascimento"
          baseType="date"
          value={form.dataNascimento}
          onChange={(event) => onFieldChange("dataNascimento", event.target.value)}
          min={minDate}
          max={maxDate}
          error={errors.dataNascimento}
          autoComplete="bday"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <RegistrationInput
          icon={Mail}
          label="Email"
          baseType="email"
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="email@gmail.com"
          error={errors.email}
          autoComplete="email"
        />
        <RegistrationInput
          icon={Mail}
          label="Confirmar Email"
          baseType="email"
          value={form.confirmarEmail}
          onChange={(event) => onFieldChange("confirmarEmail", event.target.value)}
          placeholder="Repita o email"
          error={errors.confirmarEmail}
          autoComplete="off"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <div className="flex flex-col">
          <RegistrationInput
            icon={Lock}
            label="Senha Segura"
            baseType="password"
            value={form.senha}
            onChange={(event) => onFieldChange("senha", event.target.value)}
            placeholder="********"
            error={errors.senha}
            isPasswordVisible={showPassword}
            onTogglePassword={onToggleShowPassword}
            autoComplete="new-password"
          />

          <div className="h-1.5 mt-[-16px] mb-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                passwordStrength < 50 ? "bg-red-500" : passwordStrength < 100 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-[-10px] leading-tight">
            <T>Min. 8 caracteres, 1 Maiuscula, 1 Numero e 1 Simbolo.</T>
          </p>
        </div>

        <RegistrationInput
          icon={Lock}
          label="Confirmar Senha"
          baseType="password"
          value={form.confirmarSenha}
          onChange={(event) => onFieldChange("confirmarSenha", event.target.value)}
          placeholder="********"
          error={errors.confirmarSenha}
          isPasswordVisible={showConfirmPassword}
          onTogglePassword={onToggleShowConfirmPassword}
          autoComplete="new-password"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-5">
        <HumanPuzzleCaptcha
          onVerified={onCaptchaVerified}
          refreshSignal={captchaRefresh}
          disabled={loading}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-start gap-3 p-3 mt-6 border bg-blue-50/50 dark:bg-slate-950/50 rounded-xl border-blue-900/10 dark:border-blue-900/20"
      >
        <input
          type="checkbox"
          id="termos"
          checked={acceptedTerms}
          onChange={(event) => onAcceptedTermsChange(event.target.checked)}
          className="w-4 h-4 mt-1 text-blue-600 bg-white border-blue-800 rounded cursor-pointer dark:bg-slate-900 focus:ring-blue-500"
        />
        <label htmlFor="termos" className="text-xs leading-relaxed cursor-pointer select-none text-blue-900/70 dark:text-blue-300/70">
          <T>Li e concordo com a Politica de Privacidade e os Termos de Uso do NetBank.</T>
        </label>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={acceptedTerms && captchaState.verified && captchaState.proofToken && !loading ? { scale: 1.01 } : {}}
        whileTap={acceptedTerms && captchaState.verified && captchaState.proofToken && !loading ? { scale: 0.98 } : {}}
        type="submit"
        disabled={!acceptedTerms || !captchaState.verified || !captchaState.proofToken || loading}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg mt-6 ${
          acceptedTerms && captchaState.verified && captchaState.proofToken && !loading
            ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30"
            : "bg-slate-400 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
            <T>Processando...</T>
          </div>
        ) : (
          <T>Solicitar Abertura de Conta</T>
        )}
      </motion.button>
    </form>
  );
}

RegistrationForm.propTypes = {
  form: PropTypes.shape({
    nome: PropTypes.string,
    telefone: PropTypes.string,
    cpf: PropTypes.string,
    dataNascimento: PropTypes.string,
    email: PropTypes.string,
    confirmarEmail: PropTypes.string,
    senha: PropTypes.string,
    confirmarSenha: PropTypes.string,
  }).isRequired,
  errors: PropTypes.object.isRequired,
  minDate: PropTypes.string.isRequired,
  maxDate: PropTypes.string.isRequired,
  passwordStrength: PropTypes.number.isRequired,
  showPassword: PropTypes.bool.isRequired,
  showConfirmPassword: PropTypes.bool.isRequired,
  acceptedTerms: PropTypes.bool.isRequired,
  captchaState: PropTypes.shape({
    verified: PropTypes.bool,
    proofToken: PropTypes.string,
  }).isRequired,
  captchaRefresh: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  itemVariants: PropTypes.object.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onPhoneChange: PropTypes.func.isRequired,
  onCpfChange: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onToggleShowPassword: PropTypes.func.isRequired,
  onToggleShowConfirmPassword: PropTypes.func.isRequired,
  onCaptchaVerified: PropTypes.func.isRequired,
  onAcceptedTermsChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RegistrationForm;