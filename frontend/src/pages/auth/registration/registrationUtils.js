import { formatBrazilianPhone, hasValidBrazilianDdd, onlyDigits } from "../../../core/utils/brPhone";
import { formatCpf as formatCpfValue } from "../../../core/utils/brCpf";

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

export const formatCpf = (value) => formatCpfValue(value);

export const formatPhone = (value) => formatBrazilianPhone(value).slice(0, 15);

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
    errors.nome = "Informe nome e sobrenome";
  }

  if (form.telefone.length < 14) {
    errors.telefone = "Informe o telefone completo";
  } else {
    const telefoneNumerico = onlyDigits(form.telefone);

    if (!hasValidBrazilianDdd(telefoneNumerico)) {
      errors.telefone = "DDD inválido. Use um DDD brasileiro válido";
    }
  }

  if (form.cpf.length < 14) {
    errors.cpf = "Informe o CPF completo";
  }

  if (!form.dataNascimento) {
    errors.dataNascimento = "Data é obrigatória";
  } else {
    const dataEscolhida = new Date(form.dataNascimento);

    if (dataEscolhida > new Date(maxDate)) {
      errors.dataNascimento = "? necessário ter pelo menos 18 anos";
    }

    if (dataEscolhida < new Date(minDate)) {
      errors.dataNascimento = "Data de nascimento inválida";
    }
  }

  const dominiosPermitidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];
  const partesEmail = form.email.split("@");

  if (partesEmail.length !== 2 || !dominiosPermitidos.includes(partesEmail[1])) {
    errors.email = "Use um e-mail válido (ex: @gmail.com)";
  }

  if (form.email !== form.confirmarEmail) {
    errors.confirmarEmail = "Os e-mails não conferem";
  }

  if (passwordStrength < 100) {
    errors.senha = "Senha fraca. Siga os critérios abaixo.";
  }

  if (form.senha !== form.confirmarSenha) {
    errors.confirmarSenha = "As senhas não conferem";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
