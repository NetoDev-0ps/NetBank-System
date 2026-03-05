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

export const formatarPeloTipo = (valor, tipo) => {
  if (!valor) return "";
  const v = String(valor).replace(/\D/g, "");

  if (tipo === "CPF") {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (tipo === "CNPJ") {
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  if (tipo === "TELEFONE") {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return valor;
};

export const mascaraInputDinamica = (valor) => {
  if (/[a-zA-Z@]/.test(valor)) return valor;

  let v = valor.replace(/\D/g, "");

  if (v.length <= 11) {
    v = v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    v = v.substring(0, 14);
    v = v
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  return v;
};

export const normalizePixKey = (key) => {
  if (!key) return "";
  return key.includes("@") ? key.trim() : key.replace(/\D/g, "");
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
      return "Sessao expirada. Faca login novamente.";
    case "ACESSO_NEGADO":
      return "Acesso negado para esta operacao.";
    case "SENHA_PIX_INVALIDA":
      return "A senha Pix deve ter 4 digitos.";
    case "CHAVE_NAO_ENCONTRADA":
      return "Chave nao encontrada no sistema.";
    case "CHAVE_JA_CADASTRADA_NO_SISTEMA":
      return "Esta chave ja esta cadastrada no sistema.";
    case "DADOS_NAO_PERTENCEM_AO_USUARIO":
      return "A chave informada nao pertence ao usuario autenticado.";
    case "SENHA_PIX_INCORRETA":
      return "Senha Pix incorreta.";
    case "SALDO_INSUFICIENTE":
      return "Saldo insuficiente para esta transferencia.";
    case "IDEMPOTENCY_KEY_EM_USO_COM_OUTRA_OPERACAO":
      return "Chave de idempotencia em uso com outra operacao.";
    default:
      return code || err?.response?.data?.message || fallback;
  }
};
