import { formatBrazilianPhone, hasValidBrazilianDdd, onlyDigits } from "../../../core/utils/brPhone";
import { formatCpf as formatCpfValue } from "../../../core/utils/brCpf";

export const safeParseArray = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isValidCpf = (cpf) => {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11 || /(\d)\1{10}/.test(digits)) {
    return false;
  }

  const calcDigit = (base, factor) => {
    let sum = 0;

    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (factor - i);
    }

    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const d1 = calcDigit(digits.slice(0, 9), 10);
  const d2 = calcDigit(digits.slice(0, 10), 11);

  return d1 === Number(digits[9]) && d2 === Number(digits[10]);
};

const hasPhoneTypingHint = (raw) => {
  const value = String(raw || "").trim();

  return (
    value.startsWith("+55") ||
    value.startsWith("55") ||
    value.includes("(") ||
    value.includes(")") ||
    value.includes(" ") ||
    value.includes("-")
  );
};

export const detectPixKeyType = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "UNKNOWN";
  }

  if (raw.includes("@")) {
    return "EMAIL";
  }

  const digits = onlyDigits(raw);

  if (digits.length === 10 && hasValidBrazilianDdd(digits)) {
    return "TELEFONE";
  }

  if (digits.length === 11) {
    if (isValidCpf(digits)) {
      return "CPF";
    }

    if (hasPhoneTypingHint(raw) && hasValidBrazilianDdd(digits)) {
      return "TELEFONE";
    }

    return "CPF";
  }

  return "UNKNOWN";
};

export const formatarPeloTipo = (valor, tipo) => {
  if (!valor) return "";

  const v = onlyDigits(valor);

  if (tipo === "CPF") {
    if (v.length !== 11) return v;
    return formatCpfValue(v);
  }

  if (tipo === "CNPJ") {
    if (v.length !== 14) return v;
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  if (tipo === "TELEFONE") {
    return formatBrazilianPhone(v);
  }

  return valor;
};

export const mascaraInputDinamica = (valor) => {
  const raw = String(valor || "");

  if (/[a-zA-Z@]/.test(raw)) {
    return raw;
  }

  const digits = onlyDigits(raw).slice(0, 11);

  if (!digits) {
    return "";
  }

  const phoneHint = hasPhoneTypingHint(raw);

  if ((digits.length === 10 || digits.length === 11) && phoneHint && hasValidBrazilianDdd(digits)) {
    return formatarPeloTipo(digits, "TELEFONE");
  }

  // Default para 11 digitos: CPF, evitando mascara de telefone indevida.
  if (digits.length <= 11) {
    return formatCpfValue(digits);
  }

  return digits;
};

export const normalizePixKey = (key) => {
  if (!key) return "";

  const raw = String(key).trim();
  if (raw.includes("@")) {
    return raw.toLowerCase();
  }

  return onlyDigits(raw);
};

export const generateTransferIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `pix-${crypto.randomUUID()}`;
  }

  return `pix-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const extractPixApiError = (err, fallback) => {
  const code = err?.response?.data?.erro;

  switch (code) {
    case "NAO_AUTENTICADO":
      return "Sessão expirada. Faça login novamente.";
    case "ACESSO_NEGADO":
      return "Acesso negado para esta operação.";
    case "SENHA_PIX_INVALIDA":
      return "A senha Pix deve ter 4 dígitos.";
    case "CHAVE_NAO_ENCONTRADA":
      return "Chave não encontrada no sistema.";
    case "CHAVE_JA_CADASTRADA_NO_SISTEMA":
      return "Esta chave já está cadastrada no sistema.";
    case "DADOS_NAO_PERTENCEM_AO_USUARIO":
      return "A chave informada não pertence ao usuário autenticado.";
    case "SENHA_PIX_INCORRETA":
      return "Senha Pix incorreta.";
    case "SALDO_INSUFICIENTE":
      return "Saldo insuficiente para esta transferência.";
    case "TRANSFERENCIA_PARA_SI_MESMO_NAO_PERMITIDA":
      return "Não é permitido transferir para você mesmo.";
    case "VALOR_INVALIDO":
      return "Informe um valor maior que zero.";
    case "CONTA_NAO_ATIVA":
      return "A conta de origem ou destino não está ativa.";
    case "IDEMPOTENCY_KEY_EM_USO_COM_OUTRA_OPERACAO":
      return "Chave de idempotência em uso com outra operação.";
    default:
      return code || err?.response?.data?.message || fallback;
  }
};
