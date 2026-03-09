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
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <motion.h3
        variants={itemVariants}
        className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"
      >
        <UserPlus size={18} className="text-brand-primary dark:text-brand-accent" />
        <T>Seus dados</T>
      </motion.h3>

      <motion.div variants={itemVariants} className="grid gap-2 md:grid-cols-2 md:gap-x-4">
        <RegistrationInput
          inputId="register-name"
          icon={User}
          label="Nome completo"
          baseType="text"
          value={form.nome}
          onChange={(event) => onNameChange(event, "nome")}
          placeholder="Digite seu nome completo"
          error={errors.nome}
          autoComplete="name"
        />
        <RegistrationInput
          inputId="register-phone"
          icon={Phone}
          label="Telefone"
          baseType="text"
          value={form.telefone}
          onChange={onPhoneChange}
          placeholder="(00) 00000-0000"
          error={errors.telefone}
          autoComplete="tel"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-2 md:grid-cols-2 md:gap-x-4">
        <RegistrationInput
          inputId="register-cpf"
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
          inputId="register-birthday"
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

      <motion.div variants={itemVariants} className="grid gap-2 md:grid-cols-2 md:gap-x-4">
        <RegistrationInput
          inputId="register-email"
          icon={Mail}
          label="E-mail"
          baseType="email"
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="email@provedor.com"
          error={errors.email}
          autoComplete="email"
        />
        <RegistrationInput
          inputId="register-email-confirm"
          icon={Mail}
          label="Confirmar e-mail"
          baseType="email"
          value={form.confirmarEmail}
          onChange={(event) => onFieldChange("confirmarEmail", event.target.value)}
          placeholder="Repita seu e-mail"
          error={errors.confirmarEmail}
          autoComplete="off"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-2 md:grid-cols-2 md:gap-x-4">
        <div>
          <RegistrationInput
            inputId="register-password"
            icon={Lock}
            label="Crie sua senha"
            baseType="password"
            value={form.senha}
            onChange={(event) => onFieldChange("senha", event.target.value)}
            placeholder="********"
            error={errors.senha}
            isPasswordVisible={showPassword}
            onTogglePassword={onToggleShowPassword}
            autoComplete="new-password"
          />

          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                passwordStrength < 50
                  ? "bg-rose-500"
                  : passwordStrength < 100
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>

          <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            <T>Mínimo de 8 caracteres, com maiúscula, número e símbolo.</T>
          </p>
        </div>

        <RegistrationInput
          inputId="register-password-confirm"
          icon={Lock}
          label="Confirmar senha"
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

      <motion.div variants={itemVariants} className="mt-4">
        <HumanPuzzleCaptcha
          onVerified={onCaptchaVerified}
          refreshSignal={captchaRefresh}
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="nb-card-soft mt-5 flex gap-3 p-3">
        <input
          type="checkbox"
          id="register-terms"
          checked={acceptedTerms}
          onChange={(event) => onAcceptedTermsChange(event.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-primary"
        />
        <label htmlFor="register-terms" className="cursor-pointer text-xs text-slate-600 dark:text-slate-300">
          <T>Li e concordo com a política de privacidade e os termos de uso do NetBank.</T>
        </label>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={acceptedTerms && captchaState.verified && captchaState.proofToken && !loading ? { scale: 1.01 } : {}}
        whileTap={acceptedTerms && captchaState.verified && captchaState.proofToken && !loading ? { scale: 0.98 } : {}}
        type="submit"
        disabled={!acceptedTerms || !captchaState.verified || !captchaState.proofToken || loading}
        className="nb-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-55"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
            <T>Processando...</T>
          </span>
        ) : (
          <T>Solicitar abertura de conta</T>
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