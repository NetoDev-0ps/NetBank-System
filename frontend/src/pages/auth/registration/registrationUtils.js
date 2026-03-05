export const getDatasLimites = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return {
    maxDate: `${ano - 18}-${mes}-${dia}`,
    minDate: `${ano - 120}-${mes}-${dia}`,
  };
};

export const sanitizeLetters = (value) => value.replace(/[^\p{L}\s]/gu, "");

export const formatCpf = (value) => {
  let formatted = value.replace(/\D/g, "");
  formatted = formatted.replace(/(\d{3})(\d)/, "$1.$2");
  formatted = formatted.replace(/(\d{3})(\d)/, "$1.$2");
  formatted = formatted.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  return formatted.slice(0, 14);
};

export const formatPhone = (value) => {
  let formatted = value.replace(/\D/g, "");
  formatted = formatted.replace(/(\d{2})(\d)/, "($1) $2");
  formatted = formatted.replace(/(\d)(\d{4})$/, "$1-$2");

  return formatted.slice(0, 15);
};

export const calculatePasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  return score;
};

export const validateRegistrationForm = ({
  form,
  maxDate,
  minDate,
  passwordStrength,
}) => {
  const errors = {};

  if (form.nome.trim().length < 5 || !form.nome.trim().includes(" ")) {
    errors.nome = "Insira nome e sobrenome";
  }

  if (form.telefone.length < 14) {
    errors.telefone = "Telefone incompleto";
  }

  if (form.cpf.length < 14) {
    errors.cpf = "CPF incompleto";
  }

  if (!form.dataNascimento) {
    errors.dataNascimento = "Data e obrigatoria";
  } else {
    const dataEscolhida = new Date(form.dataNascimento);

    if (dataEscolhida > new Date(maxDate)) {
      errors.dataNascimento = "Apenas maiores de 18 anos";
    }

    if (dataEscolhida < new Date(minDate)) {
      errors.dataNascimento = "Data de nascimento invalida";
    }
  }

  const dominiosPermitidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];
  const partesEmail = form.email.split("@");

  if (partesEmail.length !== 2 || !dominiosPermitidos.includes(partesEmail[1])) {
    errors.email = "Use um e-mail valido (ex: @gmail.com)";
  }

  if (form.email !== form.confirmarEmail) {
    errors.confirmarEmail = "Os e-mails nao conferem";
  }

  if (passwordStrength < 100) {
    errors.senha = "Senha fraca. Siga a regra abaixo.";
  }

  if (form.senha !== form.confirmarSenha) {
    errors.confirmarSenha = "As senhas nao conferem";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};