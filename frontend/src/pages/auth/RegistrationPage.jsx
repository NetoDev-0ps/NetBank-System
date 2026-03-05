import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronLeft } from "lucide-react";
import api from "../../core/api/apiClient";
import WindSense from "../../shared/effects/WindFlowCanvas";
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
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
      setGlobalError("Conclua a verificacao humana para continuar.");
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
        setErrors((prev) => ({ ...prev, cpf: "Este CPF ja esta cadastrado." }));
        setGlobalError("Ja existe uma conta com este CPF.");
      } else if (backendError === "EMAIL_JA_CADASTRADO") {
        setErrors((prev) => ({ ...prev, email: "Este e-mail ja esta em uso." }));
        setGlobalError("Ja existe uma conta com este e-mail.");
      } else if (backendError === "TELEFONE_JA_CADASTRADO") {
        setErrors((prev) => ({ ...prev, telefone: "Este telefone ja esta em uso." }));
        setGlobalError("Ja existe uma conta com este telefone.");
      } else if (
        backendError === "CAPTCHA_PROOF_AUSENTE" ||
        backendError === "CAPTCHA_PROOF_INVALIDO" ||
        backendError === "CAPTCHA_PROOF_REUTILIZADO" ||
        backendError === "CAPTCHA_PROOF_IP_INVALIDO"
      ) {
        setGlobalError("Refaca a verificacao humana para concluir o cadastro.");
      } else {
        setGlobalError("Erro no servidor. Tente novamente.");
      }

      setCaptchaRefresh((value) => value + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-x-hidden font-sans transition-colors duration-500 bg-[#BFCEF5] dark:bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <WindSense />
      </div>

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm p-8 text-center border shadow-2xl bg-slate-900 border-green-500/30 rounded-3xl"
            >
              <CheckCircle className="mx-auto mb-6 text-green-400" size={60} />
              <h2 className="mb-2 text-2xl font-bold text-white">
                <T>Conta Criada!</T>
              </h2>
              <p className="mb-8 text-sm text-slate-400">
                <T>Cadastro enviado para analise profissional.</T>
              </p>
              <button
                onClick={() => navigate("/home")}
                className="w-full py-3 font-bold text-white transition bg-green-600 shadow-lg hover:bg-green-500 rounded-xl shadow-green-900/20"
              >
                <T>Voltar ao Inicio</T>
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
        className="relative z-10 flex flex-col w-full max-w-5xl overflow-hidden border shadow-2xl bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-blue-900/10 dark:border-white/10 rounded-3xl md:flex-row"
      >
        <div className="relative flex flex-col justify-between p-8 overflow-hidden text-white bg-blue-900 dark:bg-blue-900/40 md:w-2/5">
          <motion.div variants={itemVariants} className="relative z-10 flex flex-col h-full">
            <div className="relative z-30">
              <Link to="/home" className="flex items-center gap-1 mb-8 text-blue-100 transition hover:text-white w-max">
                <ChevronLeft size={16} /> <T>Inicio</T>
              </Link>
              <h2 className="mb-2 text-4xl font-extrabold tracking-tight">
                <T>Seja NetBank</T>
              </h2>
              <p className="text-sm text-blue-100/80">
                <T>O banco que fala a sua lingua.</T>
              </p>
            </div>

            <div className="relative flex items-center justify-center flex-1 my-8">
              <motion.img
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
                src="/credit-cards-showcase.png"
                alt="Cartoes NetBank"
                className="w-full max-w-full h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] object-contain z-20 scale-[1.6]"
              />
            </div>

            <div className="relative z-30 mt-auto">
              <h3 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow-md">
                <T>Os melhores limites do mercado.</T>
              </h3>
              <p className="text-sm leading-relaxed text-blue-100/90 drop-shadow-md">
                <T>
                  Abra sua conta agora e desbloqueie um cartao premium com zero anuidade e beneficios exclusivos para o seu estilo de vida.
                </T>
              </p>
            </div>
          </motion.div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/30 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />
        </div>

        <div className="p-8 md:w-3/5 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
        </div>
      </motion.div>
    </div>
  );
}

export default RegistrationPage;