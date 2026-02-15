import { useState } from "react";
import api from "../../core/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, ChevronLeft, Mail, Calendar, CreditCard, Lock, User, CheckCircle, Eye, EyeOff, Phone
} from "lucide-react"; // Importação do "Star" removida (ESLint Warning resolvido)
import Notification from "../../shared/ui/Notification";

// 1. COMPONENTE DE INPUT CUSTOMIZADO
const InputCustomizado = ({ icone: Icone, label, erro, tipoBase, onToggleSenha, isSenhaVisivel, value, onChange, ...props }) => {
  const isDate = tipoBase === "date";
  return (
    <div className="flex flex-col">
      <label className="block mb-2 ml-1 text-xs font-bold uppercase text-blue-300/60">{label}</label>
      <div className="relative">
        {Icone && <Icone className="absolute left-3 top-3.5 text-blue-300/40" size={18} />}
        <input
          type={tipoBase === "password" && isSenhaVisivel ? "text" : tipoBase}
          value={value}
          onChange={onChange}
          className={`w-full p-3 bg-slate-950/50 border rounded-xl outline-none text-white placeholder-blue-400/30 transition pl-10
          ${erro ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-blue-900/30 focus:ring-2 focus:ring-blue-500'}
          ${isDate ? '[color-scheme:dark]' : ''}`}
          {...props}
        />
        {tipoBase === "password" && (
          <button type="button" onClick={onToggleSenha} className="absolute transition right-3 top-3.5 text-blue-300/60 hover:text-white">
            {isSenhaVisivel ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <div className="min-h-[20px] mt-1 ml-1">
        {erro && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold tracking-wide text-red-500">{erro}</motion.p>}
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const getDatasLimites = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return {
    maxDate: `${ano - 18}-${mes}-${dia}`,
    minDate: `${ano - 120}-${mes}-${dia}`
  };
};

function Cadastro() {
  const navigate = useNavigate();
  const { maxDate, minDate } = getDatasLimites();

  const [modalSucesso, setModalSucesso] = useState(false);
  const [msgErroGlobal, setMsgErroGlobal] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ESTADOS SEPARADOS PARA OS OLHINHOS DA SENHA
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);
  
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [form, setForm] = useState({
    nome: "", telefone: "", cpf: "", dataNascimento: "",
    email: "", confirmarEmail: "", senha: "", confirmarSenha: ""
  });

  const [erros, setErros] = useState({});

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: null }));
  };

  const handleLetrasChange = (e, campo) => {
    const apenasLetras = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    handleChange(campo, apenasLetras);
  };

  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    if (v.length <= 14) handleChange("cpf", v);
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    if (v.length <= 15) handleChange("telefone", v);
  };

  const calcularForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca += 25;
    if (/[A-Z]/.test(senha)) forca += 25;
    if (/[0-9]/.test(senha)) forca += 25;
    if (/[^A-Za-z0-9]/.test(senha)) forca += 25;
    return forca;
  };
  const forcaSenha = calcularForcaSenha(form.senha);

  const validarFormulario = () => {
    const novosErros = {};
    let isValid = true;

    if (form.nome.trim().length < 5 || !form.nome.trim().includes(" ")) {
      novosErros.nome = "Insira nome e sobrenome";
      isValid = false;
    }

    if (form.telefone.length < 14) {
      novosErros.telefone = "Telefone incompleto";
      isValid = false;
    }

    if (form.cpf.length < 14) { novosErros.cpf = "CPF incompleto"; isValid = false; }

    if (!form.dataNascimento) {
      novosErros.dataNascimento = "Data é obrigatória"; isValid = false;
    } else {
      const dataEscolhida = new Date(form.dataNascimento);
      if (dataEscolhida > new Date(maxDate)) { novosErros.dataNascimento = "Apenas maiores de 18 anos"; isValid = false; }
      if (dataEscolhida < new Date(minDate)) { novosErros.dataNascimento = "Data de nascimento inválida"; isValid = false; }
    }

    const dominiosPermitidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];
    const partesEmail = form.email.split("@");
    if (partesEmail.length !== 2 || !dominiosPermitidos.includes(partesEmail[1])) {
      novosErros.email = "Use um e-mail válido (ex: @gmail.com)";
      isValid = false;
    }

    if (form.email !== form.confirmarEmail) { novosErros.confirmarEmail = "Os e-mails não conferem"; isValid = false; }
    if (forcaSenha < 100) { novosErros.senha = "Senha fraca. Siga a regra abaixo."; isValid = false; }
    if (form.senha !== form.confirmarSenha) { novosErros.confirmarSenha = "As senhas não conferem"; isValid = false; }

    setErros(novosErros);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgErroGlobal("");

    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.replace(/\D/g, ""),
        cpf: form.cpf.replace(/\D/g, ""),
        dataNascimento: form.dataNascimento,
        email: form.email.toLowerCase().trim(),
        senha: form.senha
      };

      await api.post("/usuarios", payload);
      setModalSucesso(true);
    } catch (error) {
      setMsgErroGlobal(error.response?.data?.erro || "Erro no servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-x-hidden font-sans bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

      <AnimatePresence>
        {msgErroGlobal && <Notification message={msgErroGlobal} type="error" onClose={() => setMsgErroGlobal("")} />}
      </AnimatePresence>

      <AnimatePresence>
        {modalSucesso && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm p-8 text-center border shadow-2xl bg-slate-900 border-green-500/30 rounded-3xl">
              <CheckCircle className="mx-auto mb-6 text-green-400" size={60} />
              <h2 className="mb-2 text-2xl font-bold text-white">Conta Criada!</h2>
              <p className="mb-8 text-sm text-slate-400">Cadastro enviado para análise profissional.</p>
              <button onClick={() => navigate("/")} className="w-full py-3 font-bold text-white transition bg-green-600 shadow-lg hover:bg-green-500 rounded-xl shadow-green-900/20">
                Voltar ao Início
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col w-full max-w-5xl overflow-hidden border shadow-2xl bg-slate-900/80 backdrop-blur-xl border-white/10 rounded-3xl md:flex-row">

        {/* ========================================= */}
        {/* BANNER LATERAL COM CARTÃO (SLIDE-IN 100%) */}
        {/* ========================================= */}
        <div className="relative flex flex-col justify-between p-8 overflow-hidden text-white bg-blue-900/40 md:w-2/5">
          <motion.div variants={itemVariants} className="relative z-10 flex flex-col h-full">
            
            <div className="relative z-30">
              <Link to="/" className="flex items-center gap-1 mb-8 text-blue-200 transition hover:text-white w-max">
                <ChevronLeft size={16} /> Início
              </Link>
              <h2 className="mb-2 text-4xl font-extrabold tracking-tight">Seja NetBank</h2>
              <p className="text-sm text-blue-200/80">O banco que fala a sua língua.</p>
            </div>

            <div className="relative flex items-center justify-center flex-1 my-8">
              <motion.img 
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
                src="/credit-cards-showcase.png" 
                alt="Cartões NetBank" 
                className="w-full max-w-full h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] object-contain z-20 scale-[1.6]"
              />
            </div>

            <div className="relative z-30 mt-auto">
              <h3 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow-md">Os melhores limites do mercado.</h3>
              <p className="text-sm leading-relaxed text-blue-200/90 drop-shadow-md">
                Abra sua conta agora e desbloqueie um cartão premium com zero anuidade e benefícios exclusivos para o seu estilo de vida.
              </p>
            </div>

          </motion.div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
        </div>

        {/* ========================================= */}
        {/* FORMULÁRIO BLINDADO (POKA-YOKE) */}
        {/* ========================================= */}
        <div className="p-8 md:w-3/5 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} noValidate className="space-y-1">
            <motion.h3 variants={itemVariants} className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
              <UserPlus className="text-blue-400" /> Dados Pessoais
            </motion.h3>

            {/* ADICIONADOS autoComplete PARA FUGIR DOS AVISOS DO CHROME */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <InputCustomizado icone={User} label="Nome Completo" tipoBase="text" value={form.nome} onChange={(e) => handleLetrasChange(e, "nome")} placeholder="Apenas letras..." erro={erros.nome} autoComplete="name" />
              <InputCustomizado icone={Phone} label="Telefone" tipoBase="text" value={form.telefone} onChange={handleTelefoneChange} placeholder="(00) 0 0000-0000" erro={erros.telefone} autoComplete="tel" />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <InputCustomizado icone={CreditCard} label="CPF" tipoBase="text" value={form.cpf} onChange={handleCpfChange} placeholder="000.000.000-00" maxLength={14} erro={erros.cpf} autoComplete="off" />
              <InputCustomizado
                icone={Calendar}
                label="Nascimento"
                tipoBase="date"
                value={form.dataNascimento}
                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                min={minDate}
                max={maxDate}
                erro={erros.dataNascimento}
                autoComplete="bday"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <InputCustomizado icone={Mail} label="Email" tipoBase="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="email@gmail.com" erro={erros.email} autoComplete="email" />
              <InputCustomizado icone={Mail} label="Confirmar Email" tipoBase="email" value={form.confirmarEmail} onChange={(e) => handleChange("confirmarEmail", e.target.value)} placeholder="Repita o email" erro={erros.confirmarEmail} autoComplete="off" />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <div className="flex flex-col">
                <InputCustomizado icone={Lock} label="Senha Segura" tipoBase="password" value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} placeholder="••••••••" erro={erros.senha} isSenhaVisivel={verSenha} onToggleSenha={() => setVerSenha(!verSenha)} autoComplete="new-password" />
                <div className="h-1.5 mt-[-16px] mb-4 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${forcaSenha < 50 ? 'bg-red-500' : forcaSenha < 100 ?
                    'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${forcaSenha}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-[-10px] leading-tight">Mín. 8 caracteres, 1 Maiúscula, 1 Número e 1 Símbolo.</p>
              </div>
              
              {/* SEGUNDO OLHINHO ATIVADO COM NOVO ESTADO E AUTOCOMPLETE */}
              <InputCustomizado icone={Lock} label="Confirmar Senha" tipoBase="password" value={form.confirmarSenha} onChange={(e) => handleChange("confirmarSenha", e.target.value)} placeholder="••••••••" erro={erros.confirmarSenha} isSenhaVisivel={verConfirmarSenha} onToggleSenha={() => setVerConfirmarSenha(!verConfirmarSenha)} autoComplete="new-password" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 p-3 mt-6 border bg-slate-950/50 rounded-xl border-blue-900/20">
              <input type="checkbox" id="termos" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="w-4 h-4 mt-1 text-blue-600 border-blue-800 rounded cursor-pointer bg-slate-900 focus:ring-blue-500" />
              <label htmlFor="termos" className="text-xs leading-relaxed cursor-pointer select-none text-blue-300/70">
                Li e concordo com a Política de Privacidade e os Termos de Uso do NetBank.
              </label>
            </motion.div>

            <motion.button variants={itemVariants} whileHover={aceitouTermos && !loading ? { scale: 1.01 } : {}} whileTap={aceitouTermos && !loading ?
              { scale: 0.98 } : {}} type="submit" disabled={!aceitouTermos || loading} className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg mt-6 ${aceitouTermos && !loading ?
                "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`} >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div> Processando...
                </div>
              ) : "Solicitar Abertura de Conta"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Cadastro;