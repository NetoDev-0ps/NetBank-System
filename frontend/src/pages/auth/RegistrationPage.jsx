import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import api from "../../core/api/apiClient";
import Notification from "../../shared/ui/Notification";
import T from "../../shared/ui/Translate";
import RegistrationForm from "./registration/RegistrationForm";
import {
  calculatePasswordStrength,
  formatCpf,
  formatPhone,
  getDatasLimites,
  sanitizeLetters,
  validateRegistrationForm,
} from "./registration/registrationUtils";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
    },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.28 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

function RegistrationPage() {
  const navigate = useNavigate();
  const { maxDate, minDate } = useMemo(() => getDatasLimites(), []);

  const [successModal, setSuccessModal] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaState, setCaptchaState] = useState({ verified: false, proofToken: "" });
  const [captchaRefresh, setCaptchaRefresh] = useState(0);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    email: "",
    confirmarEmail: "",
    senha: "",
    confirmarSenha: "",
  });

  const [errors, setErrors] = useState({});
  const passwordStrength = useMemo(() => calculatePasswordStrength(form.senha), [form.senha]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLettersChange = (event, field) => {
    handleChange(field, sanitizeLetters(event.target.value));
  };

  const handleCpfChange = (event) => {
    handleChange("cpf", formatCpf(event.target.value));
  };

  const handlePhoneChange = (event) => {
    handleChange("telefone", formatPhone(event.target.value));
  };

  const validateForm = () => {
    const result = validateRegistrationForm({
      form,
      maxDate,
      minDate,
      passwordStrength,
    });

    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

    if (!captchaState.verified || !captchaState.proofToken) {
      setGlobalError("Conclua a verificação humana para continuar.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.replace(/\D/g, ""),
        cpf: form.cpf.replace(/\D/g, ""),
        dataNascimento: form.dataNascimento,
        email: form.email.toLowerCase().trim(),
        senha: form.senha,
      };

      await api.post("/usuarios", payload, {
        headers: {
          "X-Captcha-Proof": captchaState.proofToken,
        },
      });

      setSuccessModal(true);
    } catch (error) {
      const backendError = error.response?.data?.erro || error.response?.data;

      if (backendError === "CPF_JA_CADASTRADO") {
        setErrors((prev) => ({ ...prev, cpf: "Este CPF já está cadastrado." }));
        setGlobalError("Já existe uma conta com este CPF.");
      } else if (backendError === "EMAIL_JA_CADASTRADO") {
        setErrors((prev) => ({ ...prev, email: "Este e-mail já está em uso." }));
        setGlobalError("Já existe uma conta com este e-mail.");
      } else if (backendError === "TELEFONE_JA_CADASTRADO") {
        setErrors((prev) => ({ ...prev, telefone: "Este telefone já está em uso." }));
        setGlobalError("Já existe uma conta com este telefone.");
      } else if (backendError === "TELEFONE_DDD_INVALIDO") {
        setErrors((prev) => ({ ...prev, telefone: "DDD inválido. Use um DDD brasileiro válido." }));
        setGlobalError("Telefone com DDD inválido para cadastro no Brasil.");
      } else if (
        backendError === "CAPTCHA_PROOF_AUSENTE" ||
        backendError === "CAPTCHA_PROOF_INVALIDO" ||
        backendError === "CAPTCHA_PROOF_REUTILIZADO" ||
        backendError === "CAPTCHA_PROOF_IP_INVALIDO"
      ) {
        setGlobalError("Refaça a verificação humana para concluir o cadastro.");
      } else {
        setGlobalError("Não foi possível concluir o cadastro agora. Tente novamente.");
      }

      setCaptchaRefresh((value) => value + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nb-page flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence>
        {globalError && (
          <Notification
            message={globalError}
            type="error"
            onClose={() => setGlobalError("")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="nb-card w-full max-w-sm p-7 text-center"
            >
              <CheckCircle2 className="mx-auto mb-5 text-emerald-500" size={62} />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>Conta criada com sucesso</T>
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                <T>Seu cadastro foi enviado para análise. Assim que aprovado, você poderá acessar sua conta.</T>
              </p>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="nb-button-primary mt-6 w-full"
              >
                <T>Voltar para o início</T>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="nb-glass w-full max-w-6xl overflow-hidden"
      >
        <div className="grid lg:grid-cols-[0.95fr,1.05fr]">
          <aside className="nb-mesh-bg p-7 sm:p-8 lg:p-10 text-slate-900 dark:text-white">
            <motion.div variants={itemVariants}>
              <Link to="/home" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent">
                <ChevronLeft size={15} />
                <T>Início</T>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
              <p className="nb-eyebrow"><T>Cadastro NetBank</T></p>
              <h1 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-extrabold leading-tight text-slate-900 dark:text-white">
                <T>Abra sua conta em poucos minutos</T>
              </h1>
              <p className="nb-copy mt-4 max-w-md">
                <T>Preencha seus dados com calma. Nosso fluxo valida cada campo para reduzir erros e trazer segurança desde o primeiro acesso.</T>
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 space-y-3">
              <article className="nb-card-soft p-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  <T>Validação de CPF, e-mail, telefone e idade mínima.</T>
                </p>
              </article>
              <article className="nb-card-soft p-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  <T>Desafio humano para proteger o cadastro contra automação.</T>
                </p>
              </article>
              <article className="nb-card-soft p-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  <T>Fluxo preparado para celular e desktop.</T>
                </p>
              </article>
            </motion.div>

            <motion.img
              variants={itemVariants}
              src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1400&q=80"
              alt="Cliente utilizando aplicativo bancário"
              className="mt-8 h-52 w-full rounded-2xl object-cover border border-slate-200/70 dark:border-slate-700/70"
            />
          </aside>

          <section className="p-6 sm:p-8 lg:p-10">
            <RegistrationForm
              form={form}
              errors={errors}
              minDate={minDate}
              maxDate={maxDate}
              passwordStrength={passwordStrength}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              acceptedTerms={acceptedTerms}
              captchaState={captchaState}
              captchaRefresh={captchaRefresh}
              loading={loading}
              itemVariants={itemVariants}
              onNameChange={handleLettersChange}
              onPhoneChange={handlePhoneChange}
              onCpfChange={handleCpfChange}
              onFieldChange={handleChange}
              onToggleShowPassword={() => setShowPassword((value) => !value)}
              onToggleShowConfirmPassword={() => setShowConfirmPassword((value) => !value)}
              onCaptchaVerified={setCaptchaState}
              onAcceptedTermsChange={setAcceptedTerms}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      </motion.div>
    </div>
  );
}

export default RegistrationPage;