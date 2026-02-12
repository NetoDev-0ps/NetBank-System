import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const Motion = motion;
import {
  UserPlus,
  ChevronLeft,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  User,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Notification from "../components/Notification";

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // Cubic Bezier para movimento orgânico
      staggerChildren: 0.05, // Efeito cascata nos inputs
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Cadastro() {
  const navigate = useNavigate();

  const [modalSucesso, setModalSucesso] = useState(false);
  const [msgErro, setMsgErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [emailConfirmacao, setEmailConfirmacao] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [formData, setFormData] = useState({
    cpf: "",
    dataNascimento: "",
    email: "",
    senha: "",
    codigoPromocional: "",
    status: "PENDENTE",
    saldo: 0,
  });

  const mascaraCPF = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  const mascaraData = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1");

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cpf") value = mascaraCPF(value);
    if (name === "dataNascimento") value = mascaraData(value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsgErro("");

    if (formData.senha !== senhaConfirmacao) {
      setLoading(false);
      return setMsgErro("As senhas não coincidem!");
    }
    const nomeCompleto = `${primeiroNome} ${sobrenome}`.trim();
    if (nomeCompleto.split(" ").length < 2) {
      setLoading(false);
      return setMsgErro("Insira nome e sobrenome.");
    }

    try {
      const [d, m, a] = formData.dataNascimento.split("/");
      const payload = {
        ...formData,
        nome: nomeCompleto,
        cpf: formData.cpf.replace(/\D/g, ""),
        dataNascimento: `${a}-${m}-${d}`,
      };
      await api.post("/usuarios", payload);
      setModalSucesso(true);
    } catch (error) {
      setMsgErro(error.response?.data || "Erro no servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 bg-slate-950/50 border border-blue-900/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-blue-400/30 transition pl-10";
  const labelClass =
    "block text-xs font-bold text-blue-300/60 uppercase mb-2 ml-1";

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-x-hidden font-sans bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <AnimatePresence>
        {msgErro && (
          <Notification
            message={msgErro}
            type="error"
            onClose={() => setMsgErro("")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalSucesso && (
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
                Conta Criada!
              </h2>
              <p className="mb-8 text-sm text-slate-400">
                Cadastro enviado para análise profissional.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 font-bold text-white transition bg-green-600 shadow-lg hover:bg-green-500 rounded-xl shadow-green-900/20"
              >
                Voltar ao Início
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
        className="flex flex-col w-full max-w-5xl overflow-hidden border shadow-2xl bg-slate-900/80 backdrop-blur-xl border-white/10 rounded-3xl md:flex-row"
      >
        {/* Banner Lateral */}
        <div className="relative flex flex-col justify-between p-8 overflow-hidden text-white bg-blue-900/40 md:w-2/5">
          <motion.div variants={itemVariants} className="relative z-10">
            <Link
              to="/"
              className="flex items-center gap-1 mb-8 text-blue-200 transition hover:text-white"
            >
              <ChevronLeft size={16} /> Início
            </Link>
            <h2 className="mb-4 text-3xl font-bold">Seja NetBank</h2>
            <p className="text-sm text-blue-200/80">
              O banco que fala a sua língua.
            </p>
          </motion.div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        </div>

        {/* Formulário */}
        <div className="p-8 md:w-3/5 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.h3
              variants={itemVariants}
              className="flex items-center gap-2 mb-6 text-xl font-bold text-white"
            >
              <UserPlus className="text-blue-400" /> Dados Pessoais
            </motion.h3>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="relative">
                <User
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Nome</label>
                <input
                  value={primeiroNome}
                  onChange={(e) => setPrimeiroNome(e.target.value)}
                  className={inputClass}
                  placeholder="Maria"
                  required
                />
              </div>
              <div className="relative">
                <User
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Sobrenome</label>
                <input
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  className={inputClass}
                  placeholder="Silva"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="relative">
                <CreditCard
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>CPF</label>
                <input
                  name="cpf"
                  value={formData.cpf}
                  maxLength={14}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Nascimento</label>
                <input
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  maxLength={10}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="DD/MM/AAAA"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <Mail
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Confirmar Email</label>
                <input
                  type="email"
                  value={emailConfirmacao}
                  onChange={(e) => setEmailConfirmacao(e.target.value)}
                  className={inputClass}
                  placeholder="Repita o email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative">
                <Lock
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Senha</label>
                <input
                  type={verSenha ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute transition right-3 top-9 text-blue-300/60 hover:text-white"
                >
                  {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-9 text-blue-300/40"
                  size={18}
                />
                <label className={labelClass}>Confirmar</label>
                <input
                  type="password"
                  value={senhaConfirmacao}
                  onChange={(e) => setSenhaConfirmacao(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </motion.div>

            {/* Seção de Termos - Aqui usamos o setAceitouTermos e lemos o aceitouTermos */}
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-3 p-3 mt-4 border bg-slate-950/50 rounded-xl border-blue-900/20"
            >
              <input
                type="checkbox"
                id="termos"
                checked={aceitouTermos} // Lendo o valor: Limpa o erro de 'aceitouTermos'
                onChange={(e) => setAceitouTermos(e.target.checked)} // Usando a função: Limpa o erro de 'setAceitouTermos'
                className="w-4 h-4 mt-1 text-blue-600 border-blue-800 rounded cursor-pointer bg-slate-900 focus:ring-blue-500"
              />
              <label
                htmlFor="termos"
                className="text-xs leading-relaxed cursor-pointer select-none text-blue-300/70"
              >
                Li e concordo com a Política de Privacidade e os Termos de Uso
                do NetBank.
              </label>
            </motion.div>

            {/* Botão de Enviar - Usando motion.button para limpar o erro do 'motion' */}
            <motion.button
              variants={itemVariants}
              whileHover={aceitouTermos && !loading ? { scale: 1.01 } : {}}
              whileTap={aceitouTermos && !loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={!aceitouTermos || loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg mt-6 
    ${
      aceitouTermos && !loading
        ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30"
        : "bg-slate-800 text-slate-500 cursor-not-allowed"
    }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                  Processando...
                </div>
              ) : (
                "Solicitar Abertura de Conta"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Cadastro;
